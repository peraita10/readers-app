# Readers — Product V1

Community-first reading platform. Node.js 22 + TypeScript microservices, PostgreSQL, React/Vite.

## Domains
- Gateway: public API boundary and JWT verification.
- Identity: registration/login, public profiles, province.
- Catalog: Open Library work normalization/cache.
- Reading: shelves, start/finish dates, half-star ratings, reviews, likes/comments, recommendation seam.
- Community: asymmetric follows, groups, posts, book-club events, challenges, blocks/reports, notifications schema.
- Web: responsive visual shell with dark mode.

## Deliberate V1 boundaries
- No reading-progress percentages/pages.
- No user-facing editions. Open Library Works are normalized to Book.
- Profiles public.
- Messaging intentionally deferred.
- Posts are included because group/community value depends on conversation.
- Recommendations are deterministic now, but the `/recommendations` boundary is designed to be replaced by a ranking/ML service later.
- Location is province-only; event `location` accepts an exact address or maps link.

## Run
1. Copy `.env.example` to `.env` and replace every CHANGE_ME.
2. `pnpm install`
3. `docker compose up postgres`
4. `pnpm dev`
5. Web: http://localhost:5173, Gateway: http://localhost:3000

On a brand-new database volume, migrations run automatically. If you change bootstrap migrations during early development, recreate the volume with `docker compose down -v` (destructive).

## Suggested product names
- Margen — editorial, social, memorable; conversation happens in the margins.
- Pliego — tactile/bookish, distinctive in Spanish.
- Entrelíneas — strongly communicates community and interpretation.
- Lectora — clear and warm, but less ownable.
- Senda — discovery-oriented, broader than books.
- Nexo — community-first, less explicitly literary.
- Folio — international and clean, but crowded as a brand term.

My shortlist: **Margen**, **Pliego**, **Entrelíneas**.
