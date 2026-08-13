const crypto = require("crypto");

const COOKIE_NAME = "mentor_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sign(payload) {
  return crypto
    .createHmac("sha256", process.env.MENTOR_SESSION_SECRET || "")
    .update(payload)
    .digest("base64url");
}

function createSession(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000
  })).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function cookieHeader(value, maxAge = SESSION_TTL_SECONDS) {
  const isSecure = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure ? "; Secure" : ""}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body || {};
  const configuredUsername = process.env.MENTOR_USERNAME;
  const configuredPassword = process.env.MENTOR_PASSWORD;
  const configuredSecret = process.env.MENTOR_SESSION_SECRET;

  if (!configuredUsername || !configuredPassword || !configuredSecret) {
    return res.status(500).json({ error: "Authentication is not configured" });
  }

  if (!safeEqual(username, configuredUsername) || !safeEqual(password, configuredPassword)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.setHeader("Set-Cookie", cookieHeader(createSession(configuredUsername)));
  return res.status(200).json({ ok: true });
};
