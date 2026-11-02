# BBSDoorServer — System Operator Guide

**Audience:** BBS SysOps who want to host classic door games without learning web development or writing Node.js code.

> **Current status (November 2026):** This project is a **foundation/prototype**, not a playable door server. A standalone Hello World TCP test listener is available on the feature branch, but there is no DOS launcher, dropfile writer, Mystic connector, MysticWeb terminal, or Linux execution adapter. The commands below only test the foundation.

## Hello World prototype installation

For the Windows 10 32-bit door-server VM, follow the [Windows Hello World installation guide](windows-hello-world.md) to install Git and Node.js, clone the prototype, run tests, and start the listener. Note that current Node.js Windows x86 support is limited; check compatibility before installing.

For Linux and other Unix-like hosts, follow the [Unix/Linux Hello World installation guide](unix-hello-world.md) for prerequisites, cloning, testing, network restrictions, and troubleshooting.

## Start here

1. [What the Door Server does](overview.md) — the purpose and the parts involved.
2. [Downloading the project and understanding GitHub](github-basics.md).
3. [Safe first test](first-test.md) — test the foundation without opening a port or launching a game.
4. [Networking and safety](networking.md) — private port 5000 and firewall planning.
5. [Common terms and troubleshooting](troubleshooting.md).

6. [Windows and Linux installation plans](installation-plans.md) — planned beginner setup flow.
7. [Adding door games](adding-door-games.md) — required settings and dropfile formats.
8. [Daily operations](daily-operations.md) — planned start/stop, backup, upgrade and recovery procedures.

Developers and advanced operators can read the [planning hub](../README.md) and [roadmap](../roadmap.md). The Windows and Linux installation guides will be added **after** the corresponding runtimes and door execution have been verified.

## Documentation commitments

- Separate step-by-step Windows and Linux instructions, including prerequisites, screenshots, setup, upgrades, backups, and uninstall.
- A simple per-game setup guide with supported dropfiles and compatibility notes.
- No GitHub knowledge required for normal installation once a packaged release exists.
- No claims that a door or OS runtime works until it has been tested.
