# Architecture and session contract v1

Trust boundary: BBS adapter -> authenticated broker -> session allocator ->
drop-file adapter -> supervised door process -> byte-stream transport.
Only the contract validator exists today. No network endpoint accepts requests.

The adapter must authenticate the caller independently, authorize the requested
door, and supply a stable opaque user ID. Never forward BBS passwords. The broker
must authenticate the adapter, reject replay and expired requests, enforce limits,
allocate exclusive nodes, and keep per-session files private before execution.
Caller-provided identity is not proof of authentication.

## JSON request

Exactly these fields are accepted:

| Field | Contract |
|---|---|
| version | Integer 1 |
| session_id | Canonical UUID; future replay/idempotency key |
| bbs_id | 1–64 ASCII letters, digits, underscore or hyphen |
| user_id | Same restricted opaque stable identifier |
| door_id | Same restricted server-side allowlist key |
| time_limit_seconds | Integer 1–3600 |
| terminal | Exactly `ansi` or `ascii` |
| drop_format | `DOOR.SYS`, `DORINFO1.DEF`, or `DOOR32.SYS` |

Paths, commands, node numbers, socket handles and credentials are never accepted
from a client. Unknown fields and duplicate JSON keys are rejected. Format names
express requested future capabilities; validation does not imply support.
Response today: `status=denied`, `reason=execution_not_implemented`.

Future lifecycle: requested -> authorized -> allocated -> prepared -> running ->
completed/failed/timed_out/cancelled. Disconnect/timeout must terminate the entire
process tree, close transport handles and release the node exactly once. Reject
conflicting session IDs; persist enough state to recover safely after crashes.
Avoid logging personal information, drop-file contents or credentials.

## Planned adapters and certification gates

* DOOR.SYS and DORINFO1.DEF: verify each selected door's dialect, encoding, node,
  time and serial/FOSSIL expectations against known fixtures and real executions.
* DOOR32.SYS: verify Win32 handle ownership/inheritance and transport semantics on
  the 32-bit guest; no socket number from an external client is trusted.
* Legacy DOS/FOSSIL: select and validate a runtime/driver on the actual guest.
  Windows bitness alone does not establish compatibility. Test carrier loss,
  terminal output, input, timeouts and clean exit for every supported door.
* Transport: choose an authenticated encrypted protocol, bind only the intended
  private interface and explicitly restrict peers. No listener until configured.
* Filesystem: server-controlled paths, reparse rejection, per-session isolation,
  exclusive allocation and concurrency/crash tests before enabling execution.
* MysticWeb integration: a separate adapter maps its certified identity and
  authorization into this contract. Mystic authentication remains NOT CERTIFIED;
  this project must never bypass that gate or depend on BBS account files.

No deployment or startup changes are part of this initial skeleton.
