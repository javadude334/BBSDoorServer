# Shared-client door server architecture (design)

Status: **design contract, not implemented or validated**.

## Goal

One independent Windows 32-bit Door Server hosts original DOS doors for both traditional Mystic BBS and MysticWeb. Game installations and player data are shared, subject to each game's locking and concurrency rules. The server must remain usable when either client is offline.

## Client paths

- **Mystic BBS**: Mystic launches a local connector from its normal door menu. The connector receives a Mystic-generated session handoff (potentially `DOOR32.SYS`, pending verification of Mystic 1.12 A48's exact launch behavior), establishes an authenticated Door Server session, and relays the caller's existing terminal input/output. The original BBS terminal stays the UI.
- **MysticWeb**: After normal Mystic-backed authentication, MysticWeb obtains a short-lived, one-use launch ticket from a server-side adapter. The browser connects to a WebSocket terminal relay using that ticket. A JavaScript ANSI/CP437 terminal displays the game; it does **not** execute DOS code in the browser.

## Door Server responsibilities

1. Verify trusted client identity and authorized launch tickets; never trust browser-supplied user ID, security level, time allowance, or executable path.
2. Resolve an allowlisted game ID to a server-owned game definition and executable profile.
3. Allocate an available node and exclusive session working directory.
4. Create the door's required dropfiles (`DOOR.SYS`, `DORINFO1.DEF`, `DOOR32.SYS`, etc.) **on the Door Server**, based on verified session metadata. These formats are door-facing, not the cross-machine protocol.
5. Launch the door using the configured Windows DOS/runtime and required serial/FOSSIL/stdio bridge; compatibility is game-specific and must be proven.
6. Relay bidirectional terminal bytes without interpreting them as commands. Enforce idle, absolute time, disconnection, and process cleanup.
7. Preserve shared game data, with per-game concurrency policy and file-locking validation before simultaneous Mystic and MysticWeb launches.

## Proposed protocol boundaries

- **Launch**: trusted client -> Door Server: game ID, opaque authenticated caller identity, node/session metadata, capabilities and bounded time allowance. Server returns an opaque session ID and a short-lived attach ticket. Define exact transport and payload version after a prototype.
- **Attach**: terminal connector -> Door Server: one-use ticket; streams output bytes and input bytes; close/exit reason. A dropped browser connection must not leave an orphaned DOS process.
- **Status**: available games, supported terminal profile, current capacity, and session state. Expose only public metadata to unauthenticated clients.
- **Audit**: record launch/exit/status without passwords, dropfile secrets, terminal keystrokes, or message content.

## Ownership boundaries

- Mystic / MysticWeb: authenticate the BBS user and enforce their own menu or launch eligibility; transport terminal bytes.
- Door Server: independently verify launch authorization, allocate resources, generate **all door-facing dropfiles**, run the games, manage game state and sessions.
- Game: owns its native player/save data; never assume it supports simultaneous writes.

## First interoperability test

Use a disposable game or test door on the existing 32-bit Windows VM. Validate terminal input/output, ANSI and CP437, dropfile fields, user identity, node allocation, normal exit, forced disconnect, and concurrent-client rejection. Then test a real DOS door, including saved-game persistence. Do not change live shared game data until backup and locking behavior are verified.

## Explicit non-goals for the first version

- No dependency on MysticWeb to run Mystic-originated doors.
- No second BBS user database.
- No requirement to run DOS emulation on the web host.
- No arbitrary executable launch requests from clients.
- No assumption that a Mystic-side `DOOR32.SYS` socket handle can be transferred to the Windows VM.
