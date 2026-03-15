"use client";

import { payFee } from "@/lib/payFee";

export default function PayFeeButton({
  amount,
  studentFeeId,
}: {
  amount: number;
  studentFeeId: number;
}) {
  return (
    <button
      onClick={() => payFee(amount, studentFeeId)}
      className="mt-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-lg hover:bg-purple-700"
    >
      Pay Now
    </button>
  );
}