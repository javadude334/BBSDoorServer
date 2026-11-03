# Hello World proof-of-concept

This is an authenticated **local HTTP test endpoint**, not a production door transport or an SSH server. It deliberately binds only to 127.0.0.1, regardless of the configured listening IP. Do not expose port 2323 directly to the network.

1. Run npm run config. Add BBS client ID mystic-sandbox and enable the hello-world catalog entry under Doors. Save with F2.
2. In Command Prompt on the Door VM, generate a strong random token with Node:
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
3. Set the token in the **same terminal session** (do not commit it to Git):
   set BBS_DOOR_TOKEN=PASTE_GENERATED_TOKEN_HERE
4. Run npm run hello-server. Leave this window open.
5. Open a second Command Prompt on the **same VM**, set the same token, and run:
   npm run hello-client -- mystic-sandbox Sysop

The expected output welcomes Sysop and identifies mystic-sandbox. This proves the local test endpoint works. Cross-VM integration requires a separately configured SSH tunnel or another authenticated encrypted transport; that is not part of this milestone. Never send the bearer token over plain HTTP on a LAN or Internet connection.

Production BBS clients are not used in this test.
