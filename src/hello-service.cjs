"use strict";
const http = require("node:http");
const { timingSafeEqual } = require("node:crypto");
const { read } = require("./config-store.cjs");
const { installation } = require("./installation.cjs");
const path = require("node:path");
const file = path.resolve(__dirname, "../config/server.json");
const validName = value => typeof value === "string" && /^[a-zA-Z0-9 _.-]{1,40}$/.test(value);
function createService(config, token) {
  if (!token || Buffer.byteLength(token) < 32) throw Error("Set BBS_DOOR_TOKEN to a random secret of at least 32 bytes");
  const secret = Buffer.from(token);
  return http.createServer((req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    if (req.method !== "POST" || req.url !== "/hello") { res.writeHead(404); res.end("Not found\n"); return; }
    const auth = req.headers.authorization || "";
    const candidate = Buffer.from(auth.startsWith("Bearer ") ? auth.slice(7) : "");
    if (candidate.length !== secret.length || !timingSafeEqual(candidate, secret)) {
      res.writeHead(401); res.end("Unauthorized\n"); return;
    }
    let body = "";
    req.on("data", chunk => { body += chunk; if (body.length > 2048) req.destroy(); });
    req.on("end", () => {
      let data;
      try { data = JSON.parse(body); } catch { res.writeHead(400); res.end("Invalid JSON\n"); return; }
      if (!data || !validName(data.name) || !config.clients.some(c => c.id === data.clientId)) {
        res.writeHead(403); res.end("Unknown BBS client or invalid user\n"); return;
      }
      const game = config.games.find(g => g.id === "hello-world" && g.enabled);
      if (!game) { res.writeHead(503); res.end("Hello World door disabled\n"); return; }
      res.writeHead(200);
      res.end("Welcome to BBS Doors Server, " + data.name + "!\nClient: " + data.clientId + "\nHello World door completed.\n");
    });
  });
}
if (require.main === module) {
  try {
    const config = read(file);
    // Deliberately bind to loopback even if a LAN listener was configured:
    // this proof-of-concept uses HTTP, not SSH or TLS.
    const server = createService(config, installation());
    server.listen(config.server.port, "127.0.0.1", () => {
      console.log("Hello World test listener: http://127.0.0.1:" + config.server.port);
      console.log("Loopback only. Use an SSH tunnel for access from another VM.");
    });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { createService };
