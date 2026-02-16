// src/lib/receipt/generateQrSvg.ts
import QRCode from "qrcode";

export async function generateQrSvg(url: string) {
  return QRCode.toString(url, {
    type: "svg",
    margin: 0,
  });
}
