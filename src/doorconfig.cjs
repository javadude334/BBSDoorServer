"use strict";
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const os = require("node:os");
const CONFIG_PATH = process.env.DOOR_CONFIG || path.resolve(process.cwd(), "config/server.json");
const defaults = {
  server: { name: "BBSDoorServer", host: "127.0.0.1", port: 5000, maxClients: 8, idleSeconds: 120 },
  connections: { ssh: { enabled: false, port: 2222 }, telnet: { enabled: true, port: 5000 }, rlogin: { enabled: false, port: 513 } },
  bbs: [],
  games: [{ id: "hello", name: "Hello World", enabled: true, type: "builtin", maxNodes: 8 }]
};
function validate(c) {
  const errors = [];
  if (!c || typeof c !== "object") return ["Configuration must be an object"];
  if (!c.server || typeof c.server.name !== "string" || !c.server.name.trim()) errors.push("Server name required");
  if (!c.server || typeof c.server.host !== "string" || !c.server.host.trim()) errors.push("Server host required");
  for (const [key, min, max] of [["port",1,65535],["maxClients",1,1024],["idleSeconds",10,86400]]) {
    const n = c.server?.[key]; if (!Number.isInteger(n) || n < min || n > max) errors.push("Invalid server."+key);
  }
  for (const kind of ["ssh","telnet","rlogin"]) {
    const item = c.connections?.[kind];
    if (!item || typeof item.enabled !== "boolean" || !Number.isInteger(item.port) || item.port < 1 || item.port > 65535) errors.push("Invalid connections."+kind);
  }
  if (!Array.isArray(c.bbs)) errors.push("BBS connections must be a list");
  else {
    const ids = new Set();
    for (const b of c.bbs) {
      if (!b || !/^[a-z0-9_-]{1,40}$/i.test(b.id || "") || ids.has(b.id)) errors.push("Invalid or duplicate BBS ID");
      if (b && b.id) ids.add(b.id);
      if (!b || typeof b.name !== "string" || !b.name.trim()) errors.push("BBS name required");
    }
  }
  if (!Array.isArray(c.games)) errors.push("Games must be a list");
  else {
    const ids = new Set();
    for (const g of c.games) {
      if (!g || !/^[a-z0-9_-]{1,40}$/i.test(g.id || "") || ids.has(g.id)) errors.push("Invalid or duplicate game ID");
      if (g && g.id) ids.add(g.id);
      if (!g || typeof g.name !== "string" || !g.name.trim()) errors.push("Game name required");
      if (!g || typeof g.enabled !== "boolean") errors.push("Game enabled must be boolean");
      if (!g || !Number.isInteger(g.maxNodes) || g.maxNodes < 1 || g.maxNodes > 1024) errors.push("Invalid game node limit");
    }
  }
  return errors;
}
function load(file = CONFIG_PATH) {
  if (!fs.existsSync(file)) return structuredClone(defaults);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const errors = validate(data);
  if (errors.length) throw new Error(errors.join("; "));
  return data;
}
function save(config, file = CONFIG_PATH) {
  const errors = validate(config);
  if (errors.length) throw new Error(errors.join("; "));
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  if (fs.existsSync(file)) fs.copyFileSync(file, file + ".bak");
  const temp = file + "." + process.pid + ".tmp";
  try {
    fs.writeFileSync(temp, JSON.stringify(config, null, 2) + os.EOL, { mode: 0o600, flag: "wx" });
    fs.renameSync(temp, file);
    if (process.platform !== "win32") fs.chmodSync(file, 0o600);
  } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}
