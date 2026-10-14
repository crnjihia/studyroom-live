# Changelog

All notable changes to StudyRoom Live will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-10-14

### Initial Release

We are excited to announce the initial release of **StudyRoom Live (v0.1.0)** — a Google-Docs-class, real-time collaborative document platform engineered with mathematical CRDTs for university group assignments and Kenyan higher education (USIU-Africa, University of Nairobi, Strathmore University).

### Features & Architecture Highlights

- **Real-Time CRDT Editor**: TipTap 2 ProseMirror-based rich text editor directly bound to `Y.Doc` and `Y.XmlFragment` for zero merge conflicts.
- **Collaborator Carets & Live Presence**: Live remote cursors, colored caret indicators, and university student affiliation badges (USIU-Africa, University of Nairobi, Strathmore University).
- **Drift-Free Anchored Comments**: Comments anchored to CRDT item coordinates via `Y.RelativePosition`, surviving concurrent insertions and deletions.
- **Milestone Snapshots & Diff Viewer**: 30-second automated autosaves with SHA-256 content deduplication, named version checkpoints, and word-level LCS visual diff preview modal.
- **Full-Stack Light & Dark Mode**: Persistent theme switcher (`studyroom-theme`) with anti-FOUC inline script, custom dark ProseMirror typography, comment highlights, and sleek scrollbars.
- **Offline-Safe Autosave**: Local document caching via `y-indexeddb` with automatic differential synchronization upon reconnection.
- **Multi-Instance Redis Pub/Sub Synchronization**: Scalable awareness synchronization adapter across distributed collaboration server instances.
- **Container Infrastructure & GHCR Distribution**: Production multi-stage Dockerfiles for Next.js web application (`apps/web/Dockerfile`) and Socket.io/Yjs collaboration server (`apps/collab-server/Dockerfile`) with automated GitHub Container Registry (GHCR) multi-arch builds.
- **5-Service Docker Stack**: Complete local and production release deployment bundles (`docker-compose.yml`, `docker-compose.release.yml`) with PostgreSQL 16, Redis 7, Prisma migration runner, collab server, and web client.

[0.1.0]: https://github.com/crnjihia/draftroom-live/releases/tag/v0.1.0
