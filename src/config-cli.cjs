"use strict";
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const { read, save, validate } = require("./config-store.cjs");
const file = path.resolve(__dirname, "../config/server.json");
const rl = readline.createInterface({ input: stdin, output: stdout });
let cfg;
try { cfg = read(file); } catch (e) { console.error("Configuration error:", e.message); process.exitCode = 1; rl.close(); }
async function ask(prompt, current) {
  const answer = (await rl.question(prompt + " [" + current + "]: ")).trim();
  return answer || String(current);
}
async function run() {
  while (true) {
    console.log("\n=== BBS Doors Server Configuration ===");
    console.log("1. Server settings");
    console.log("2. BBS client identifiers");
    console.log("3. Door game catalog");
    console.log("4. Validate settings");
    console.log("5. Save settings");
    console.log("0. Exit");
    const choice = (await rl.question("Select: ")).trim();
    try {
      if (choice === "0") break;
      if (choice === "1") {
        cfg.server.host = await ask("Listen address (future listener)", cfg.server.host);
        cfg.server.port = Number(await ask("Port", cfg.server.port));
        cfg.server.maxSessions = Number(await ask("Maximum sessions", cfg.server.maxSessions));
      } else if (choice === "2") {
        console.log("Authorized client IDs:", cfg.clients.map(c => c.id).join(", ") || "(none)");
        const id = (await rl.question("Add BBS client ID (blank to cancel): ")).trim();
        if (id) cfg.clients.push({ id });
      } else if (choice === "3") {
        cfg.games.forEach((g,i) => console.log(i + 1, g.id, g.enabled ? "enabled" : "disabled"));
        const id = (await rl.question("Game ID to toggle (blank to cancel): ")).trim();
        const game = cfg.games.find(g => g.id === id);
        if (game) game.enabled = !game.enabled;
        else if (id) console.log("Unknown game. Game execution is not implemented.");
      } else if (choice === "4") { validate(cfg); console.log("Configuration valid."); }
      else if (choice === "5") { save(file, cfg); console.log("Saved:", file); }
      else console.log("Unknown option.");
    } catch (e) { console.error("Validation/action failed:", e.message); }
  }
}
if (cfg) run().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => rl.close());
