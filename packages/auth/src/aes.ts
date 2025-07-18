'use client';
declare const window: any;

// Convert a hex string to a byte array
function hexToBytes(hex: string) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
    return Buffer.from(bytes);
}

// Convert a byte array to a hex string
function bytesToHex(bytes: Uint8Array) {
    let hex = [];
    for (let i = 0; i < bytes.length; i++) {
        let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xF).toString(16));
    }
    return hex.join("");
}

export async function encrypt(text: string, key: string): Promise<string> {
    const icrypto = window.crypto || window.msCrypto;

    // Convert the hex-encoded key string to a byte array
    const keyBytes = hexToBytes(key);
    
    // Import the encryption key using the Web Crypto API
    const cryptoKey = await icrypto.subtle.importKey(
        "raw",                             // Algorithm type
        keyBytes,                          // Key data
        { name: "AES-GCM" },                // AES-GCM algorithm
        false,                             // Exportable: false means we cannot export the key
        ["encrypt"]                        // Only allow encryption with the key
    );
    
    // Generate a random nonce (12 bytes for AES-GCM)
    const nonce = icrypto.getRandomValues(new Uint8Array(12));

    // Encode the plaintext text into a byte array
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    // Perform the AES-GCM encryption
    const ciphertext = await icrypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: nonce,                       // Initialization vector (nonce)
            additionalData: new Uint8Array(), // Optional additional authenticated data (AAD)
            tagLength: 128                   // Tag length (optional, defaults to 128 bits)
        },
        cryptoKey,                          // The imported AES key
        data                                // The data to encrypt (plaintext)
    );

    // Concatenate the nonce and ciphertext (nonce is typically prepended)
    const combined = new Uint8Array(nonce.byteLength + ciphertext.byteLength);
    combined.set(nonce);
    combined.set(new Uint8Array(ciphertext), nonce.byteLength);

    // Convert the combined result to a hex string for easy transmission
    return bytesToHex(combined)
}

// Convert a hex to a string
export async function decrypt(encryptedHex: string, key: string): Promise<string> {
  const icrypto = window.crypto || window.msCrypto;

  try {
    // 1. Convert hexadecimal ciphertext to byte array
    const encryptedBytes = hexToBytes(encryptedHex);

    // 2. Separate nonce (first 12 bytes) and ciphertext (remaining bytes)
    const nonce = encryptedBytes.slice(0, 12);
    const ciphertext = encryptedBytes.slice(12);

    // 3. Import decryption key
    const cryptoKey = await icrypto.subtle.importKey(
      "raw",
      hexToBytes(key),
      { name: "AES-GCM" },
      false,
      ["decrypt"]  // 注意这里是 decrypt
    );

    // 4. Execute AES-GCM decryption
    const decryptedData = await icrypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce,
        additionalData: new Uint8Array(),
        tagLength: 128
      },
      cryptoKey,
      ciphertext
    );

    // 5. Convert the decrypted byte array into a string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);

  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}