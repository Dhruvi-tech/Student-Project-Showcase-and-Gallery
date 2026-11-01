# S3 Storage Implementation

The API's `/api/v1/assets` endpoint accepts JPEG, PNG, GIF, and WebP only after signature validation and a 5 MiB size limit. It writes opaque owner-scoped keys under `projects/<owner>/` using the standard boto3 credential chain, private cache settings, and AES256 server-side encryption. Retrieval validates the key pattern and returns a five-minute presigned redirect.

When `S3_BUCKET_NAME` is empty, both upload and retrieval fail safely with `503`; no fallback object is fabricated. A future approved bucket must retain Block Public Access and encryption, use private objects, and attach only the scoped task-role policy. No bucket, upload, ACL, or policy change was made for this submission.
