# Unix/Linux — Hello World door setup

This guide covers a Linux server (Ubuntu/Debian examples) for the **Hello World prototype**. The prototype is a TCP test door, not yet a DOS runtime or Mystic terminal connector. For macOS and other Unix variants, use the platform's supported Node.js and Git installation method and adapt firewall/service commands.

## 1. Install prerequisites

On a supported Ubuntu or Debian release:

```sh
sudo apt update
sudo apt install -y git ca-certificates curl
git --version
```

Install a currently supported Node.js LTS release compatible with your distribution and architecture, using your distribution's maintained packages or the official Node.js installation guidance at https://nodejs.org/en/download . Avoid an end-of-life Node.js release for network services. Verify:

```sh
node --version
npm --version
```

The project requires Node.js 18 or newer, but a supported LTS is preferable.

## 2. Clone and test

```sh
mkdir -p ~/BBSDoorServer
cd ~/BBSDoorServer
git clone https://github.com/javadude334/BBSDoorServer.git .
git fetch origin
git switch feature/hello-world-door
npm test
```

If the directory already contains a clone, skip `git clone`. The project currently has no third-party npm dependencies, so `npm install` is not required for this prototype.

## 3. Start the Hello World listener

For a test on the same machine, keep the default loopback address:

```sh
node src/hello-world-server.cjs
```

For a remote Mystic BBS on a **trusted private LAN**, bind to the Linux server's actual LAN IP address:

```sh
DOOR_HOST=192.168.150.98 DOOR_PORT=5000 node src/hello-world-server.cjs
```

Replace `192.168.150.98` with the Linux host's real address; that IP was originally assigned to the Windows VM and must not be duplicated. Leave the terminal open while testing.

## 4. Firewall and connectivity

Permit TCP port 5000 **only from the Mystic BBS host**, not from the internet. For example, on a machine already using UFW:

```sh
sudo ufw allow from 192.168.150.59 to any port 5000 proto tcp
sudo ufw status
```

Do not enable or change the default firewall policy blindly on a remote server; first ensure SSH access remains permitted. Other Linux systems may use firewalld or nftables instead of UFW.

From the Mystic machine, check TCP connectivity and connect with a Telnet-capable client. The banner should say `Hello World from BBSDoorServer!`; press Q to exit. A plain TCP probe may not display the banner correctly without a terminal client.

## 5. Optional background service (after interactive testing)

For a dedicated Linux server, use a restricted systemd service account, a private working directory, and an explicit environment file or service unit. Do not run the door server as root. A production-ready service unit will be provided after the Mystic terminal connector and authentication are implemented.

## 6. Troubleshooting

- `node: command not found`: install a supported Node.js release and verify PATH.
- `EADDRNOTAVAIL`: DOOR_HOST is not assigned to the Linux host.
- `EADDRINUSE`: another process already uses port 5000.
- Remote connection timeout: check host firewall, LAN routing, VM networking and listening address.
- Remote connection refused: check the Node process and configured port.
- Terminal displays negotiation bytes: the prototype implements only minimal Telnet negotiation.

## Future compatibility

The eventual DOS execution layer may use DOSBox or another compatible runtime on Linux. FOSSIL support, serial bridging, dropfile generation, and legacy game compatibility are future milestones, **not features of the current Hello World prototype**.
