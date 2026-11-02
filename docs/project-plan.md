# BBSDoorServer — Project plan and decision record

Updated: 2026-11-02. This records the decisions discussed for the Door Server project. It is a **plan**, not a claim that the features are implemented.

## Vision

**One Door Server, multiple BBS frontends, one shared collection of legacy door games.** Host DOS doors independently from the BBS software. Traditional Mystic BBS and MysticWeb should launch the same installed games and share their player/game data, subject to game-specific locking and multiplayer capabilities. The server should be reusable by other BBS platforms in the future.

## Agreed architecture

1. The Door Server is an independent service, not a MysticWeb subsystem.
2. Traditional Mystic BBS invokes a **Mystic-side connector** from its door menu. The connector uses Mystic's existing authenticated session and relays terminal input/output. No second user login.
3. MysticWeb uses an embedded browser terminal (for example, xterm.js) with a server-side authenticated relay; the browser does not run DOS binaries.
4. The Door Server validates launch authorization, allocates nodes, creates per-session working directories, generates **all game-specific dropfiles**, launches the configured game, relays terminal I/O, enforces timeouts, and cleans up.
5. Mystic may use `DOOR32.SYS` to hand session metadata to its connector **if supported by the installed Mystic 1.12 A48 configuration**. The connector-to-server protocol is independent of dropfile formats. A socket/handle in Mystic's local dropfile cannot be reused directly by a process on another machine.
6. The Door Server produces the format required by each game: `DOOR.SYS`, `DORINFO1.DEF`, `DOOR32.SYS`, or other supported formats. Games should not need to know whether the caller came from Mystic or MysticWeb.
7. A game catalog defines allowlisted games, execution profiles, dropfile formats, concurrency limits, and data directories. Client requests never specify executable paths.
8. Games and save files can be shared, but simultaneous use is permitted only when the game and storage locking semantics have been verified.

## Existing home-network infrastructure

These values were established in earlier project discussions; **reconfirm before configuring or opening a listener**.

| Component | Planned/existing value |
| --- | --- |
| Legacy door host | Existing VirtualBox Windows 10 **32-bit** VM |
| Door host name | `DOORS` |
| Door host LAN address | `192.168.150.98` |
| Door Server directory | `D:\DoorServer` |
| Existing startup script | `D:\DoorServer\startdoors.cmd` |
| Existing startup registry entry | `StartDoors` |
| Mystic host name | `BBS` |
| Mystic host LAN address | `192.168.150.59` |
| Proposed Door Server listener | Configurable **TCP 5000**, LAN only |
| Internet/router | **No public port forward** for TCP 5000 |

TCP 5000 is a **proposed** port, not currently opened by the committed foundation. Windows Firewall should allow only approved client/relay addresses. If MysticWeb runs off-LAN, use a private tunnel/VPN rather than exposing the Door Server publicly. The web browser connects to MysticWeb, not directly to the LAN-only door listener.

## Cross-platform decision

**One GitHub repository and one shared codebase for Windows and Linux.** Keep networking, session/authentication, game definitions, node management, dropfile formatting, and protocol logic cross-platform. Use a narrow runtime/terminal adapter boundary for platform-specific execution.

- **Phase 1:** Existing Windows 10 32-bit VM. Prove actual 16-bit DOS execution and FOSSIL/serial or equivalent terminal transport; do not assume all DOS games work natively.
- **Phase 2:** Linux backend, likely using DOSEMU2 or another validated runtime. Compatibility is per game. Earlier Linux DOS door attempts were difficult, so document a repeatable known-good configuration rather than promising universal support.
- **Future possibility, not committed scope:** A controller dispatching to workers on multiple operating systems.

Node.js was chosen for the initial shared foundation, but **the Node.js version/runtime must be tested for compatibility with Windows 10 32-bit** before deployment. The platform-specific adapter must not leak OS assumptions into the client protocol.

## Game pilot

Yankee Trader is a candidate for the first real legacy DOS door. The exact version, executable invocation, required dropfile(s), serial/FOSSIL requirements, and licensing are **not yet verified**. Start with a disposable test door or emulator harness, then validate Yankee Trader. Back up existing game data before any integration test.

## Security and operational requirements

- Authenticated, scoped client connections; opaque, expiring, one-use terminal attach tickets.
- Bind to a private interface; allowlist approved BBS/relay hosts; no public Door Server port.
- No browser-provided identity, security level, executable paths, or unlimited time allowances.
- Per-game concurrency policy, node isolation, graceful exit, disconnect cleanup, time limits, and logging without secrets or terminal keystrokes.
- Game-specific dropfiles generated server-side from validated session data.
- No separate user database for door logins.
- Keep traditional Mystic usable when MysticWeb is down, and vice versa.

## Open questions / validation needed

1. Exact Mystic 1.12 A48 menu command and dropfile generation / terminal handoff behavior.
2. Operating system and architecture of the Mystic BBS host, to choose a compatible connector binary/script.
3. Windows VM's available DOS execution mechanism, FOSSIL driver and communication bridge.
4. Confirm LAN addressing, existing `startdoors.cmd`, startup behavior, and firewall configuration.
5. Verify Node.js build/runtime support on the 32-bit Windows VM, or choose a compatible packaged runtime.
6. Select a concrete authenticated protocol for both connector and web relay; confirm LAN transport protection.
7. Determine each game's dropfile fields, codepage, command line, and safe shared-file locking behavior.
8. Select Linux execution runtime after a focused compatibility spike.

## Change policy

When a decision changes, update this document and the [roadmap](roadmap.md) in the same commit. Record uncertainty explicitly. Do not silently replace the existing Windows VM with Linux or treat an untested proposal as deployed.
