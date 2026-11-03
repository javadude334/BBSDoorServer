# Terminal configuration utility

Run `npm run config` in the project directory. This interactive numbered menu works in Windows Command Prompt, PowerShell, and Unix terminals without a browser.

Settings are written to `config/server.json` **only when you select Save**. The default listening address is `127.0.0.1`, port `2323`, and maximum sessions `32`. BBS client IDs and game catalog entries are validated.

**Important:** This release only edits and validates configuration. The network listener, SSH authentication, door launching and Hello World door are **not yet implemented**. Do not expose the VM's port to the Internet expecting it to be a secure SSH service. The built-in Hello World catalog entry is disabled and is a placeholder.

Use **Validate** before **Save**. Back up `config/server.json` before replacing an installation. Keep configuration files private.
