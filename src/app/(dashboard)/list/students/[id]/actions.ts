"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PaymentMode, FeeStatus } from "@prisma/client";

/* ======================================================
   ASSIGN FEE TO STUDENT
   ====================================================== */
export async function assignStudentFee(
  studentId: string,
  feeStructureId: number
) {
  if (!studentId || !feeStructureId) {
    throw new Error("Invalid data");
  }

  // Prevent duplicate assignment
  const exists = await prisma.studentFee.findFirst({
    where: { studentId, feeStructureId },
  });

  if (exists) {
    throw new Error("Fee already assigned to this student");
  }

  // ✅ Fetch fee amount
  const fee = await prisma.feeStructure.findUnique({
    where: { id: feeStructureId },
    select: { amount: true },
  });

  if (!fee) {
    throw new Error("Fee structure not found");
  }

  // ✅ Create student fee with required fields
  await prisma.studentFee.create({
    data: {
      studentId,
      feeStructureId,
      totalAmount: fee.amount,
      paidAmount: 0,
      status: FeeStatus.PENDING,
    },
  });

  revalidatePath(`/list/students/${studentId}`);
}

/* ======================================================
   RECORD PAYMENT
   ====================================================== */
export async function recordPayment(
  studentFeeId: number,
  studentId: string,
  amount: number,
  mode: "CASH" | "UPI" | "CARD" | "BANK_TRANSFER"
) {
  if (!studentFeeId || !studentId) {
    throw new Error("Invalid payment request");
  }

  if (amount <= 0) {
    throw new Error("Payment amount must be greater than zero");
  }

  const studentFee = await prisma.studentFee.findUnique({
    where: { id: studentFeeId },
    include: { payments: true },
  });

  if (!studentFee) {
    throw new Error("Student fee not found");
  }

  const dueAmount = studentFee.totalAmount - studentFee.paidAmount;

  if (amount > dueAmount) {
    throw new Error(`Payment exceeds due amount (₹${dueAmount})`);
  }

  // ✅ Record payment
  await prisma.payment.create({
    data: {
      studentFeeId,
      amount,
      mode,
    },
  });

  // ✅ Update aggregates
  const newPaidAmount = studentFee.paidAmount + amount;

  const newStatus =
    newPaidAmount >= studentFee.totalAmount
      ? FeeStatus.PAID
      : FeeStatus.PARTIAL;

  await prisma.studentFee.update({
    where: { id: studentFeeId },
    data: {
      paidAmount: newPaidAmount,
      status: newStatus,
    },
  });

  revalidatePath(`/list/students/${studentId}`);
}

/* ======================================================
   REMOVE STUDENT FEE
   ====================================================== */
export async function removeStudentFee(
  studentFeeId: number,
  studentId: string
) {
  await prisma.studentFee.delete({
    where: { id: studentFeeId },
  });

  revalidatePath(`/list/students/${studentId}`);
}
