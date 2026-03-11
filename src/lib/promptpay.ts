import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

export function generatePromptPayPayload(
  promptpayId: string,
  amount?: number
): string {
  const id = promptpayId.replace(/[-\s]/g, "");
  return generatePayload(id, amount ? { amount } : {});
}

export async function generatePromptPayQRDataURL(
  promptpayId: string,
  amount?: number
): Promise<string> {
  const payload = generatePromptPayPayload(promptpayId, amount);
  return QRCode.toDataURL(payload, {
    width: 280,
    margin: 2,
    color: { dark: "#1e293b", light: "#ffffff" },
  });
}

export async function generatePromptPayQRSvg(
  promptpayId: string,
  amount?: number
): Promise<string> {
  const payload = generatePromptPayPayload(promptpayId, amount);
  return QRCode.toString(payload, { type: "svg", margin: 2 });
}

export function isValidPromptPayId(id: string): boolean {
  const clean = id.replace(/[-\s]/g, "");
  // Phone: 10 digits, Citizen/Tax ID: 13 digits, e-Wallet: 15 digits
  return /^\d{10}$/.test(clean) || /^\d{13}$/.test(clean) || /^\d{15}$/.test(clean);
}
