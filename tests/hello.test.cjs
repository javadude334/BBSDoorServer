"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { createService } = require("../src/hello-service.cjs");
const { defaults } = require("../src/config-store.cjs");
test("hello service authenticates and isolates BBS client IDs", async () => {
  const config = defaults();
  config.clients = [{ id: "mystic-sandbox" }];
  config.games[0].enabled = true;
  const token = "test-secret-with-more-than-32-characters";
  const server = createService(config, token);
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  try {
    const port = server.address().port;
    async function call(id, secret) {
      const response = await fetch("http://127.0.0.1:" + port + "/hello", {
        method: "POST", headers: { Authorization: "Bearer " + secret, "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id, name: "Tester" })
      });
      return { status: response.status, text: await response.text() };
    }
    assert.equal((await call("mystic-sandbox", "wrong")).status, 401);
    assert.equal((await call("mystic-production", token)).status, 403);
    const ok = await call("mystic-sandbox", token);
    assert.equal(ok.status, 200);
    assert.match(ok.text, /Welcome to BBS Doors Server, Tester!/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
