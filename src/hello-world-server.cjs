"use strict";
const net = require("node:net");
const host = process.env.DOOR_HOST || "127.0.0.1";
const port = Number(process.env.DOOR_PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid DOOR_PORT");
const maxClients = 8;
let clients = 0;
const server = net.createServer((socket) => {
  if (clients >= maxClients) { socket.end("Server busy\r\n"); return; }
  clients++;
  socket.setTimeout(120000);
  socket.on("timeout", () => socket.end("\r\nSession timed out.\r\n"));
  socket.on("error", () => {});
  socket.on("close", () => { clients--; });
  socket.write("\x1b[2J\x1b[H\r\n");
  socket.write("========================================\r\n");
  socket.write("       BBS DOOR SERVER TEST DOOR\r\n");
  socket.write("========================================\r\n\r\n");
  socket.write("Hello World from BBSDoorServer!\r\n\r\n");
  socket.write("Press Q to return to your BBS.\r\n");
  let iac = 0;
  socket.on("data", (data) => {
    for (const b of data) {
      // Ignore basic Telnet IAC commands and their option bytes.
      if (iac === 1) { iac = b === 255 ? 0 : (b >= 251 && b <= 254 ? 2 : 0); continue; }
      if (iac === 2) { iac = 0; continue; }
      if (b === 255) { iac = 1; continue; }
      if (b === 81 || b === 113) { socket.end("\r\nGoodbye from Hello World!\r\n"); return; }
    }
  });
});
server.on("error", (err) => { console.error(err.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`Hello World door listening on ${host}:${port}`));
