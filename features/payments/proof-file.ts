export const MAX_PROOF_BYTES = 5 * 1024 * 1024;

type ProofType = {
  extension: string;
  contentType: string;
};

type ProofCheck = { type: ProofType } | { error: string };

const startsWith = (bytes: Uint8Array, signature: number[], offset = 0): boolean =>
  signature.every((byte, index) => bytes[offset + index] === byte);

const ascii = (text: string): number[] => [...text].map((character) => character.charCodeAt(0));

export const detectProofType = (bytes: Uint8Array): ProofType | null => {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { extension: "jpg", contentType: "image/jpeg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { extension: "png", contentType: "image/png" };
  if (startsWith(bytes, ascii("RIFF")) && startsWith(bytes, ascii("WEBP"), 8)) return { extension: "webp", contentType: "image/webp" };
  if (startsWith(bytes, ascii("%PDF-"))) return { extension: "pdf", contentType: "application/pdf" };
  return null;
};

export const checkProofFile = async (file: File | null): Promise<ProofCheck> => {
  if (!file || file.size === 0) return { error: "Pilih foto atau file bukti transfer." };
  if (file.size > MAX_PROOF_BYTES) return { error: "Ukuran file maksimal 5 MB. Kecilkan foto lalu coba lagi." };
  const type = detectProofType(new Uint8Array(await file.slice(0, 16).arrayBuffer()));
  if (!type) return { error: "File harus berupa foto JPG, PNG, WEBP, atau PDF." };
  return { type };
};
