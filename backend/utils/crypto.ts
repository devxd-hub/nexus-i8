import crypto from 'node:crypto';

/**
 * Hash a password using Node 22 native scrypt with a unique cryptographically random 16-byte salt.
 */
export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.randomBytes(16).toString('hex');
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      else resolve({ hash: derivedKey.toString('hex'), salt });
    });
  });
}

/**
 * Synchronous version for startup seeding
 */
export function hashPasswordSync(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return { hash: derivedKey.toString('hex'), salt };
}

/**
 * Verify a password against a stored scrypt hash using constant-time comparison to prevent timing attacks.
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const storedBuffer = Buffer.from(storedHash, 'hex');
        if (storedBuffer.length !== derivedKey.length) {
          resolve(false);
          return;
        }
        const match = crypto.timingSafeEqual(storedBuffer, derivedKey);
        resolve(match);
      } catch {
        resolve(false);
      }
    });
  });
}

/**
 * Generate a cryptographically random session token (32 bytes / 64 hex chars) and its SHA-256 hash.
 */
export function generateSessionToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

/**
 * Compute the SHA-256 hash of a session token for secure database lookups.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
