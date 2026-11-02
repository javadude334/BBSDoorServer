# Networking and firewall plan

**Nothing in the current foundation opens a port.** The following describes the planned configuration, not a live service.

- Proposed listener: **TCP 5000**, configurable.
- Intended use: **private home LAN only**, not a public Internet service.
- Example existing deployment: Door Server `192.168.150.98`; Mystic BBS `192.168.150.59`. These are one operator's addresses, **not defaults for your BBS**.
- Router: **do not forward TCP 5000** from the Internet.
- Firewall: once a server exists, allow only the approved Mystic and MysticWeb relay hosts.
- MysticWeb users should connect to MysticWeb via HTTPS. Their browsers should **not** connect directly to the private Door Server.
- If MysticWeb is hosted outside the LAN, use a private VPN/tunnel with suitable authentication instead of publishing port 5000.

Do not open firewall rules yet. The final guide will include tested, platform-specific steps once the authenticated transport is implemented.
