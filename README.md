# dsh-plugin-handoff-pack

**Carry task context — brief, artifacts, decisions, open items and a redacted trace — when switching sessions, machines or tools.**

This is one of 14 read-only observability plugins for the DSH agent lifecycle (theme: **Handoff & Migration Pack**). It reads only metadata from session events — never prompts, tool bodies, or file contents — and makes no network calls.

## Install

```powershell
dsh plugin --profile web add dsh-plugin-handoff-pack
```

Requires Node `^22.19.0 || >=24` and DSH `>=0.2.0-rc.2 <0.3.0`.

## 30-second demo

1. Use DSH normally for a few turns.
2. In any session, type `/handoff`.
3. You get a compact, read-only report; use `/handoff --json` for machine-readable output.

```text
[handoff] 0 artifact(s), 1 decision(s), 1 open item(s)
  brief: task handoff generated from 10 event(s)
  decision: I decided to use the free route and will verify the result. Must not exceed budget.
  open: error
  all values passed through the redactor
```

## What it reads

Session event metadata only: event types, tool names, token counts, and route names. Credential-looking values are redacted before display. No file contents or prompts are read, stored, or transmitted.

## License

MIT — SSHOOTING.
