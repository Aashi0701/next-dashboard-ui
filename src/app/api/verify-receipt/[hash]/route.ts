import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateVerifyHash } from "@/lib/receipt/generateVerifyHash";
import { generateReceiptNo } from "@/lib/receipt/generateReceiptNo";

export async function GET(
  _req: Request,
  { params }: { params: { hash: string } }
) {
  const { hash } = params;

  console.log("====== VERIFY-RECEIPT API HIT ======");
  console.log("Incoming hash:", hash);

  // Load all receipts
  const fees = await prisma.studentFee.findMany({
    include: {
      student: true,
      feeStructure: true,
      payments: true,
    },
  });

  console.log("Total fees found:", fees.length);

  for (const fee of fees) {
    // Generate same receipt number used in PDF
    const receiptNo = generateReceiptNo(fee.id, new Date());

    const totalPaid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
    const pending = fee.totalAmount - totalPaid;

    const expectedHash = generateVerifyHash({
      studentFeeId: fee.id,
      totalPaid,
      receiptNo,
    });

    console.log(
      `Checking fee.id=${fee.id} | receiptNo=${receiptNo} | expectedHash=${expectedHash}`
    );

    // Match hash
    if (expectedHash === hash) {
      const payload = {
        valid: true,
        studentFeeId: fee.id, // REQUIRED for download receipt
        receiptNo,
        student: {
          name: fee.student.name,
          surname: fee.student.surname,
        },
        feeTitle: fee.feeStructure.title,
        totalAmount: fee.totalAmount,
        totalPaid,
        pending,
        status: fee.status,
        verifiedAt: new Date().toISOString(),
      };

      console.log("MATCH FOUND! Returning payload:", payload);
      console.log("====================================");

      return NextResponse.json(payload);
    }
  }

  console.log("NO MATCH FOUND → Returning invalid");
  console.log("====================================");

  return NextResponse.json({ valid: false }, { status: 404 });
}