function ui(input = process.stdin, output = process.stdout) {
  if (!input.isTTY) { output.write("DoorConfig requires an interactive terminal.\n"); process.exitCode = 1; return; }
  const rl = readline.createInterface({ input, output });
  const ask = q => new Promise(resolve => rl.question(q, resolve));
  let config;
  try { config = load(); } catch (e) { output.write("Cannot load configuration: " + e.message + "\n"); rl.close(); process.exitCode = 1; return; }
  let dirty = false;
  async function editFields(title, fields, target) {
    output.write("\n" + title + "\n");
    for (const [key, label, type] of fields) {
      const current = target[key];
      const answer = (await ask(label + " [" + current + "]: ")).trim();
      if (!answer) continue;
      let value = type === "number" ? Number(answer) : type === "boolean" ? /^(y|yes|true|1)$/i.test(answer) : answer;
      if (type === "boolean" && !/^(y|yes|true|false|n|no|0|1)$/i.test(answer)) { output.write("Use yes or no.\n"); continue; }
      target[key] = value;
      if (validate(config).length) { target[key] = current; output.write("Invalid value; unchanged.\n"); }
      else dirty = true;
    }
  }
  async function main() {
    while (true) {
      output.write("\n=== BBSDoorServer / DoorConfig ===\n");
      output.write("1 General server settings\n2 Connection settings\n3 BBS connections\n4 Door game editor\n5 Validate configuration\n6 Save changes\n0 Exit\n");
      const choice = (await ask("Select: ")).trim();
      if (choice === "1") await editFields("General", [["name","Server name","text"],["host","Bind address","text"],["port","TCP port","number"],["maxClients","Max clients","number"],["idleSeconds","Idle timeout (seconds)","number"]],config.server);
      else if (choice === "2") {
        const kind = (await ask("Protocol (ssh/telnet/rlogin): ")).trim().toLowerCase();
        if (!config.connections[kind]) { output.write("Unknown protocol.\n"); continue; }
        await editFields(kind.toUpperCase(), [["enabled","Enabled? (yes/no)","boolean"],["port","Port","number"]],config.connections[kind]);
        output.write("Note: enabling a protocol here does NOT implement its listener.\n");
      } else if (choice === "3") {
        output.write("\n" + config.bbs.map(b => b.id + " - " + b.name).join("\n") + "\n");
        const op = (await ask("(A)dd, (D)elete, Enter to return: ")).trim().toLowerCase();
        if (op === "a") {
          const id = (await ask("BBS ID (letters/numbers/_/-): ")).trim();
          const name = (await ask("BBS name: ")).trim();
          const b = { id, name };
          config.bbs.push(b);
          if (validate(config).length) { config.bbs.pop(); output.write("Invalid or duplicate entry.\n"); } else dirty = true;
        } else if (op === "d") {
          const id = (await ask("BBS ID to remove: ")).trim();
          const idx = config.bbs.findIndex(b => b.id === id);
          if (idx >= 0 && (await ask("Confirm delete (yes): ")).trim().toLowerCase() === "yes") { config.bbs.splice(idx,1); dirty = true; }
        }
      } else if (choice === "4") {
        output.write("\n" + config.games.map(g => g.id + " - " + g.name + " (" + (g.enabled ? "enabled" : "disabled") + ")").join("\n") + "\n");
        const id = (await ask("Game ID to edit, or Enter to return: ")).trim();
        const game = config.games.find(g => g.id === id);
        if (game) await editFields("Game " + id, [["name","Display name","text"],["enabled","Enabled? (yes/no)","boolean"],["maxNodes","Max nodes","number"]],game);
        else if (id) output.write("Unknown game; adding external games is not yet supported.\n");
      } else if (choice === "5") {
        const errors = validate(config); output.write(errors.length ? errors.join("\n") + "\n" : "Configuration valid.\n");
      } else if (choice === "6") {
        try { save(config); dirty = false; output.write("Saved: " + CONFIG_PATH + "\n"); }
        catch (e) { output.write("Save failed: " + e.message + "\n"); }
      } else if (choice === "0") {
        if (dirty) {
          const answer = (await ask("Unsaved changes. (S)ave, (D)iscard, (C)ancel: ")).trim().toLowerCase();
          if (answer === "c" || !["s","d"].includes(answer)) continue;
          if (answer === "s") { try { save(config); } catch(e) { output.write(e.message+"\n"); continue; } }
        }
        break;
      } else output.write("Unknown option.\n");
    }
    rl.close();
  }
  main().catch(e => { output.write("DoorConfig error: " + e.message + "\n"); rl.close(); process.exitCode = 1; });
}
if (require.main === module) ui();
module.exports = { defaults, validate, load, save, ui };
