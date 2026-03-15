// Password hashing utilities using Argon2id.
// Argon2id is the recommended algorithm by OWASP for password storage.
// It's resistant to both side-channel and GPU-based attacks.

import argon2 from "argon2";

// Hash a plain-text password. Returns a string like "$argon2id$v=19$..."
export async function hashPassword(plainText) {
  return argon2.hash(plainText, {
    type: argon2.argon2id, // recommended variant
    memoryCost: 65536,     // 64 MB memory usage
    timeCost: 3,           // 3 iterations
    parallelism: 4,        // 4 threads
  });
}

// Compare a plain-text password against a stored hash.
// Returns true if they match, false otherwise.
export async function verifyPassword(plainText, hash) {
  return argon2.verify(hash, plainText);
}
