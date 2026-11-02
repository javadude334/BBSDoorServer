# Daily operations (foundation today, service later)

**Currently:** `npm test` runs unit tests and `npm start` prints foundation status. Neither starts a listening service or launches games.

## What a future SysOp should be able to do

- Start/stop/restart the service through Windows Services or systemd without typing development commands.
- Check available games, node capacity and recent errors.
- Review connection logs **without** exposing player passwords or terminal keystrokes.
- Make a backup of game saves and configuration before an update.
- Restore a prior release if a game stops working.
- Enable/disable a door without deleting its game data.
- Diagnose a disconnected Mystic connector or MysticWeb relay.

## Safety checklist

- Keep the proposed TCP 5000 listener **private to the LAN or VPN**; no router port forward.
- Permit only trusted Mystic/relay hosts through the firewall.
- Do not store API keys or credentials in GitHub.
- Avoid running multiple sessions of a DOS game until its locking behavior is proven.
- Test upgrades on a copy of game data first.

These operational controls are planned, **not yet available**.
