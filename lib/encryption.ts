import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // For AES, this is always 16

// Ensure ENCRYPTION_KEY is a 32-byte (256-bit) key
let ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "a_very_secret_key_of_32_chars_long"; // Use a strong, randomly generated key in production

if (ENCRYPTION_KEY.length !== 32) {
  console.warn(
    "ENCRYPTION_KEY is not 32 bytes long. Please generate a strong 32-byte key for production."
  );
  // For development, we can pad or truncate, but in production, this should be a hard error.
  // For now, let's just pad with null bytes if too short, or truncate if too long.
  if (ENCRYPTION_KEY.length < 32) {
    ENCRYPTION_KEY = ENCRYPTION_KEY.padEnd(32, "\0");
  } else if (ENCRYPTION_KEY.length > 32) {
    ENCRYPTION_KEY = ENCRYPTION_KEY.substring(0, 32);
  }
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string): string {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift()!, "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
