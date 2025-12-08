import prisma from "@/lib/prisma";
import PDFDocument from "pdfkit/js/pdfkit.standalone";

/* =====================================================
   GET RECEIPT PDF
===================================================== */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ studentFeeId: string }> }
) {
  // ✅ App Router params MUST be awaited
  const { studentFeeId } = await params;
  const feeId = Number(studentFeeId);

  if (Number.isNaN(feeId)) {
    return new Response("Invalid receipt id", { status: 400 });
  }

  /* ================= FETCH DATA ================= */
  const fee = await prisma.studentFee.findUnique({
    where: { id: feeId },
    include: {
      student: true,
      feeStructure: { include: { class: true } },
      payments: { orderBy: { paidAt: "asc" } },
    },
  });

  if (!fee) {
    return new Response("Receipt not found", { status: 404 });
  }

  /* ================= PDF SETUP ================= */
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  const chunks: Uint8Array[] = [];

  // ✅ Explicit chunk typing
  doc.on("data", (chunk: Uint8Array) => {
    chunks.push(chunk);
  });

  /* ================= HEADER ================= */
  doc.fontSize(18).text("TrueSunshine School", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).text("Official Payment Receipt", { align: "center" });
  doc.moveDown(2);

  /* ================= STUDENT INFO ================= */
  doc.fontSize(10);
  doc.text(`Student Name: ${fee.student.name} ${fee.student.surname}`);
  doc.text(`Class: ${fee.feeStructure.class?.name ?? "School-wide"}`);
  doc.text(`Fee Title: ${fee.feeStructure.title}`);
  doc.text(`Receipt No: TS-${fee.id}`);
  doc.text(
    `Generated On: ${new Intl.DateTimeFormat("en-GB").format(new Date())}`
  );

  doc.moveDown();

  /* ================= PAYMENTS ================= */
  doc.fontSize(11).text("Payment History", { underline: true });
  doc.moveDown(0.5);

  fee.payments.forEach((p, i) => {
    doc.text(
      `${i + 1}. ${new Intl.DateTimeFormat("en-GB").format(
        p.paidAt
      )} — ₹${p.amount} — ${p.mode}`
    );
  });

  const totalPaid = fee.payments.reduce((s, p) => s + p.amount, 0);

  doc.moveDown();
  doc.text(`Total Fee: ₹${fee.totalAmount}`);
  doc.text(`Total Paid: ₹${totalPaid}`);
  doc.text(`Pending: ₹${fee.totalAmount - totalPaid}`);

  doc.moveDown(2);
  doc
    .fontSize(9)
    .text(
      "This is a computer-generated receipt and does not require a signature.",
      { align: "center" }
    );

  doc.end();

  // ✅ Wait for PDF stream to finish
  await new Promise<void>((resolve) => {
    doc.on("end", resolve);
  });

  /* ================= BUILD PDF ================= */
  const pdfBytes = new Uint8Array(
    chunks.reduce<number[]>((acc, chunk) => {
      acc.push(...chunk);
      return acc;
    }, [])
  );

  /* ================= RESPONSE ================= */
  return new Response(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename=receipt-${feeId}.pdf`,
    },
  });
}
