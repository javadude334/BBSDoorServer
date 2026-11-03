# BBS Door Server — Windows Quick Start

This guide covers the current **foundation release**. The server currently validates its game catalog and session rules, but **does not yet listen for connections or run doors**. Configuration UI, SSH integration and Hello World are future milestones.

## 1. Install Node.js

For the Windows 10 **32-bit (x86)** Door VM used in development, install **Node.js 22.23.0 x86** from the official Node.js distribution:

https://nodejs.org/dist/v22.23.0/node-v22.23.0-x86.msi

Open a new Command Prompt:

```cmd
node --version
npm --version
node -p "process.arch"
```

Our tested environment reports Node.js `v22.23.0`, npm `10.9.8`, and should report `ia32` for 32-bit Node. Do not upgrade npm just because an update notice appears.

## 2. Obtain the repository

Choose **one** method.

### Option A — ZIP (simplest for sysops)

1. Open https://github.com/javadude334/BBSDoorServer
2. Select **Code → Download ZIP**.
3. Extract the archive; GitHub names the extracted folder `BBSDoorServer-main`.
4. Rename that folder to `BBSDoorServer` and place it at `D:\BBSDoorServer` on the Door VM.

### Option B — Git (recommended for development)

Install Git for Windows from https://git-scm.com/download/win and verify `git --version`.

For a **new** installation in a local directory:

```cmd
cd /d D:\
git clone https://github.com/javadude334/BBSDoorServer.git BBSDoorServer
cd /d D:\BBSDoorServer
```

**Existing shared-folder installation:** Our development host has a shared folder `D:\DoorServer`, while the VM test installation was `D:\BBSDoorServer`. These are **not necessarily the same location**. First confirm the VM's mapped/shared path and the folder that actually contains `package.json` and `.git`. Do not clone over an existing installation. If `D:\DoorServer` on the host is the Git working tree you intend to share, use that directory instead of creating a second copy.

To update an existing Git checkout, from the **correct working tree**:

```cmd
git status
git pull --ff-only origin main
npm install
npm test
```

If `git status` reports local changes, resolve or save them before pulling. For a ZIP installation, `git pull` will not work unless it has been converted to a Git checkout; clone separately instead. Avoid running simultaneous Git operations against the same shared working tree from host and VM.

## 3. Install dependencies

Open Command Prompt in the installation directory (shown here as the VM's tested path):

```cmd
cd /d D:\BBSDoorServer
npm install
```

## 4. Verify the foundation

```cmd
npm test
npm start
```

In the tested foundation release, four tests pass. `npm start` reports:

```text
BBSDoorServer foundation loaded; no network listener or doors enabled.
Configured games: 1
```

It then exits to the prompt. This is expected and does **not** mean the door service is listening.

## 5. Configuration — not available yet

The proposed `npm run config` terminal configuration utility **has not been implemented**. Running it on this release produces `Missing script: "config"`. Do not treat that as an installation error.

Future setup will cover server settings, authorized BBS connections, SSH, game paths and session limits.

## 6. First Hello World connection — not available yet

The Hello World door, SSH connectivity, network listener and Mystic BBS integration are planned. This guide will be extended with verified steps when those features are implemented.

## Development layout reminder

- Development host source previously used: `E:\work\javadude_dev\BBSDoorServer`
- Host shared-folder location reported: `D:\DoorServer`
- Door VM ZIP test installation: `D:\BBSDoorServer`

These paths must not be assumed to point to the same files. Pick one authoritative deployment checkout and verify the host-to-VM share mapping before switching to Git-based updates.
