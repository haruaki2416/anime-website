const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const { pool } = require("../db");

const router = express.Router();
const COOKIE_NAME = "aniproject_session";
const SESSION_DAYS = 14;
const allowedDataKeys = new Set([
  "bookmarks", "keepWatching", "mediaListSavedByStatus", "notifications",
  "episodesWatched", "chaptersRead", "videoSource", "mediaTitlePreferredLang",
  "showAdultContent", "autoNextEpisode", "autoSkipIntroAndOutro",
  "playVideoWhenMediaAndVideoIdMismatch", "videoQuality",
  "videoSubtitleLanguage", "displayName", "photoURL"
]);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

function cookieOptions() {
  const sameSite = (process.env.COOKIE_SAME_SITE || "lax").toLowerCase();
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: ["lax", "strict", "none"].includes(sameSite) ? sameSite : "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000
  };
}

function publicUser(row) {
  return {
    id: row.id,
    uid: row.id,
    email: row.email,
    displayName: row.username,
    photoURL: row.data?.photoURL || null,
    data: row.data || {}
  };
}

async function createSession(userId, res) {
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);
  await pool.query(
    "INSERT INTO user_sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [tokenHash, userId, expiresAt]
  );
  res.cookie(COOKIE_NAME, token, cookieOptions());
}

async function requireUser(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Authentication required" });
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const result = await pool.query(
      `SELECT u.id, u.email, u.username, u.data
       FROM user_sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
      [tokenHash]
    );
    if (!result.rowCount) return res.status(401).json({ error: "Session expired" });
    req.user = result.rows[0];
    req.sessionTokenHash = tokenHash;
    next();
  } catch (error) {
    next(error);
  }
}

router.post("/register", authLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const username = String(req.body?.username || "").trim();
    const password = String(req.body?.password || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: "Enter a valid email address" });
    if (username.length < 1 || username.length > 15)
      return res.status(400).json({ error: "Username must be 1–15 characters" });
    if (password.length < 8 || !/[a-z]/i.test(password) || !/\d/.test(password))
      return res.status(400).json({ error: "Password must be at least 8 characters and include a letter and a number" });

    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);
    const defaults = {
      bookmarks: [], keepWatching: [], mediaListSavedByStatus: {},
      notifications: [], episodesWatched: {}, chaptersRead: {},
      videoSource: "gogoanime", mediaTitlePreferredLang: "romaji",
      showAdultContent: false, autoNextEpisode: true,
      autoSkipIntroAndOutro: false, playVideoWhenMediaAndVideoIdMismatch: false,
      videoQuality: "auto", videoSubtitleLanguage: "English"
    };
    const result = await pool.query(
      "INSERT INTO users (id, email, username, password_hash, data) VALUES ($1, $2, $3, $4, $5::jsonb) RETURNING id, email, username, data",
      [id, email, username, passwordHash, JSON.stringify(defaults)]
    );
    await createSession(id, res);
    return res.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") return res.status(409).json({ error: "An account with that email already exists" });
    next(error);
  }
});

router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const result = await pool.query(
      "SELECT id, email, username, password_hash, data FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash)))
      return res.status(401).json({ error: "Incorrect email or password" });
    await createSession(user.id, res);
    return res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (token) {
      const hash = crypto.createHash("sha256").update(token).digest("hex");
      await pool.query("DELETE FROM user_sessions WHERE token_hash = $1", [hash]);
    }
    res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireUser, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.get("/data", requireUser, (req, res) => {
  res.json({ data: req.user.data || {} });
});

router.patch("/data", requireUser, async (req, res, next) => {
  try {
    const incoming = req.body?.data;
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming))
      return res.status(400).json({ error: "A data object is required" });
    const safeData = {};
    for (const [key, value] of Object.entries(incoming)) {
      if (allowedDataKeys.has(key)) safeData[key] = value;
    }
    const result = await pool.query(
      "UPDATE users SET data = data || $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING data",
      [JSON.stringify(safeData), req.user.id]
    );
    res.json({ data: result.rows[0].data });
  } catch (error) {
    next(error);
  }
});

router.delete("/account", requireUser, async (req, res, next) => {
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [req.user.id]);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
