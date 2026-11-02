# BBSDoorServer

**Bring classic BBS door games back to life.**

BBSDoorServer is an open-source project to host BBS door games on a separate computer and make them available to Mystic BBS and, eventually, other BBS software and MysticWeb.

> **Early development — not production-ready.** A standalone Hello World TCP test door is available in [draft PR #2](https://github.com/javadude334/BBSDoorServer/pull/2) on the `feature/hello-world-door` branch. It is **not yet callable from a Mystic menu**, and it does **not** run DOS doors. The default `main` branch contains only the foundation.

## 👋 New SysOp? Start here

You do **not** need to know Node.js or GitHub to read the guides. Start with the [SysOp Guide](docs/sysop/README.md), which explains the project in plain language.

| Your computer | Step-by-step setup |
| --- | --- |
| **Windows** | [Windows 10 32-bit Hello World installation](docs/sysop/windows-hello-world.md) |
| **Linux / Unix** | [Unix/Linux Hello World installation](docs/sysop/unix-hello-world.md) |

**Important:** These two installation guides currently live on the `feature/hello-world-door` branch. If a link above is unavailable from `main`, use the [Windows guide on the feature branch](https://github.com/javadude334/BBSDoorServer/blob/feature/hello-world-door/docs/sysop/windows-hello-world.md) or the [Unix/Linux guide on the feature branch](https://github.com/javadude334/BBSDoorServer/blob/feature/hello-world-door/docs/sysop/unix-hello-world.md).

## What works today?

- Dependency-free Node.js foundation with a game catalog, session registry, capacity limits, expiring one-use attach tickets, and tests on `main`.
- On the development branch: a LAN-only Hello World TCP listener, basic Telnet negotiation, Q-to-exit, and a network integration test.

## What's coming next?

1. Mystic BBS terminal connector and menu integration.
2. Authenticated session handoff and cleanup.
3. DOS execution, dropfile generation, and integrated FOSSIL compatibility.
4. Linux execution adapter and additional BBS integrations.

**Telnet, SSH, and RLogin callers:** the long-term design is for Mystic to retain the caller connection and bridge terminal I/O to the door server. The prototype itself does not provide SSH or RLogin listeners.

## For developers

- [Planning hub](docs/README.md)
- [Shared-client architecture](docs/shared-client-architecture.md)
- [Roadmap](docs/roadmap.md)
- [Draft Hello World pull request](https://github.com/javadude334/BBSDoorServer/pull/2)

To run the current foundation tests:

```sh
npm test
```

The prototype uses Node.js 18+ but modern supported Windows x86 builds may be unavailable. Check the platform-specific installation guide before selecting a runtime.

## Help and feedback

Report problems or compatibility requests through [GitHub Issues](https://github.com/javadude334/BBSDoorServer/issues). Include your operating system, Mystic version, and the steps to reproduce the issue. Never post passwords or connection secrets.

This repository is public. Game software and third-party DOS drivers are not included; verify licensing before installing or redistributing them.
