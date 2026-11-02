# BBSDoorServer

An independent BBS door server intended to run legacy DOS doors for both traditional Mystic BBS and MysticWeb.

## Current state

**Foundation only — no network service, game launcher, or terminal transport is active.** The project currently includes a dependency-free Node.js session registry, validated public game metadata, capacity controls, expiring one-use attach tickets, and tests. Launch requests must eventually come from a trusted authenticated connector; the registry is not an authorization system by itself.

```powershell
npm test
npm start
```

`npm start` only loads the disabled example catalog and prints status; it does not open ports or execute games.

## Target installation

The existing Windows 10 32-bit VM is the intended game execution host. Compatibility of a Node.js runtime, DOS execution environment, FOSSIL/serial bridge, and each door must be verified on that machine before activation.

## Shared clients

- Mystic BBS uses a local terminal connector.
- MysticWeb uses an embedded browser terminal and an authenticated relay.
- The Door Server owns game-specific dropfiles, node allocation, execution, session cleanup, and shared game data.

## Planning documents

**[Door Server planning hub](docs/README.md)** is the canonical entry point for our decisions, infrastructure notes, cross-platform strategy, open questions, and milestone checklist.

See also [shared-client architecture](docs/shared-client-architecture.md). The example catalog under `config/` is disabled by default.
