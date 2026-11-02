"use strict";
const net = require("node:net");
const { load } = require("./doorconfig.cjs");
const settings = load();
const host = process.env.DOOR_HOST || settings.server.host;
const port = Number(process.env.DOOR_PORT || settings.server.port);
const maxClients = settings.server.maxClients;
const idleMilliseconds = settings.server.idleSeconds * 1000;
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid DOOR_PORT");
let clients = 0;
const server = net.createServer((socket) => {
  if (clients >= maxClients) { socket.end("Server busy\r\n"); return; }
  clients++;
  socket.setTimeout(idleMilliseconds);
  socket.on("timeout", () => socket.end("\r\nSession timed out.\r\n"));
  socket.on("error", () => {});
  socket.on("close", () => { clients--; });
  // Ask Telnet clients to suppress local echo; do not depend on negotiation.
  socket.write(Buffer.from([255, 251, 1, 255, 251, 3]));
  socket.write("\x1b[2J\x1b[H\r\n");
  socket.write("========================================\r\n");
  socket.write("       BBS DOOR SERVER TEST DOOR\r\n");
  socket.write("========================================\r\n\r\n");
  socket.write("Hello World from BBSDoorServer!\r\n\r\n");
  socket.write("Press Q to return to your BBS.\r\n");
  let state = 0;
  socket.on("data", (data) => {
    for (const b of data) {
      if (state === 1) { state = b === 250 ? 3 : (b >= 251 && b <= 254 ? 2 : 0); continue; }
      if (state === 2) { state = 0; continue; }
      if (state === 3) { if (b === 255) state = 4; continue; }
      if (state === 4) { state = b === 240 ? 0 : 3; continue; }
      if (b === 255) { state = 1; continue; }
      if (b === 81 || b === 113) { socket.end("\r\nGoodbye from Hello World!\r\n"); return; }
    }
  });
});
server.on("error", (err) => { console.error(err.message); process.exitCode = 1; });
if (require.main === module) server.listen(port, host, () => console.log(`Hello World door listening on ${host}:${port}`));
module.exports = { server };
