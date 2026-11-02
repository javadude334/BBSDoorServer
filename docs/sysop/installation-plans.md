# Installation plans for Windows and Linux

**Not a working installation procedure yet.** The repository currently provides a testable Node.js foundation, but no game execution or listener.

## Windows — primary target

The first validated installation will target the existing **Windows 10 32-bit VirtualBox VM**. Before publishing an installer, the project must verify a supported Node.js/runtime build, actual DOS program execution, communication/FOSSIL handling, and Windows service startup.

Planned SysOp installation experience:

1. Download a release ZIP or installer; **Git is not required**.
2. Run a prerequisite checker that identifies Windows version, 32-bit support, and available DOS runtime.
3. Choose an installation directory and game data directory. Do not overwrite existing game saves.
4. Select a private LAN listening address and a configurable port (initial proposal: TCP 5000).
5. Configure a trusted Mystic connector and, optionally, a MysticWeb relay.
6. Add games using a guided catalog editor, selecting the dropfile and DOS runtime profile.
7. Run a disposable test door before enabling real games.
8. Configure automatic startup, backups, logs, and safe updates.

The existing example VM has been discussed with `D:\DoorServer`, but **that is not a required directory for other SysOps**.

## Linux — later backend

Use the **same codebase** and a Linux-specific DOS execution adapter (candidate: DOSEMU2). The guide will document tested distributions, packages, permissions, terminal/FOSSIL integration, service startup, and compatible games. A Linux runtime is **not** yet implemented or verified.

## Maintenance chapters to publish after validation

- Start, stop, restart and check status.
- Add/remove games and safely edit per-game settings.
- Back up player/game data, session configuration and secrets.
- Upgrade/rollback without deleting saved games.
- Diagnose connection failures and per-game compatibility.
- Uninstall without deleting shared data unless explicitly requested.

For now, follow [Safe first test](first-test.md) to test the non-network foundation only.
