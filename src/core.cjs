"use strict";
const { randomBytes, createHash, timingSafeEqual } = require("node:crypto");
const ID = /^[a-z0-9][a-z0-9_-]{0,63}$/;
function assertGameId(id) { if (typeof id !== "string" || !ID.test(id)) throw new Error("Invalid game ID"); return id; }
function publicCatalog(games) {
  if (!Array.isArray(games) || games.length > 256) throw new Error("Invalid catalog");
  const seen = new Set();
  return games.map(g => {
    const id = assertGameId(g.id);
    if (seen.has(id) || typeof g.name !== "string" || !g.name.trim() || g.name.length > 100 ||
        typeof g.enabled !== "boolean" || !Number.isSafeInteger(g.maxSessions) || g.maxSessions < 1 || g.maxSessions > 64)
      throw new Error("Invalid game definition");
    seen.add(id);
    return Object.freeze({ id, name: g.name, enabled: g.enabled, maxSessions: g.maxSessions });
  });
}
function digest(token) { return createHash("sha256").update(token).digest(); }
class SessionRegistry {
  constructor(games, { maxTotal = 32, ticketTtlMs = 30000, now = () => Date.now() } = {}) {
    this.games = publicCatalog(games);
    if (!Number.isSafeInteger(maxTotal) || maxTotal < 1 || maxTotal > 256 ||
        !Number.isSafeInteger(ticketTtlMs) || ticketTtlMs < 1000 || ticketTtlMs > 120000) throw new Error("Invalid limits");
    this.maxTotal = maxTotal; this.ticketTtlMs = ticketTtlMs; this.now = now;
    this.sessions = new Map();
  }
  launch({ gameId, clientId, userId, minutes }) {
    const game = this.games.find(g => g.id === assertGameId(gameId) && g.enabled);
    if (!game || typeof clientId !== "string" || !ID.test(clientId) ||
        typeof userId !== "string" || !/^[1-9][0-9]{0,9}$/.test(userId) ||
        !Number.isSafeInteger(minutes) || minutes < 1 || minutes > 240) throw new Error("Launch denied");
    const active = [...this.sessions.values()].filter(s => s.state !== "closed");
    if (active.length >= this.maxTotal || active.filter(s => s.gameId === gameId).length >= game.maxSessions)
      throw new Error("Capacity unavailable");
    const id = randomBytes(16).toString("hex"), ticket = randomBytes(32).toString("base64url");
    this.sessions.set(id, { id, gameId, clientId, userId, minutes, ticketHash: digest(ticket),
      expires: this.now() + this.ticketTtlMs, state: "issued" });
    return { sessionId: id, ticket, expiresAt: this.sessions.get(id).expires };
  }
  attach(sessionId, ticket) {
    const session = this.sessions.get(sessionId);
    if (!session || session.state !== "issued" || this.now() >= session.expires ||
        typeof ticket !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(ticket) ||
        !timingSafeEqual(digest(ticket), session.ticketHash)) throw new Error("Attach denied");
    session.state = "attached"; session.ticketHash.fill(0);
    return Object.freeze({ sessionId, gameId: session.gameId, clientId: session.clientId,
      userId: session.userId, minutes: session.minutes });
  }
  close(sessionId) { const session = this.sessions.get(sessionId); if (!session) return false;
    session.state = "closed"; session.ticketHash.fill(0); this.sessions.delete(sessionId); return true; }
  reap() { for (const [id, s] of this.sessions) if (s.state === "issued" && this.now() >= s.expires) this.close(id); }
}
module.exports = { assertGameId, publicCatalog, SessionRegistry };
