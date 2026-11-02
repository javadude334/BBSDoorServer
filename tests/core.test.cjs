"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const { SessionRegistry, publicCatalog } = require("../src/core.cjs");
const games = [{ id: "test-door", name: "Test Door", enabled: true, maxSessions: 1 }];
test("catalog rejects malformed or duplicate games", () => {
  assert.throws(() => publicCatalog([{...games[0], id:"../bad"}]));
  assert.throws(() => publicCatalog([...games, ...games]));
});
test("single-use attach ticket and capacity", () => {
  const registry = new SessionRegistry(games);
  const launch = registry.launch({ gameId:"test-door", clientId:"mystic", userId:"2", minutes:30 });
  assert.throws(() => registry.launch({ gameId:"test-door", clientId:"web", userId:"3", minutes:30 }));
  assert.throws(() => registry.attach(launch.sessionId, "a".repeat(43)));
  assert.equal(registry.attach(launch.sessionId, launch.ticket).userId, "2");
  assert.throws(() => registry.attach(launch.sessionId, launch.ticket));
  assert.equal(registry.close(launch.sessionId), true);
  assert.equal(registry.launch({ gameId:"test-door", clientId:"web", userId:"3", minutes:30 }).sessionId.length, 32);
});
test("expired tickets are rejected and capacity can be reaped", () => {
  let clock = 1000;
  const registry = new SessionRegistry(games, {now:()=>clock,ticketTtlMs:1000});
  const launch = registry.launch({ gameId:"test-door", clientId:"mystic", userId:"2", minutes:10 });
  clock = 2000;
  assert.throws(() => registry.attach(launch.sessionId, launch.ticket));
  registry.reap();
  assert.equal(registry.launch({ gameId:"test-door", clientId:"web", userId:"3", minutes:10 }).sessionId.length, 32);
});
test("disabled games and invalid identities cannot launch", () => {
  const registry = new SessionRegistry([{...games[0],enabled:false}]);
  assert.throws(() => registry.launch({gameId:"test-door",clientId:"web",userId:"2",minutes:10}));
  assert.throws(() => new SessionRegistry(games).launch({gameId:"test-door",clientId:"web",userId:"0",minutes:10}));
});
