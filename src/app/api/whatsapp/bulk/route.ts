import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  // fetch all students with pending dues
  const pending = await prisma.studentFee.findMany({
    where: {
      payments: { some: {} }, // all students with fee assignments
    },
    include: {
      student: {
        include: {
          parent: true,
        },
      },
      feeStructure: true,
      payments: true,
    },
  });

  // Build list
  const list = pending
    .map((item) => {
      const total = item.feeStructure.amount;
      const paid = item.payments.reduce((sum, p) => sum + p.amount, 0);
      const due = total - paid;

      if (due <= 0 || !item.student.parent?.phone) return null;

      return `• ${item.student.name} ${item.student.surname} — ₹${due.toLocaleString("en-IN")}`;
    })
    .filter(Boolean)
    .join("%0A"); // newline for WhatsApp

  if (!list || list.length === 0) {
    return NextResponse.redirect("https://wa.me/?text=All%20fees%20are%20clear.");
  }

  const message = encodeURIComponent(
    `Dear Parent,%0AThe following fee dues are pending:%0A%0A${list}%0A%0APlease clear them at the earliest.%0A- TrueSunshine School`
  );

  return NextResponse.redirect(`https://wa.me/?text=${message}`);
}
