const crypto = require("crypto");

function sign(payload) {
  return crypto
    .createHmac("sha256", process.env.MENTOR_SESSION_SECRET || "")
    .update(payload)
    .digest("base64url");
}

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split("=");
    return [key, decodeURIComponent(value.join("="))];
  }));
}

function isValidSession(token) {
  try {
    const [payload, signature] = String(token || "").split(".");
    if (!payload || !signature) return false;

    const expected = sign(payload);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) return false;

    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Boolean(session.username && session.expiresAt > Date.now());
  } catch (error) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const cookies = parseCookies(req.headers.cookie);
  if (!process.env.MENTOR_SESSION_SECRET || !isValidSession(cookies.mentor_session)) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({ authenticated: true });
};
