# BBSDoorServer implementation roadmap

This roadmap distinguishes **committed code** from **validated behavior**.

## Milestone 0 — repository and plan

- [x] GitHub repository established.
- [x] Shared-client architecture documented.
- [x] Cross-platform design and infrastructure decisions recorded.
- [x] Basic Node.js session registry, allowlisted game catalog, expiring one-use attach tickets, and unit tests committed.
- [ ] Run `npm test` on an actual supported runtime; validate Windows 32-bit runtime compatibility.

## Milestone 1 — safe transport and session protocol

- [ ] Specify versioned launch, attach, status, and close messages.
- [ ] Implement authenticated, private-interface TCP listener (proposed port 5000).
- [ ] Validate caller identity and enforce per-client permissions and rate limits.
- [ ] Implement terminal byte relay and disconnect/timeout handling with a fake door.
- [ ] Test concurrent sessions, token replay, invalid IDs, and restart cleanup.

## Milestone 2 — Windows execution and dropfiles

- [ ] Verify existing Windows 10 32-bit VM and runtime compatibility.
- [ ] Implement a Windows execution adapter, process lifecycle, and per-node workspaces.
- [ ] Implement and fixture-test `DOOR.SYS`, `DORINFO1.DEF`, and `DOOR32.SYS` as needed.
- [ ] Prove ANSI/CP437 and DOS serial/FOSSIL or equivalent transport.
- [ ] Test a disposable door and then Yankee Trader with backup and concurrency controls.

## Milestone 3 — Mystic BBS connector

- [ ] Verify Mystic 1.12 A48's external door launch and session handoff.
- [ ] Build a connector compatible with the Mystic host OS.
- [ ] Confirm current Mystic user, node, security, and remaining time are conveyed securely.
- [ ] Test normal exit, disconnect, and return to the Mystic menu.

## Milestone 4 — MysticWeb client

- [ ] Add authenticated launch endpoint, relay, and browser terminal.
- [ ] Keep the Door Server private; no browser connection to TCP 5000.
- [ ] Verify shared player/game data across Mystic and MysticWeb and session locking.

## Milestone 5 — Linux backend

- [ ] Define execution adapter interface with cross-platform fixtures.
- [ ] Prototype DOSEMU2 (or another validated runtime) with a disposable door.
- [ ] Verify FOSSIL/terminal compatibility, dropfiles, node isolation, and shared-file behavior.
- [ ] Publish Linux installation notes and per-game compatibility results.

## Not yet implemented

No active listener, authenticated transport, dropfile writer, DOS process runner, Mystic connector, MysticWeb terminal relay, or Linux execution adapter is currently established by the repository foundation.
