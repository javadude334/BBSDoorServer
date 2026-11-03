"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { defaults, validate, read, save } = require("../src/config-store.cjs");
test("default configuration validates", () => assert.equal(validate(defaults()).server.port, 2323));
test("invalid port and duplicate clients rejected", () => {
  const c = defaults(); c.server.port = 0; assert.throws(() => validate(c));
  c.server.port = 2323; c.clients = [{id:"mystic"}, {id:"mystic"}]; assert.throws(() => validate(c));
});
test("configuration saves and reloads", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bbs-config-"));
  try { const file = path.join(dir,"config","server.json"); const c = defaults(); save(file,c); assert.deepEqual(read(file),c); }
  finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
