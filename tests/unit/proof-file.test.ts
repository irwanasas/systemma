import { describe, expect, it } from "vitest";
import { checkProofFile, MAX_PROOF_BYTES } from "@/features/payments/proof-file";

const fileOf = (bytes: number[], name = "bukti", type = ""): File => new File([new Uint8Array(bytes)], name, { type });

const text = (value: string): number[] => [...value].map((character) => character.charCodeAt(0));

describe("proof file check", () => {
  it("accepts JPEG, PNG, WEBP and PDF by their content", async () => {
    expect(await checkProofFile(fileOf([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toEqual({ type: { extension: "jpg", contentType: "image/jpeg" } });
    expect(await checkProofFile(fileOf([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]))).toMatchObject({ type: { extension: "png" } });
    expect(await checkProofFile(fileOf([...text("RIFF"), 0, 0, 0, 0, ...text("WEBP")]))).toMatchObject({ type: { extension: "webp" } });
    expect(await checkProofFile(fileOf(text("%PDF-1.7")))).toMatchObject({ type: { extension: "pdf" } });
  });

  it("rejects files whose content is not an allowed type, even with an image name and type", async () => {
    expect(await checkProofFile(fileOf(text("<html>"), "bukti.jpg", "image/jpeg"))).toEqual({
      error: "File harus berupa foto JPG, PNG, WEBP, atau PDF.",
    });
  });

  it("rejects empty, missing and oversized files", async () => {
    expect(await checkProofFile(null)).toHaveProperty("error");
    expect(await checkProofFile(fileOf([]))).toHaveProperty("error");
    const oversized = new File([new Uint8Array(MAX_PROOF_BYTES + 1)], "besar.jpg");
    expect(await checkProofFile(oversized)).toEqual({ error: "Ukuran file maksimal 5 MB. Kecilkan foto lalu coba lagi." });
  });
});
