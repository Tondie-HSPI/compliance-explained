# Queue Plan

To evolve this repo into the HarmonySync-style async architecture:

1. Replace the in-memory queue with SQS
2. Store uploads or parsed payloads in S3
3. Have the worker consume queue messages
4. Persist results in Postgres
5. Serve completed obligation indexes from the API

## Message Shape

```json
{
  "job_id": "uuid",
  "account_role": "reviewer",
  "document_refs": [
    {
      "document_id": "contract-001",
      "document_type": "contract",
      "storage_key": "s3://bucket/key.pdf"
    }
  ]
}
```
