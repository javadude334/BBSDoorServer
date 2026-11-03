"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { randomBytes } = require("node:crypto");
const file = path.resolve(__dirname, "../config/secrets.json");
function installation() {
  try {
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!saved || typeof saved.installationId !== "string" || !/^[a-f0-9]{64}$/.test(saved.installationId)) throw Error("Invalid installation ID");
    return saved.installationId;
  } catch (e) { if (e.code !== "ENOENT") throw e; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const id = randomBytes(32).toString("hex");
  try { fs.writeFileSync(file, JSON.stringify({ installationId: id }, null, 2) + "\n", { flag: "wx", mode: 0o600 }); }
  catch (e) { if (e.code === "EEXIST") return installation(); throw e; }
  return id;
}
module.exports = { installation };
