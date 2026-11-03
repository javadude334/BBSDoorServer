"use strict";
const path = require("node:path");
const readline = require("node:readline");
const { stdin, stdout } = require("node:process");
const { read, save, validate } = require("./config-store.cjs");
const { installation } = require("./installation.cjs");
const installationId = installation();
const file = path.resolve(__dirname, "../config/server.json");
const sections = [
  { name: "Configuration", items: ["Server settings", "BBS client identifiers", "Save settings"] },
  { name: "Networking", items: ["Listening mode", "BBS client identifiers"] },
  { name: "Doors", items: ["Door game catalog"] },
  { name: "Tools", items: ["Validate settings", "Installation ID", "Save settings"] },
  { name: "Help", items: ["Keyboard help", "About"] },
  { name: "Exit", items: ["Exit configuration"] }
];
let cfg;
try { cfg = read(file); } catch (error) {
  console.error("Cannot load configuration:", error.message);
  process.exit(1);
}
const original = JSON.stringify(cfg);
let saved = original, section = 0, selected = 0, message = "Installation ID ready (" + installationId.slice(0, 8) + "…)";
const tty = Boolean(stdin.isTTY && stdout.isTTY);
const colors = tty && !process.env.NO_COLOR;
const paint = (code, value) => colors ? "\x1b[" + code + "m" + value + "\x1b[0m" : value;
const dirty = () => JSON.stringify(cfg) !== saved;
function screen() {
  const width = Math.max(40, Math.min(stdout.columns || 80, 90));
  if (tty) stdout.write("\x1b[2J\x1b[H");
  console.log(paint("97;44", " BBS DOORS SERVER CONFIGURATION ".padEnd(width)));
  console.log(sections.map((s, i) => i === section ? paint("30;47", " " + s.name + " ") : " " + s.name + " ").join(""));
  console.log(paint("94", "═".repeat(width)));
  console.log(paint("96;1", "\n   BBS DOORS SERVER"));
  console.log(paint("94", "   Configuration Utility\n"));
  const items = sections[section].items;
  items.forEach((item, i) => console.log(i === selected ?
    paint("97;44", "  > " + item.padEnd(Math.min(width - 6, 50))) : "    " + item));
  console.log("\n" + paint("90", "─".repeat(width)));
  console.log(paint("96", "← → Menu   ↑ ↓ Select   Enter Open   Esc Back   F1 Help   F2 Save   Alt+X Exit (or Exit menu)"));
  console.log(paint("93", (dirty() ? "* Unsaved changes | " : "") + message));
  console.log(paint("90", "Listener and SSH connections are not implemented yet."));
}
function panelTitle(title) {
  console.log("\n" + paint("94", "═".repeat(48)));
  console.log(paint("97;44", ("  " + title).padEnd(48)));
  console.log(paint("94", "═".repeat(48)));
}
function settingLine(label, value) {
  console.log("  " + paint("96", label.padEnd(22)) + paint("97;1", String(value)));
}
function chooseSection(index) {
  section = (index + sections.length) % sections.length;
  selected = 0;
}
function question(label, value) {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: stdin, output: stdout, terminal: tty });
    rl.question(label + (value === undefined ? "" : " [" + value + "]") + ": ", answer => {
      rl.close();
      resolve(answer.trim() || String(value === undefined ? "" : value));
    });
  });
}
async function editServer() {
  panelTitle("SERVER SETTINGS");
  settingLine("Listener IP", cfg.server.host);
  settingLine("Port", cfg.server.port);
  settingLine("Maximum sessions", cfg.server.maxSessions);
  console.log(paint("90", "  ────────────────────────────────────────────"));
  console.log(paint("93", "  Enter values below (Enter keeps current value).\n"));
  const next = { ...cfg.server };
  next.host = await question("Listener IP (127.0.0.1 local, 0.0.0.0 LAN)", next.host);
  next.port = Number(await question("Port", next.port));
  next.maxSessions = Number(await question("Maximum sessions", next.maxSessions));
  validate({ ...cfg, server: next });
  cfg.server = next;
  message = "Server settings updated in memory; F2 to save.";
}
async function listeningMode() {
  console.log("\n" + "─".repeat(38) + "\nLISTENING MODE\n" + "─".repeat(38));
  console.log("Current: " + cfg.server.host + "\n");
  console.log("1 - Local only (127.0.0.1)");
  console.log("2 - Network (0.0.0.0)");
  console.log("3 - Advanced (specific IP)\n");
  const mode = await question("Mode", "1");
  let host;
  if (mode === "1") host = "127.0.0.1";
  else if (mode === "2") host = "0.0.0.0";
  else if (mode === "3") host = await question("Bind to VM's local IPv4 address", cfg.server.host);
  else throw Error("Choose 1, 2, or 3");
  validate({ ...cfg, server: { ...cfg.server, host } });
  cfg.server.host = host;
  message = "Listening mode set; F2 to save. Network listener is not implemented.";
}
async function editClients() {
  panelTitle("BBS CLIENT IDENTIFIERS");
  console.log(paint("96;1", "  Configured clients:\n"));
  if (!cfg.clients.length) console.log(paint("90", "  (none)"));
  else cfg.clients.forEach((client, index) => console.log("  " + paint("93", String(index + 1).padStart(2) + ".") + " " + paint("97;1", client.id)));
  console.log("\n" + paint("94", "─".repeat(48)));
  console.log("  " + paint("92;1", "A") + " - Add client       " + paint("96;1", "E") + " - Edit client");
  console.log("  " + paint("91;1", "D") + " - Delete client    " + paint("90;1", "C") + " - Cancel\n");
  const action = (await question("Action: (a)dd, (e)dit, (d)elete, (c)ancel", "c")).toLowerCase();
  if (action === "c") return;
  if (action === "d" || action === "e") {
    const oldId = await question("Existing client ID");
    if (!cfg.clients.some(c => c.id === oldId)) throw Error("Client not found");
    if (action === "d") {
      if ((await question("Type DELETE to remove " + oldId)).toUpperCase() !== "DELETE") return;
      cfg.clients = cfg.clients.filter(c => c.id !== oldId);
      message = "BBS client deleted; F2 to save.";
      return;
    }
    const newId = await question("New client ID", oldId);
    const clients = cfg.clients.map(c => c.id === oldId ? { ...c, id: newId } : c);
    validate({ ...cfg, clients });
    cfg.clients = clients;
    message = "BBS client renamed; F2 to save.";
    return;
  }
  if (action !== "a") throw Error("Choose a, e, d, or c");
  const id = await question("Add client ID (blank cancels)");
  if (!id) return;
  const clients = [...cfg.clients, { id }];
  validate({ ...cfg, clients });
  cfg.clients = clients;
  message = "BBS client added in memory.";
}
async function editGames() {
  console.log("\n" + "─".repeat(38) + "\nDOOR GAME CATALOG\n" + "─".repeat(38));
  cfg.games.forEach((game, index) => console.log("  " + (index + 1) + ". " + game.id + " [" + (game.enabled ? "enabled" : "disabled") + "]"));
  console.log("\nEnter a game ID to toggle its status.\n");
  const id = await question("Game ID to toggle (blank cancels)");
  if (!id) return;
  const games = cfg.games.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g);
  if (!games.some(g => g.id === id)) throw Error("Unknown game ID");
  validate({ ...cfg, games });
  cfg.games = games;
  message = "Game catalog updated in memory; game execution is not yet implemented.";
}
async function confirmExit() {
  if (!dirty()) return true;
  const answer = (await question("Unsaved changes: (s)ave, (d)iscard, (c)ancel", "c")).toLowerCase();
  if (answer === "s") { save(file, cfg); saved = JSON.stringify(cfg); return true; }
  return answer === "d";
}
async function execute() {
  const item = sections[section].items[selected];
  if (item === "Server settings") await editServer();
  else if (item === "Listening mode") await listeningMode();
  else if (item === "BBS client identifiers") await editClients();
  else if (item === "Door game catalog") await editGames();
  else if (item === "Validate settings") { validate(cfg); message = "Configuration valid."; }
  else if (item === "Save settings") { save(file, cfg); saved = JSON.stringify(cfg); message = "Saved " + file; }
  else if (item === "Installation ID") message = "Installation ID: " + installationId.slice(0, 12) + "… (private; saved in config/secrets.json)";
  else if (item === "Keyboard help") message = "Arrow keys move, Enter selects, F2 saves, Esc returns, Alt+X exits.";
  else if (item === "About") message = "BBS Doors Server configuration — network service pending.";
  else if (item === "Exit configuration") return await confirmExit();
  return false;
}
async function interactive() {
  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true);
  stdin.resume();
  screen();
  let busy = false;
  const onKey = async (str, key = {}) => {
    if (busy) return;
    busy = true;
    try {
      if (key.ctrl && key.name === "c") { if (await promptExit()) return; }
      else if ((key.meta && key.name === "x") || (key.alt && key.name === "x") || str === "\x1bx" || str === "\x18") { if (await promptExit()) return; }
      else if (key.name === "left") chooseSection(section - 1);
      else if (key.name === "right") chooseSection(section + 1);
      else if (key.name === "up") selected = (selected + sections[section].items.length - 1) % sections[section].items.length;
      else if (key.name === "down") selected = (selected + 1) % sections[section].items.length;
      else if (key.name === "escape") chooseSection(0);
      else if (key.name === "f1") { chooseSection(4); message = "Select Keyboard help and press Enter."; }
      else if (key.name === "f2") { save(file, cfg); saved = JSON.stringify(cfg); message = "Configuration saved."; }
      else if (key.name === "return" || key.name === "enter") {
        stdin.removeListener("keypress", onKey);
        stdin.setRawMode(false);
        try { if (await execute()) { finish(); return; } }
        finally { if (!finished) { stdin.setRawMode(true); stdin.resume(); stdin.on("keypress", onKey); } }
      }
    } catch (error) { message = "Error: " + error.message; }
    finally { if (!finished) { screen(); busy = false; } }
  };
  let finished = false;
  function finish() { finished = true; stdin.removeListener("keypress", onKey); stdin.setRawMode(false); stdin.pause(); console.log("\nGoodbye."); }
  async function promptExit() {
    stdin.removeListener("keypress", onKey);
    stdin.setRawMode(false);
    try { const exit = await confirmExit(); if (exit) finish(); return exit; }
    finally { if (!finished) { stdin.setRawMode(true); stdin.resume(); stdin.on("keypress", onKey); } }
  }
  stdin.on("keypress", onKey);
  stdout.on("resize", () => { if (!finished && !busy) screen(); });
}
async function fallback() {
  console.log("Basic text mode (terminal does not support interactive keys).");
  while (true) {
    console.log("\n" + sections.flatMap(s => s.items).filter((v,i,a) => a.indexOf(v) === i).map((v,i) => (i + 1) + ". " + v).join("\n"));
    const options = sections.flatMap(s => s.items).filter((v,i,a) => a.indexOf(v) === i);
    const choice = await question("Choose option or 0 to exit");
    if (choice === "0") { if (await confirmExit()) break; continue; }
    const item = options[Number(choice) - 1];
    if (!item) continue;
    const target = sections.findIndex(s => s.items.includes(item));
    section = target; selected = sections[target].items.indexOf(item);
    try { if (await execute()) break; console.log(message); } catch (e) { console.error(e.message); }
  }
}
(tty ? interactive() : fallback()).catch(error => { console.error(error); process.exitCode = 1; if (tty && stdin.isRaw) stdin.setRawMode(false); });
