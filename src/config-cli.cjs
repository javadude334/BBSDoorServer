"use strict";
const path = require("node:path");
const readline = require("node:readline");
const { stdin, stdout } = require("node:process");
const { read, save, validate } = require("./config-store.cjs");
const { installation } = require("./installation.cjs");
const configFile = path.resolve(__dirname, "../config/server.json");
const installationId = installation();
let cfg;
try { cfg = read(configFile); } catch (e) { console.error(e.message); process.exit(1); }
let saved = JSON.stringify(cfg);
const menus = [
  ["Configuration", ["Server Settings", "BBS Clients"]],
  ["Networking", ["Listening Mode"]],
  ["Doors", ["Door Catalog"]],
  ["Tools", ["Validate", "Installation ID", "Save"]],
  ["Help", ["Keyboard Help", "About"]],
  ["Exit", ["Exit Configuration"]]
];
let menu = 0, item = 0, view = "menu", field = 0, scroll = 0, message = "Ready", editing = false, finished = false;
const tty = Boolean(stdin.isTTY && stdout.isTTY);
const ansi = tty && !process.env.NO_COLOR;
const color = (code, value) => ansi ? "\x1b[" + code + "m" + value + "\x1b[0m" : value;
const dirty = () => JSON.stringify(cfg) !== saved;
const size = () => ({ w: Math.max(50, stdout.columns || 80), h: Math.max(20, stdout.rows || 25) });
function draw() {
  const { w, h } = size();
  const width = Math.min(w - 2, 100), lines = Array.from({ length: Math.min(h - 1, 40) }, () => " ".repeat(width));
  const put = (y, x, value, style = "") => {
    if (y < 0 || y >= lines.length || x >= width) return;
    const s = String(value).slice(0, Math.max(0, width - x));
    lines[y] = lines[y].slice(0, x) + (style ? color(style, s) : s) + lines[y].slice(x + s.length);
  };
  put(0, 0, " BBS DOORS SERVER CONFIGURATION ".padEnd(width), "97;44");
  let mx = 1;
  menus.forEach(([name], index) => { put(1, mx, " " + name + " ", index === menu ? "30;47" : "30;47"); mx += name.length + 3; });
  put(2, 0, "═".repeat(width), "94");
  put(4, 3, "BBS DOORS SERVER", "96;1");
  put(5, 3, "Configuration Utility", "94");
  put(7, 3, "Select a menu option to configure the server.", "90");
  put(lines.length - 3, 0, "─".repeat(width), "90");
  put(lines.length - 2, 0, "←→ Menu   ↑↓ Select   Enter Open/Edit   Esc Back   F1 Help   F2 Save   Alt+X Exit", "96");
  put(lines.length - 1, 0, (dirty() ? "* Unsaved | " : "") + message, "93");
  if (view === "menu") {
    let x = 1;
    for (let i = 0; i < menu; i++) x += menus[i][0].length + 3;
    const choices = menus[menu][1];
    const mw = Math.min(width - x - 1, Math.max(22, ...choices.map(v => v.length + 4)));
    choices.forEach((label, i) => put(3 + i, x, (" " + label).padEnd(mw), i === item ? "97;44" : "30;47"));
  } else {
    const entries = fields();
    const panelW = Math.min(width - 6, 74), px = Math.max(2, Math.floor((width - panelW) / 2));
    const visible = Math.max(3, Math.min(entries.length, lines.length - 11));
    const py = 7, panelH = visible + 4;
    for (let y = py; y < py + panelH; y++) put(y, px, " ".repeat(panelW), "30;47");
    const heading = title();
    put(py, px + Math.max(1, Math.floor((panelW - heading.length) / 2)), " " + heading + " ", "97;44");
    if (field < scroll) scroll = field;
    if (field >= scroll + visible) scroll = field - visible + 1;
    entries.slice(scroll, scroll + visible).forEach((entry, index) => {
      const row = py + 2 + index, selected = scroll + index === field;
      const value = String(entry.value);
      put(row, px + 2, entry.label.padEnd(24), selected ? "97;44" : "30;47");
      put(row, px + 27, value.slice(0, panelW - 30), selected ? "97;44" : "94;47");
    });
    put(py + panelH - 1, px + 2, "Enter edit/toggle  Esc menu".slice(0, panelW - 4), "30;47");
  }
  stdout.write("\x1b[2J\x1b[H" + lines.join("\n"));
}
function title() { return menus[menu][1][item].toUpperCase(); }
function fields() {
  const name = menus[menu][1][item];
  if (name === "Server Settings") return [
    { label: "Listener IP", value: cfg.server.host, edit: "host" },
    { label: "Port", value: cfg.server.port, edit: "port" },
    { label: "Maximum Sessions", value: cfg.server.maxSessions, edit: "maxSessions" }
  ];
  if (name === "BBS Clients") return [
    ...cfg.clients.map((c, i) => ({ label: "Client " + (i + 1), value: c.id, client: i })),
    { label: "Add Client", value: "[Enter]", action: "add" }
  ];
  if (name === "Listening Mode") return [
    { label: "Local only", value: cfg.server.host === "127.0.0.1" ? "[selected]" : "", host: "127.0.0.1" },
    { label: "Network", value: cfg.server.host === "0.0.0.0" ? "[selected]" : "", host: "0.0.0.0" },
    { label: "Advanced IP", value: cfg.server.host !== "127.0.0.1" && cfg.server.host !== "0.0.0.0" ? cfg.server.host : "[Enter IP]", edit: "host" }
  ];
  if (name === "Door Catalog") return cfg.games.map((g, i) => ({ label: g.id, value: g.enabled ? "Enabled" : "Disabled", game: i }));
  if (name === "Installation ID") return [{ label: "ID (private)", value: installationId.slice(0, 24) + "…" }, { label: "Stored in", value: "config/secrets.json" }];
  if (name === "Keyboard Help") return [{ label: "Navigation", value: "Arrows, Enter, Esc" }, { label: "Save", value: "F2" }, { label: "Exit", value: "Alt+X or Exit menu" }];
  if (name === "About") return [{ label: "BBS Doors Server", value: "Configuration utility" }, { label: "Network SSH", value: "Not yet implemented" }];
  return [{ label: name, value: "Press Enter" }];
}
function saveNow() { save(configFile, cfg); saved = JSON.stringify(cfg); message = "Configuration saved."; }
function question(label, initial = "") {
  return new Promise(resolve => {
    const rl = readline.createInterface({ input: stdin, output: stdout, terminal: tty });
    rl.question("\n" + label + (initial !== "" ? " [" + initial + "]" : "") + ": ", answer => {
      rl.close(); resolve(answer.trim() || String(initial));
    });
  });
}
async function prompt(label, initial = "") {
  stdin.removeListener("keypress", onKey);
  stdin.setRawMode(false);
  try { return await question(label, initial); }
  finally { if (!finished) { stdin.setRawMode(true); stdin.resume(); stdin.on("keypress", onKey); } }
}
async function editField(entry) {
  if (entry.host) { cfg.server.host = entry.host; message = "Listening mode updated; F2 to save."; return; }
  if (entry.game !== undefined) { cfg.games[entry.game].enabled = !cfg.games[entry.game].enabled; message = "Door setting updated."; return; }
  if (entry.edit) {
    const value = await prompt(entry.label, String(cfg.server[entry.edit]));
    const next = { ...cfg.server, [entry.edit]: entry.edit === "host" ? value : Number(value) };
    validate({ ...cfg, server: next }); cfg.server = next; message = "Server setting updated."; return;
  }
  if (entry.action === "add") {
    const id = await prompt("New BBS client ID");
    if (!id) return;
    const clients = [...cfg.clients, { id }];
    validate({ ...cfg, clients }); cfg.clients = clients; field = cfg.clients.length - 1;
    message = "Client added. Enter to rename or delete."; return;
  }
  if (entry.client !== undefined) {
    const index = entry.client;
    const action = (await prompt("Client: (e)dit, (d)elete, (c)ancel", "c")).toLowerCase();
    if (action === "d") {
      const confirm = await prompt("Type DELETE to remove " + cfg.clients[index].id);
      if (confirm !== "DELETE") return;
      cfg.clients.splice(index, 1); field = Math.min(field, cfg.clients.length); message = "Client deleted."; return;
    }
    if (action === "e") {
      const id = await prompt("Client ID", cfg.clients[index].id);
      const clients = cfg.clients.map((c, i) => i === index ? { ...c, id } : c);
      validate({ ...cfg, clients }); cfg.clients = clients; message = "Client updated.";
    }
  }
}
async function exit() {
  if (dirty()) {
    const choice = (await prompt("Unsaved changes: (s)ave, (d)iscard, (c)ancel", "c")).toLowerCase();
    if (choice === "c") return;
    if (choice === "s") saveNow();
    else if (choice !== "d") return;
  }
  finished = true; stdin.removeListener("keypress", onKey); stdin.setRawMode(false); stdin.pause(); stdout.write("\x1b[2J\x1b[HGoodbye.\n");
}
let busy = false;
async function onKey(str, key = {}) {
  if (busy || finished) return;
  busy = true;
  try {
    if ((key.meta && key.name === "x") || (key.alt && key.name === "x") || str === "\x1bx" || str === "\x18" || (key.ctrl && key.name === "c")) await exit();
    else if (key.name === "f2") saveNow();
    else if (key.name === "f1") { menu = 4; item = 0; view = "panel"; field = 0; }
    else if (key.name === "escape") { view = "menu"; field = 0; }
    else if (view === "menu") {
      if (key.name === "left") { menu = (menu + menus.length - 1) % menus.length; item = 0; }
      else if (key.name === "right") { menu = (menu + 1) % menus.length; item = 0; }
      else if (key.name === "up") item = (item + menus[menu][1].length - 1) % menus[menu][1].length;
      else if (key.name === "down") item = (item + 1) % menus[menu][1].length;
      else if (key.name === "return" || key.name === "enter") {
        const action = menus[menu][1][item];
        if (action === "Exit Configuration") await exit();
        else if (action === "Save") saveNow();
        else if (action === "Validate") { validate(cfg); message = "Configuration valid."; }
        else { view = "panel"; field = 0; scroll = 0; }
      }
    } else {
      if (key.name === "up") field = (field + fields().length - 1) % fields().length;
      else if (key.name === "down") field = (field + 1) % fields().length;
      else if (key.name === "return" || key.name === "enter") await editField(fields()[field]);
    }
  } catch (e) { message = "Error: " + e.message; }
  finally { busy = false; if (!finished) draw(); }
}
async function fallback() {
  console.log("Interactive console required for full-screen configuration. Use Windows Command Prompt or a TTY.");
  const rl = readline.createInterface({ input: stdin, output: stdout });
  rl.close();
}
if (tty) {
  readline.emitKeypressEvents(stdin);
  stdin.setRawMode(true); stdin.resume(); stdin.on("keypress", onKey);
  stdout.on("resize", () => { if (!busy && !finished) draw(); });
  draw();
} else fallback();
