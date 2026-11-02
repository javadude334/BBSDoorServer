# Adding and configuring door games (planned workflow)

**Status:** The game launcher and dropfile generator are not implemented. This is a design guide for future SysOps, not a working procedure.

## What the server will need for each game

- A short game ID and friendly display name.
- A server-approved executable or launcher profile.
- The game installation/data directory.
- Required dropfile format: `DOOR.SYS`, `DORINFO1.DEF`, `DOOR32.SYS`, or a documented game-specific variant.
- Terminal mode (ANSI/CP437) and serial/FOSSIL/stdio transport requirements.
- Number of simultaneous sessions allowed, based on actual game locking behavior.
- A backup plan for player files and saved games.

The server, **not Mystic or MysticWeb**, will create the game-facing dropfiles. The Mystic connector may use its own `DOOR32.SYS` handoff; that does not determine what the DOS game receives.

## Existing example configuration

`config/games.example.json` currently contains a **disabled** Yankee Trader entry with `id`, `name`, `enabled`, and `maxSessions`. These are the only currently validated catalog fields. It is **not yet** a complete executable game profile.

Do not turn `enabled` on expecting a door to launch: `npm start` currently opens no port and runs no games.

## First supported game

Yankee Trader is a candidate pilot, but the executable, DOS runtime, dropfile format, and concurrency rules must be verified before publishing a tested recipe. The first validation should use a disposable test door, with backed-up data and single-session limits.

Future versions will provide tested game recipes and a beginner-friendly configuration wizard.
