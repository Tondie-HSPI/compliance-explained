# AWS Notes

Target deployment shape:

- API service
- worker service
- S3 for documents
- SQS for background jobs
- Postgres for state and auditability

This repo is intentionally prepared for that shape, even though the worker and queue integration are still scaffold-level.

