# Worker

This worker is the future async execution boundary for Compliance Explained.

Target responsibilities:

- poll SQS or another queue
- load queued document jobs
- run parsing and extraction
- persist obligation states and export-ready outputs

Current state:

- placeholder heartbeat worker in [worker.py](C:\Users\tondr\OneDrive\Documents\business_helper_ai\compliance-explained-platform\worker\worker.py)
- in-memory queue placeholder in [backend/app/workers/queue.py](C:\Users\tondr\OneDrive\Documents\business_helper_ai\compliance-explained-platform\backend\app\workers\queue.py)

