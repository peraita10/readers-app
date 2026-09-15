# Architecture
The V1 keeps five coarse-grained deployable boundaries. Each domain owns its database. Cross-domain foreign keys are intentionally absent; IDs are references, not relational constraints across services. Gateway authenticates JWTs and forwards only `x-user-id` internally. This is simple enough for V1 while preserving future independent deployment.

Future seams: OAuth provider adapters in Identity; recommendation/ranking service behind Reading; event video-provider adapter in Community; asynchronous event bus/outbox when cross-service activity volume justifies it; object storage for avatars/group media; Redis only when caching/rate-limiting needs are measured.
