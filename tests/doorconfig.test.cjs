"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { defaults, validate, load, save } = require("../src/doorconfig.cjs");
test("default configuration validates", () => assert.deepEqual(validate(structuredClone(defaults)), []));
test("rejects invalid ports, duplicate BBS IDs and game IDs", () => {
  const c = structuredClone(defaults);
  c.server.port = 0;
  assert.ok(validate(c).length);
  c.server.port = 5000;
  c.bbs = [{ id: "mystic", name: "Mystic" }, { id: "mystic", name: "Other" }];
  assert.ok(validate(c).some(x => x.includes("BBS ID")));
  c.bbs = [];
  c.games.push(structuredClone(c.games[0]));
  assert.ok(validate(c).some(x => x.includes("game ID")));
});
test("save/load and backup preserve settings", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "doorconfig-"));
  try {
    const file = path.join(dir, "config", "server.json");
    const c = structuredClone(defaults);
    c.server.name = "My Door Server";
    save(c, file);
    assert.equal(load(file).server.name, "My Door Server");
    c.server.name = "Renamed";
    save(c, file);
    assert.equal(load(file).server.name, "Renamed");
    assert.equal(JSON.parse(fs.readFileSync(file + ".bak", "utf8")).server.name, "My Door Server");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
