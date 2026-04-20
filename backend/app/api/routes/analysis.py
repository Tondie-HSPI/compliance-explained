from fastapi import APIRouter, File, Form, UploadFile

from app.schemas.analysis import AnalysisResponse, IntakeRequest, JobEnqueueResponse
from app.services.analysis_service import AnalysisService
from app.services.upload_analysis_service import UploadAnalysisService
from app.workers.queue import InMemoryJobQueue

router = APIRouter(tags=["analysis"])
service = AnalysisService()
upload_service = UploadAnalysisService()
queue = InMemoryJobQueue()


@router.post("/analyze", response_model=AnalysisResponse)
def analyze(payload: IntakeRequest) -> AnalysisResponse:
    return service.run(payload)


@router.post("/analyze/queue", response_model=JobEnqueueResponse)
def enqueue_analysis(payload: IntakeRequest) -> JobEnqueueResponse:
    return queue.enqueue(payload)


@router.post("/analyze-upload", response_model=AnalysisResponse)
async def analyze_upload(
    account_role: str = Form(...),
    files: list[UploadFile] = File(...),
    document_types: list[str] | None = Form(default=None)
) -> AnalysisResponse:
    return await upload_service.run_uploads(account_role=account_role, files=files, document_types=document_types)
