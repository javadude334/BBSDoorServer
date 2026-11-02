"use strict";
// Intentionally no HTTP/WebSocket listener yet. Authentication, execution,
// terminal transport, and DOS runtime must be implemented before network exposure.
const { SessionRegistry } = require("./core.cjs");
const games = require("../config/games.example.json");
const registry = new SessionRegistry(games);
console.log("BBSDoorServer foundation loaded; no network listener or doors enabled.");
console.log("Configured games:", registry.games.length);
