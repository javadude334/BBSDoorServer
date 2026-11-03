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
const ansi = Boolean(stdout.isTTY && !process.env.NO_COLOR);
const color = (code, value) => ansi ? "\\x1b[" + code + "m" + value + "\\x1b[0m" : value;
function renderMenu() {
  const width = Math.max(40, Math.min(stdout.columns || 80, 92));
  if (ansi) stdout.write("\\x1b[2J\\x1b[H");
  const bar = "═".repeat(width - 2);
  console.log(color("94", "╔" + bar + "╗"));
  console.log(color("97;44", "  BBS DOORS SERVER".padEnd(width)));
  console.log(color("30;47", " Configuration  Networking  Doors  Tools  Help  Exit ".padEnd(width)));
  console.log(color("94", "╚" + bar + "╝"));
  console.log();
  console.log(color("96;1", "  ██████╗ ██████╗ ███████╗"));
  console.log(color("94;1", "  ██╔══██╗██╔══██╗██╔════╝"));
  console.log(color("96;1", "  ██████╔╝██████╔╝███████╗  DOORS SERVER"));
  console.log(color("94;1", "  ██╔══██╗██╔══██╗╚════██║  CONFIGURATION"));
  console.log(color("96;1", "  ██████╔╝██████╔╝███████║"));
  console.log(color("94;1", "  ╚═════╝ ╚═════╝ ╚══════╝"));
  console.log(color("94", "  ┌" + "─".repeat(Math.min(width - 6, 53)) + "┐"));
  for (const item of [
    "1. Server settings", "2. BBS client identifiers", "3. Door game catalog",
    "4. Validate settings", "5. Save settings", "0. Exit"
  ]) console.log(color("97", "  │  " + item.padEnd(Math.min(width - 10, 51)) + "│"));
  console.log(color("94", "  └" + "─".repeat(Math.min(width - 6, 53)) + "┘"));
  console.log(color("90", "  (Main) -> Arrow-key navigation planned; select by number."));
  console.log(color("93", "  Network listener and door execution are not enabled."));
}
async function run() {
  while (true) {
    renderMenu();
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
