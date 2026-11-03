"use strict";
const http = require("node:http");
const clientId = process.argv[2] || "mystic-sandbox";
const name = process.argv[3] || "Sysop";
const port = Number(process.env.BBS_DOOR_PORT || 2323);
if (!process.env.BBS_DOOR_TOKEN) { console.error("Set BBS_DOOR_TOKEN first."); process.exit(1); }
const payload = JSON.stringify({ clientId, name });
const req = http.request({ hostname: process.env.BBS_DOOR_HOST || "127.0.0.1", port, path: "/hello", method: "POST",
  headers: { Authorization: "Bearer " + process.env.BBS_DOOR_TOKEN, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) },
  timeout: 5000 }, res => {
  res.pipe(process.stdout);
  if (res.statusCode !== 200) process.exitCode = 1;
});
req.on("timeout", () => req.destroy(Error("Connection timed out")));
req.on("error", error => { console.error(error.message); process.exitCode = 1; });
req.end(payload);
