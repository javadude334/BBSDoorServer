# BBSDoorServer — Terms and troubleshooting

| Term | Meaning |
| --- | --- |
| **SysOp** | BBS system operator |
| **Door game** | A separate game/program launched from the BBS |
| **Dropfile** | File passing caller/session information to a door |
| **FOSSIL** | DOS-era serial communications interface used by many doors |
| **Node** | An individual caller/game session |
| **Node.js** | Runtime for the Door Server's shared application code |
| **npm** | Tool for running project commands and installing packages |
| **GitHub** | Website hosting source code and updates |
| **Port 5000** | Proposed private Door Server network port; not active yet |

## Common questions

- **Why doesn't `npm start` open a game?** It is currently a foundation smoke test only.
- **Why can't Mystic connect?** The network listener and Mystic connector are not yet implemented.
- **Will it run on Windows 10 32-bit?** The actual Node.js/runtime and DOS game compatibility must be verified first.
- **Will it run on Linux?** Linux execution support is planned, not implemented.
- **What if a game requires `DOOR.SYS`?** Generating compatible dropfiles is a planned server responsibility, not yet an implemented feature.
- **Should I open TCP 5000 on my router?** No. The plan is to keep that port private.

When asking for help, include the operating system, runtime version, exact command, and sanitized error message. Never post access tokens, player data, or private network credentials.
