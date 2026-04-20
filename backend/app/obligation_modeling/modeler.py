import re
from collections import OrderedDict

from app.endorsement_layer.parser import EndorsementParser
from app.rules.loader import load_obligation_rules
from app.schemas.analysis import Obligation, ParsedDocument


class ObligationModeler:
    def __init__(self) -> None:
        self.rules = load_obligation_rules()
        self.endorsements = EndorsementParser()

    def build(self, parsed_documents: list[ParsedDocument]) -> list[Obligation]:
        obligations: list[Obligation] = []
        for document in parsed_documents:
            sections = document.extracted_sections or ([document.markdown] if document.markdown else [])

            for rule in self.rules["obligations"]:
                obligation_type = rule["obligation_type"]
                if obligation_type == "Certificate Holder" and document.certificate_holder_text:
                    obligations.append(
                        Obligation(
                            obligation_type=obligation_type,
                            document_type=document.document_type,
                            requirement=document.certificate_holder_text,
                            source=document.file_name or document.document_id,
                            search_terms=self._build_search_terms(rule, document.certificate_holder_text),
                            confidence=0.92,
                            raw_status="detected",
                            source_excerpt=document.certificate_holder_text,
                            dependency=None
                        )
                    )
                    continue

                if obligation_type == "Additional Coverage Notes" and document.description_box_lines:
                    notes = self._extract_additional_coverage_lines(document.description_box_lines)
                    if notes:
                        notes_text = " | ".join(notes)
                        obligations.append(
                            Obligation(
                                obligation_type=obligation_type,
                                document_type=document.document_type,
                                requirement=notes_text,
                                source=document.file_name or document.document_id,
                                search_terms=self._build_search_terms(rule, notes_text),
                                confidence=0.84,
                                raw_status="detected",
                                source_excerpt="\n".join(notes),
                                dependency=None
                            )
                        )
                        continue

                patterns = rule["patterns"]
                match = self._find_requirement_match(patterns, sections)
                if match is None:
                    obligations.append(
                        Obligation(
                            obligation_type=obligation_type,
                            document_type=document.document_type,
                            requirement=f"{obligation_type} not found",
                            source=document.file_name or document.document_id,
                            search_terms=self._build_search_terms(rule, ""),
                            confidence=0.05 if sections else 0.0,
                            raw_status="missing",
                            source_excerpt="",
                            dependency=None
                        )
                    )
                    continue

                section_text, confidence, status = match
                obligations.append(
                    Obligation(
                        obligation_type=obligation_type,
                        document_type=document.document_type,
                        requirement=self._build_requirement(obligation_type, section_text, status),
                        source=document.file_name or document.document_id,
                        search_terms=self._build_search_terms(rule, section_text),
                        confidence=confidence,
                        raw_status=status,
                        source_excerpt=section_text.strip(),
                        dependency=self._build_dependency(obligation_type, status)
                    )
                )

        return obligations

    def _find_requirement_match(self, patterns: list[str], sections: list[str]) -> tuple[str, float, str] | None:
        best_match: tuple[str, float, str] | None = None

        for section in sections:
            confidence = 0.0
            for pattern in patterns:
                if re.search(pattern, section, re.IGNORECASE):
                    confidence = max(confidence, 0.86)

            if confidence == 0.0:
                continue

            status = (
                "unclear"
                if any(re.search(pattern, section, re.IGNORECASE) for pattern in self.rules["unclear_hints"])
                else "detected"
            )
            if status == "unclear":
                confidence = min(confidence, 0.72)

            if best_match is None or confidence > best_match[1]:
                best_match = (section, confidence, status)

        return best_match

    def _build_requirement(self, obligation_type: str, section_text: str, status: str) -> str:
        if status == "missing":
            if obligation_type == "Waiver of Subrogation":
                return "Not required"
            return f"{obligation_type} not found"

        if obligation_type == "General Liability":
            occurrence = self._extract_limit(section_text, ["each occurrence", "per occurrence", "occurrence"])
            aggregate = self._extract_limit(section_text, ["aggregate", "general aggregate"])
            if occurrence and aggregate:
                return f"{occurrence} / {aggregate}"
            if occurrence:
                return occurrence
            return "GL detected"

        if obligation_type == "Additional Insured":
            parties = self._extract_parties(section_text)
            ai_details = self.endorsements.parse(obligation_type, section_text)
            parts = [", ".join(parties)] if parties else ["AI required"]
            if ai_details:
                parts.append(", ".join(ai_details))
            return " | ".join([part for part in parts if part])

        if obligation_type == "Waiver of Subrogation":
            parties = self._extract_parties(section_text)
            wos_details = self.endorsements.parse(obligation_type, section_text)
            parts = [", ".join(parties)] if parties else ["WOS required"]
            if wos_details:
                parts.append(", ".join(wos_details))
            return " | ".join([part for part in parts if part])

        if obligation_type == "Umbrella / Excess":
            limit = self._extract_limit(section_text, ["umbrella", "excess", "limit"])
            return limit or "Umbrella / Excess detected"

        if obligation_type == "Automobile Liability":
            limit = self._extract_limit(section_text, ["combined single limit", "auto", "automobile"])
            return limit or "Automobile Liability shown"

        if obligation_type == "Workers Compensation":
            if re.search(r"\bstatutory\b", section_text, re.IGNORECASE):
                return "Statutory"
            return "Workers Compensation shown"

        if obligation_type == "Employers Liability":
            each_accident = self._extract_limit(section_text, ["each accident", "e.l. each accident"])
            disease_employee = self._extract_limit(section_text, ["ea employee", "employee"])
            disease_policy = self._extract_limit(section_text, ["policy limit"])
            parts = [part for part in [each_accident, disease_employee, disease_policy] if part]
            return " / ".join(parts) if parts else "Employers Liability shown"

        if obligation_type == "Certificate Holder":
            holder = self._extract_certificate_holder(section_text)
            return holder or "Certificate holder shown"

        if obligation_type == "Additional Coverage Notes":
            return section_text.strip()

        return obligation_type

    def _build_dependency(self, obligation_type: str, status: str) -> str | None:
        if obligation_type == "Additional Insured" and status != "missing":
            return "Requires endorsement confirmation"
        return None

    def _extract_limit(self, section_text: str, nearby_terms: list[str]) -> str | None:
        money_matches = re.findall(r"\$[\d,]+(?:\.\d+)?\s*(?:million|thousand|m)?|\b\d+(?:\.\d+)?\s*million\b", section_text, re.IGNORECASE)
        if not money_matches:
            return None

        lowered = section_text.lower()
        for term in nearby_terms:
            term_index = lowered.find(term.lower())
            if term_index == -1:
                continue
            closest = min(
                money_matches,
                key=lambda match: abs(lowered.find(match.lower()) - term_index) if lowered.find(match.lower()) != -1 else 10**9
            )
            return closest

        return money_matches[0]

    def _extract_parties(self, section_text: str) -> list[str]:
        party_patterns = OrderedDict(self.rules["parties"])
        return [party for party, pattern in party_patterns.items() if re.search(pattern, section_text, re.IGNORECASE)]

    def _extract_certificate_holder(self, section_text: str) -> str | None:
        patterns = [
            r"certificate holder[:\s]+([^\n\r]+)",
            r"holder[:\s]+([^\n\r]+)",
        ]
        for pattern in patterns:
            match = re.search(pattern, section_text, re.IGNORECASE)
            if match:
                return match.group(1).strip(" .:-")

        parties = self._extract_parties(section_text)
        if parties:
            return ", ".join(parties)
        return None

    def _build_search_terms(self, rule: dict, section_text: str) -> list[str]:
        terms: list[str] = list(rule.get("search_terms", []))

        terms.extend(self._extract_parties(section_text))
        terms.extend(self.endorsements.parse(rule["obligation_type"], section_text))

        unique_terms: list[str] = []
        for term in terms:
            if term and term not in unique_terms:
                unique_terms.append(term)
        return unique_terms[:6]

    def _extract_additional_coverage_lines(self, description_box_lines: list[str]) -> list[str]:
        standard_markers = {
            "additional insured",
            "waiver of subrogation",
            "certificate holder",
            "commercial general liability",
            "automobile liability",
            "workers compensation",
            "employers liability",
            "umbrella",
            "excess",
        }
        notes: list[str] = []
        for line in description_box_lines:
            lowered = line.lower()
            if any(marker in lowered for marker in standard_markers):
                continue
            if "$" in line or "liability" in lowered or "passengers" in lowered:
                notes.append(line)
        return notes[:8]
