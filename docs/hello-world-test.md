# Hello World TCP door — Phase 1 smoke test

This is a temporary standalone TCP/Telnet-compatible test door, **not** a DOS door runtime or authenticated production connector. It intentionally does not accept caller identity, launch processes, or access BBS files. Use only on a trusted private LAN.

## Windows door VM

1. Install a compatible Node.js runtime (Node >=18) on the Windows 10 32-bit VM. Confirm with `node --version`.
2. In the repository directory, run `npm test` to verify the existing foundation.
3. In PowerShell, run:
   ```powershell
   $env:DOOR_HOST = "192.168.150.98"
   $env:DOOR_PORT = "5000"
   node src/hello-world-server.cjs
   ```
4. Add a Windows Defender Firewall inbound TCP rule for port 5000 restricted to source IP `192.168.150.59`. Do not forward the port on the router or expose it to the internet.

## Initial connection test

From the Mystic VM, first check network connectivity to `192.168.150.98:5000`, then use a Telnet-capable client to connect. The welcome banner should appear; press Q to disconnect.

## Mystic menu hookup (next validation step)

Configure a Mystic menu command that runs a **local Telnet client** connected to `192.168.150.98` port `5000`, with its stdin/stdout attached to the caller's terminal. Exact Mystic menu command and external program invocation depend on the installed Mystic version, platform and terminal handling; verify them before deploying. Do not use a shell command that takes over the BBS node without restoring the caller session.

## Limitations

This smoke test uses a plain TCP listener with minimal Telnet negotiation filtering. It does not yet provide an authenticated launch protocol, user dropfiles, a terminal bridge, per-node ownership, DOSBox, ANSI capability detection, or true game execution. It must not be exposed outside the trusted LAN. Do not pass passwords or personal data to it.
