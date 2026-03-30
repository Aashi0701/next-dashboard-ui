import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sendSMS";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const formattedPhone = body.phone?.startsWith("+91")
      ? body.phone
      : `+91${body.phone}`;

    const lead = await prisma.lead.create({
      data: {
        name: body.name,
        phone: formattedPhone,
        classInterested: body.classInterested,
        source: "CHATBOT",
        status: "NEW",
      },
    });

    // Parent SMS
    if (formattedPhone) {
      await sendSMS(
        formattedPhone,
        `Dear ${body.name},

Thank you for your interest in TrueSunshine Preschool.

We have received your enquiry for ${body.classInterested}. Our admissions team will contact you shortly.

- TrueSunshine Preschool`
      );
    }

    // School/Admin SMS
    await sendSMS(
      process.env.SCHOOL_PHONE_NUMBER || "+919848022338",
      `New Admission Enquiry Received

Name: ${body.name}
Phone: ${formattedPhone}
Class: ${body.classInterested}`
    );

    return Response.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("Lead API Error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create lead",
      },
      {
        status: 500,
      }
    );
  }
}