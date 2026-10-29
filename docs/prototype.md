# BBSDoorServer

BBS-independent door session broker prototype for the standalone Windows 10
32-bit DOORS VM at 192.168.150.98. No listener or door execution is implemented.
Authentication, transport security, drop-file generation and DOS/FOSSIL adapters
are NOT certified or implemented. Every launch request currently fails closed.

## Isolation and existing deployment

VirtualBox shares host `D:\DoorServer` as guest `D:\`. The existing guest startup
script is `D:\DoorServer\startdoors.cmd` (host path
`D:\DoorServer\DoorServer\startdoors.cmd`). Preserve it and all VM files.
This repository does not install, replace startup files, or configure the VM.
Never modify production BBS VM 192.168.150.59 or production `D:\mystic`.
The recorded topology is operator-provided and has not been verified by this code.

## Development

The minimal contract validator uses only the Python standard library (Python 3.8+
syntax). Deployment runtime availability and 32-bit compatibility still require
verification on the dedicated VM. Run `python -m unittest discover -s tests`.
Run `python -m bbsdoorserver request.json` to validate a JSON contract; a valid
request still exits 3 because door execution is disabled. Invalid input exits 2.
No files are generated and no connection is made.

See [architecture](docs/architecture.md) for the versioned session contract and
implementation gates. MysticWeb remains a future client, not a dependency.
