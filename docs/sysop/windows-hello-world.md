# Windows 10 32-bit — Hello World door setup

This guide targets the existing **Windows 10 32-bit** door-server VM at `192.168.150.98`. The Hello World listener is a prototype; it does not yet integrate with a Mystic menu or launch DOS games.

## 1. Install Git

Download **Git for Windows** from https://git-scm.com/download/win . Select the **32-bit/x86** installer if available for the version you choose. Recent Git releases may not provide a 32-bit build; check the official release assets and supported Windows versions. Do not install an x64 binary on a 32-bit VM.

Open a new PowerShell window and verify:

```powershell
git --version
```

If an appropriate Git installer is unavailable, download the repository ZIP from GitHub on another computer and extract it to the VM; Git is a convenience for updates, not a runtime requirement.

## 2. Install Node.js

This repository requires Node.js **18 or later**, but recent official Node.js releases may not offer Windows x86 installers. Use only an official compatible Windows x86 build from https://nodejs.org/dist/ after confirming its OS support. **Node.js 18 is end-of-life and must not be exposed directly to untrusted networks.** If no supported, security-maintained x86 build exists, prefer migrating the VM to Windows x64 or Linux x64 for production rather than relying on an obsolete runtime.

After installation, open a new PowerShell window:

```powershell
node --version
npm --version
```

Both commands must succeed. Do not continue if Node.js cannot run on the VM.

## 3. Retrieve the project

```powershell
New-Item -ItemType Directory -Force D:\DoorServer | Out-Null
cd D:\DoorServer
git clone https://github.com/javadude334/BBSDoorServer.git .
git fetch origin
git switch feature/hello-world-door
npm test
```

If you previously cloned into this directory, skip the clone and run `git fetch origin` followed by `git switch feature/hello-world-door`. If using ZIP instead of Git, download the feature branch ZIP and extract its contents into the folder.

## 4. Start Hello World

```powershell
$env:DOOR_HOST = "192.168.150.98"
$env:DOOR_PORT = "5000"
node src/hello-world-server.cjs
```

Leave the PowerShell window open during testing. The expected message is `Hello World door listening on 192.168.150.98:5000`.

## 5. Restrict firewall access

Run PowerShell **as Administrator**:

```powershell
New-NetFirewallRule -DisplayName "BBSDoorServer Hello World" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5000 -RemoteAddress 192.168.150.59 -Profile Private
```

Do not open port 5000 to the public internet. From the Mystic machine, verify TCP connectivity and then connect using a Telnet-capable client. Press Q to exit.

## 6. What is not ready yet

The Hello World server does not yet provide a Mystic menu connector, caller identity, secure authentication, SSH/RLogin listeners, DOS execution, or integrated FOSSIL support. Keep it on the private LAN and do not use it to transfer credentials.

## Troubleshooting

- `git` or `node` not recognized: reopen PowerShell, check the installation and PATH.
- `node` cannot execute: verify that you installed a Windows **x86** binary, not x64.
- `EADDRINUSE`: port 5000 is already occupied.
- `EADDRNOTAVAIL`: verify that `192.168.150.98` is assigned to this VM.
- Connection refused: confirm the server is running and listening on the VM address.
- Timeout: verify VirtualBox network configuration and Windows Firewall.
