# Research: In-Memory Console Todo App (Phase I)

**Branch**: `1-console-todo`
**Date**: 2026-01-07

## Decisions

### Decision: Interactive command-loop CLI (single process)

**Rationale**: Matches Phase I constraints (stdin/stdout only, deterministic behavior) and keeps the
implementation simple and readable.

**Alternatives considered**:
- One-shot command execution (e.g., `todo add ...` per process invocation): more scriptable but less
  aligned with the provided flow (loop until exit).

### Decision: Stable, session-scoped integer IDs (monotonic)

**Rationale**: IDs must be stable within a session and predictable for deterministic behavior. A
monotonic integer counter is easy to reason about and avoids collisions.

**Alternatives considered**:
- UUIDs: stable but less human-friendly for a console demo and harder to type.
- Using list index as ID: becomes unstable after deletions.

### Decision: Output format is line-oriented and consistent

**Rationale**: The key reviewer goal is deterministic CLI behavior. Use consistent prefixes and a
consistent table/list layout so output is stable across runs.

**Alternatives considered**:
- Free-form print messages: easier initially but becomes inconsistent quickly.

### Decision: “Help-first” on startup

**Rationale**: The requested flow includes “Display help” at startup. This also helps reviewers
immediately see the contract.

**Alternatives considered**:
- Silent startup: smaller output but less discoverable.

## Open Questions

None. The feature spec plus user-provided /sp.plan input are sufficiently precise for Phase I.
