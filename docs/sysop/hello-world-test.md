# Hello World local test

The configuration utility automatically generates an **Installation ID** on first run and saves it to `config/secrets.json`. Keep this file private and backed up. It is excluded from Git.

1. Run `npm run config`. Add `mystic-sandbox` under BBS client identifiers, enable `hello-world` under Doors, and press F2 to save.
2. In Command Prompt on the Door Server VM, run `npm run hello-server`. Leave it running.
3. Open a second Command Prompt **on the same VM**, change to the BBSDoorServer directory, and run `npm run hello-client -- mystic-sandbox Sysop`.

Expected: a welcome message for Sysop and client mystic-sandbox.

No manual token generation or copying is necessary for this same-machine test.

**Security:** The Installation ID is used as a shared secret by this temporary test service, not merely as a public identifier. Do not share `config/secrets.json`. The HTTP test server binds to `127.0.0.1` only. Do not expose it over the network; cross-VM connections require a secure transport, which is not yet implemented. If you delete `config/secrets.json`, a new Installation ID is generated and any future paired clients would need reconfiguration.
