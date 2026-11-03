"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { publicCatalog } = require("./core.cjs");
const defaults = () => ({ server: { host: "127.0.0.1", port: 2323, maxSessions: 32 }, clients: [], games: [{ id: "hello-world", name: "Hello World (planned)", enabled: false, maxSessions: 1 }] });
function validate(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw Error("Invalid configuration");
  const s = value.server;
  if (!s || typeof s.host !== "string" || !/^(127\.0\.0\.1|0\.0\.0\.0|(?:[0-9]{1,3}\.){3}[0-9]{1,3})$/.test(s.host) ||
      !Number.isInteger(s.port) || s.port < 1024 || s.port > 65535 ||
      !Number.isInteger(s.maxSessions) || s.maxSessions < 1 || s.maxSessions > 256) throw Error("Invalid server settings");
  if (!Array.isArray(value.clients) || value.clients.length > 64 ||
      value.clients.some(c => !c || typeof c.id !== "string" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(c.id)) ||
      new Set(value.clients.map(c => c.id)).size !== value.clients.length) throw Error("Invalid BBS clients");
  publicCatalog(value.games);
  return value;
}
function read(file) { return fs.existsSync(file) ? validate(JSON.parse(fs.readFileSync(file, "utf8"))) : defaults(); }
function save(file, value) {
  validate(value);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = file + "." + process.pid + ".tmp";
  try { fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + "\n", { flag: "wx", mode: 0o600 }); fs.renameSync(tmp, file); }
  finally { if (fs.existsSync(tmp)) fs.unlinkSync(tmp); }
}
module.exports = { defaults, validate, read, save };
