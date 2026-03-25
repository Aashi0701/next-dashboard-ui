import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

function formatPhoneNumber(phone: string) {
  // remove spaces/dashes
  let cleaned = phone.replace(/\D/g, "");

  // if already has country code
  if (cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  // assume India if 10 digits
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  return `+${cleaned}`;
}

export async function sendSMS(to: string, message: string) {
  try {
    const formattedNumber = formatPhoneNumber(to);

    await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: formattedNumber,
    });
  } catch (err) {
    console.error("SMS failed:", err);
  }
}