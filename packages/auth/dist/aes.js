"use client";
function hexToBytes(hex) {
	let bytes = [];
	for (let c = 0; c < hex.length; c += 2) bytes.push(parseInt(hex.substr(c, 2), 16));
	return Buffer.from(bytes);
}
function bytesToHex(bytes) {
	let hex = [];
	for (let i = 0; i < bytes.length; i++) {
		let current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
		hex.push((current >>> 4).toString(16));
		hex.push((current & 0xF).toString(16));
	}
	return hex.join("");
}
export async function encrypt(text, key) {
	const icrypto = window.crypto || window.msCrypto;
	const keyBytes = hexToBytes(key);
	const cryptoKey = await icrypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
	const nonce = icrypto.getRandomValues(new Uint8Array(12));
	const encoder = new TextEncoder();
	const data = encoder.encode(text);
	const ciphertext = await icrypto.subtle.encrypt({
		name: "AES-GCM",
		iv: nonce,
		additionalData: new Uint8Array(),
		tagLength: 128
	}, cryptoKey, data);
	const combined = new Uint8Array(nonce.byteLength + ciphertext.byteLength);
	combined.set(nonce);
	combined.set(new Uint8Array(ciphertext), nonce.byteLength);
	return bytesToHex(combined);
}
export async function decrypt(encryptedHex, key) {
	const icrypto = window.crypto || window.msCrypto;
	try {
		const encryptedBytes = hexToBytes(encryptedHex);
		const nonce = encryptedBytes.slice(0, 12);
		const ciphertext = encryptedBytes.slice(12);
		const cryptoKey = await icrypto.subtle.importKey("raw", hexToBytes(key), { name: "AES-GCM" }, false, ["decrypt"]);
		const decryptedData = await icrypto.subtle.decrypt({
			name: "AES-GCM",
			iv: nonce,
			additionalData: new Uint8Array(),
			tagLength: 128
		}, cryptoKey, ciphertext);
		const decoder = new TextDecoder();
		return decoder.decode(decryptedData);
	} catch (error) {
		throw new Error(`Decryption failed: ${error instanceof Error ? error.message : "Unknown error"}`);
	}
}
