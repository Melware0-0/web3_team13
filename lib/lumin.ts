import { createHash } from "node:crypto";

export type LuminCertificateInput = {
  wallet: string;
  courseId: string;
  courseTitle: string;
  brand: string;
  score: number;
  total: number;
  tokenId: number;
  mintTx: string;
};

export type LuminCertificateResult = {
  status: "not_configured" | "signature_request_sent" | "error";
  signer: "Lumin";
  signatureRequestId?: string;
  documentHash: string;
  documentUrl?: string;
  luminDetailsUrl?: string;
  error?: string;
};

type LuminSignatureResponse = {
  signature_request?: {
    signature_request_id?: string;
    id?: string;
    status?: string;
    details_url?: string;
  };
  signature_request_id?: string;
  id?: string;
  details_url?: string;
};

type LuminErrorResponse = {
  error?: unknown;
  message?: string;
};

type LuminSigner = {
  email_address: string | undefined;
  name: string;
  signer_role?: string;
};

function stableHash(input: unknown) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function getApiBaseUrl() {
  return (process.env.LUMIN_API_BASE_URL ?? "https://api-sandbox.luminpdf.com/v1").replace(/\/$/, "");
}

function getSignerRole(): string | undefined {
  const role = process.env.LUMIN_SIGNER_ROLE?.trim();
  return role || undefined;
}

function isConfigured() {
  return Boolean(process.env.LUMIN_API_KEY?.trim() && process.env.LUMIN_SIGNER_EMAIL?.trim());
}

function buildCertificateFields(input: LuminCertificateInput) {
  return {
    "Certificate.Wallet": input.wallet,
    "Certificate.CourseId": input.courseId,
    "Certificate.CourseTitle": input.courseTitle,
    "Certificate.Brand": input.brand,
    "Certificate.Score": `${input.score}/${input.total}`,
    "Certificate.TokenId": String(input.tokenId),
    "Certificate.MintTx": input.mintTx,
    "Certificate.IssuedAt": new Date().toISOString(),
  };
}

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function createCertificatePdf(input: LuminCertificateInput): Buffer {
  const issuedAt = new Date().toISOString();
  const lines = [
    "L2Earn Learning Certificate",
    "",
    "This verifiable credential certifies that the wallet below completed a learning campaign.",
    "",
    `Wallet: ${input.wallet}`,
    `Course: ${input.courseTitle}`,
    `Course ID: ${input.courseId}`,
    `Brand: ${input.brand}`,
    `Score: ${input.score}/${input.total}`,
    `NFT Token ID: ${input.tokenId}`,
    `Mint Transaction: ${input.mintTx}`,
    `Issued At: ${issuedAt}`,
    "",
    "Signed by L2Earn Issuer through Lumin eSign.",
  ];
  const text = lines
    .map((line, index) => {
      const size = index === 0 ? 20 : 10;
      const y = 760 - index * 26;
      return `BT /F1 ${size} Tf 50 ${y} Td (${escapePdfText(line)}) Tj ET`;
    })
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(text, "utf8")} >>\nstream\n${text}\nendstream`,
  ];
  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (const [index, object] of objects.entries()) {
    offsets.push(Buffer.byteLength(body, "utf8"));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(body, "utf8");
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body, "utf8");
}

async function sendFromTemplate(input: LuminCertificateInput, signer: LuminSigner, expiresAt: number) {
  const certificateFields = buildCertificateFields(input);
  return fetch(`${getApiBaseUrl()}/signature_request/send-from-template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.LUMIN_API_KEY!.trim(),
    },
    body: JSON.stringify({
      template_id: process.env.LUMIN_TEMPLATE_ID!.trim(),
      title: `L2Earn Completion Certificate - ${input.courseTitle}`,
      tags: certificateFields,
      fields: certificateFields,
      signers: [signer],
      expires_at: expiresAt,
      signing_type: "SAME_TIME",
    }),
  });
}

async function sendGeneratedPdf(input: LuminCertificateInput, signer: LuminSigner, expiresAt: number) {
  const form = new FormData();
  const file = new Blob([createCertificatePdf(input)], { type: "application/pdf" });
  form.append("file", file, `l2earn-${input.courseId}-${input.tokenId}.pdf`);
  form.append("title", `L2Earn Completion Certificate - ${input.courseTitle}`);
  form.append("signers", JSON.stringify([signer]));
  form.append("expires_at", String(expiresAt));
  form.append("signing_type", "SAME_TIME");

  return fetch(`${getApiBaseUrl()}/signature_request/send`, {
    method: "POST",
    headers: {
      "X-API-Key": process.env.LUMIN_API_KEY!.trim(),
    },
    body: form,
  });
}

export async function createLuminLearningCertificate(
  input: LuminCertificateInput,
): Promise<LuminCertificateResult> {
  const fallbackHash = stableHash({ ...input, issuer: "L2Earn", signer: "Lumin" });

  if (!isConfigured()) {
    return {
      status: "not_configured",
      signer: "Lumin",
      documentHash: fallbackHash,
    };
  }

  try {
    const signerRole = getSignerRole();
    const signer = {
      email_address: process.env.LUMIN_SIGNER_EMAIL?.trim(),
      name: process.env.LUMIN_SIGNER_NAME?.trim() || "L2Earn Issuer",
      ...(signerRole ? { signer_role: signerRole } : {}),
    };
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const hasTemplate = Boolean(process.env.LUMIN_TEMPLATE_ID?.trim());
    const res = hasTemplate
      ? await sendFromTemplate(input, signer, expiresAt)
      : await sendGeneratedPdf(input, signer, expiresAt);

    const responseText = await res.text();
    let payload: LuminSignatureResponse & LuminErrorResponse = {};
    if (responseText) {
      try {
        payload = JSON.parse(responseText) as LuminSignatureResponse & LuminErrorResponse;
      } catch {
        payload = { message: responseText };
      }
    }

    if (!res.ok) {
      return {
        status: "error",
        signer: "Lumin",
        documentHash: fallbackHash,
        error: payload.message ?? JSON.stringify(payload.error ?? payload) ?? `HTTP ${res.status}`,
      };
    }

    const signatureRequest = payload.signature_request;
    const signatureRequestId =
      signatureRequest?.signature_request_id ?? signatureRequest?.id ?? payload.signature_request_id ?? payload.id;
    const luminDetailsUrl = signatureRequest?.details_url ?? payload.details_url;

    return {
      status: "signature_request_sent",
      signer: "Lumin",
      signatureRequestId,
      documentHash: stableHash({ ...input, signatureRequestId, luminDetailsUrl }),
      documentUrl: luminDetailsUrl,
      luminDetailsUrl,
    };
  } catch (error) {
    return {
      status: "error",
      signer: "Lumin",
      documentHash: fallbackHash,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
