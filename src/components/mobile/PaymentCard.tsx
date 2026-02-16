// components/mobile/PaymentCard.tsx

"use client";

import { FaCheckCircle } from "react-icons/fa";

export default function PaymentCard({ item }: { item: any }) {
  const total = item.feeStructure.amount;
  const paid = item.payments.reduce(
    (sum: number, p: any) => sum + p.amount,
    0
  );

  let status = "Pending";
  let statusClass = "bg-red-100 text-red-700";

  if (paid === total) {
    status = "Paid";
    statusClass = "bg-green-100 text-green-700";
  } else if (paid > 0) {
    status = "Partial";
    statusClass = "bg-yellow-100 text-yellow-700";
  }

  return (
    <div className="bg-white border rounded-lg p-4 flex justify-between items-start">
      <div className="flex flex-col gap-1">
        <p className="font-medium">
          {item.student.name} {item.student.surname}
        </p>

        <p className="text-xs text-gray-500">
          {item.student.class?.name}
        </p>

        <p className="text-sm font-semibold">
          ₹{paid} / ₹{total}
        </p>
      </div>

      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}
      >
        {status}
      </span>
    </div>
  );
}
