import crypto from "crypto";

const SECRET = process.env.ADMIN_SESSION_SECRET || "rip-cafe-admin-secret-key-2026";

/**
 * Hash a password using PBKDF2 with SHA-512
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a stored hash
 */
export function verifyPassword(password, storedHash) {
  try {
    if (!storedHash || !storedHash.includes(":")) return false;
    const [salt, originalHash] = storedHash.split(":");
    const hash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash));
  } catch (e) {
    return false;
  }
}

/**
 * Create a signed session token
 */
export function createSessionToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || "ADMIN",
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

/**
 * Verify session token
 */
export function verifySessionToken(token) {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) return null;
    const [data, signature] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(data)
      .digest("base64url");

    if (
      signature.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (e) {
    return null;
  }
}
