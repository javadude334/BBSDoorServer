# What is BBSDoorServer?

BBSDoorServer aims to run classic DOS door games independently of your BBS program. The same installed game could eventually be launched by traditional Mystic BBS or MysticWeb, with the Door Server managing player sessions and shared game data.

## How it is intended to work

1. A caller selects a game in Mystic or MysticWeb.
2. The frontend securely passes the authenticated player's session to the Door Server.
3. The Door Server chooses an available game node, creates the dropfile the game needs, launches the game, and relays the caller's terminal.
4. When the game ends, the caller returns to the BBS.

**Dropfiles** are small files that tell DOS doors about the caller, node, and time remaining. Different games may require `DOOR.SYS`, `DORINFO1.DEF`, or `DOOR32.SYS`. The Door Server—not the BBS frontend—will generate the game-facing files.

## Windows and Linux

The plan is **one shared codebase** with platform-specific game-execution adapters. The first target is an existing Windows 10 32-bit virtual machine; Linux/DOSEMU2 support is planned later. Neither platform is yet validated for live door execution.

## What is available now?

The repository contains Node.js session-management foundation code and tests. It does **not** yet run a DOS door or accept BBS connections. See [safe first test](first-test.md).
