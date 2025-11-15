const CryptoJS = require("crypto-js");

const SECRET_KEY = "your-super-secret-key-that-is-at-least-32-chars-long"; // Use a strong, random key!

/**
 * Encrypts an object using AES encryption.
 * @param {object} obj - The object to encrypt.
 * @returns {string} The encrypted string.
 */
export const encryptData = (obj) => {
  try {
    const jsonString = JSON.stringify(obj);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    // Encode the encrypted string for URL safety (e.g., replace + with %2B)
    return encodeURIComponent(encrypted);
  } catch (error) {
    console.error("Encryption failed:", error);
    return null;
  }
};

/**
 * Decrypts a string back into an object using AES decryption.
 * @param {string} encryptedString - The encrypted string to decrypt.
 * @returns {object|null} The decrypted object, or null if decryption fails.
 */
export const decryptData = (encryptedString) => {
  try {
    // Decode the URL-safe encrypted string
    const decodedString = decodeURIComponent(encryptedString);
    const decryptedBytes = CryptoJS.AES.decrypt(decodedString, SECRET_KEY);
    const decryptedJsonString = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedJsonString);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};