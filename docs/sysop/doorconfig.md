# DoorConfig — terminal configuration editor

DoorConfig is a **first-stage, text-only** configuration utility for Windows and Linux/Unix. It requires Node.js 18+ and an interactive console. No browser or extra npm packages are required.

## Launch

From the project directory:

```sh
npm run config
```

Or run `node src/doorconfig.cjs` directly. The same command works in Windows PowerShell, Command Prompt, and Unix shells.

Use the **numbered menu** and press Enter to select. Press Enter at a field to keep its current value. Choose **6 Save changes** to write `config/server.json`, or **0 Exit** to save/discard/cancel.

The initial editor supports:
- General: server name, listening address and port, maximum clients, idle timeout.
- Connection settings: intended SSH, Telnet, RLogin enabled flags and ports.
- BBS connections: add/remove BBS names and IDs (metadata only).
- Door games: edit the built-in Hello World game's name, enabled flag, and node limit.
- Validation and saving.

## How configuration is used

The standalone Hello World listener now reads `server.host`, `server.port`, `server.maxClients` and `server.idleSeconds` when it starts. `DOOR_HOST` and `DOOR_PORT` environment variables override the configured host and port. Restart Hello World after changing settings.

SSH/RLogin settings and the game enabled/node fields are **stored only**; they do not yet create listeners, SSH accounts, authentication, or executable game launching. The existing `npm start` still loads the foundation only.

## Configuration files

- Default: `config/server.json`
- Optional path override: `DOOR_CONFIG` environment variable (absolute path recommended)
- On a subsequent save, the previous file is copied to `config/server.json.bak`.
- Writes use a temporary file and rename; validation runs before writing.
- On Unix, the saved file is restricted to owner read/write. Protect the containing directory and do not store passwords in BBS entries.

The configuration file may contain network addresses and BBS names; it should not be committed to a public Git repository. Avoid using it for passwords or private keys.

## Testing

```sh
npm test
```

The test suite covers configuration validation, loading, saving, and backup. Test DoorConfig interactively on the target Windows/Unix consoles as well; it has not yet been exercised on your actual VM.

## Current limitations

This is a numbered console interface, **not yet a full-screen arrow-key Mystic-style editor**. It is intended as a safe starting point for hands-on testing. Future work will add full-screen navigation, contextual help, per-game execution configuration, and secure BBS connector credential management.
