"use client";

import { useState } from "react";
import { recordPayment } from "./actions";

/* =====================================================
   TYPES
===================================================== */
type Payment = {
  amount: number;
  paidAt: Date;
  mode: string;
};

type PaymentFormProps = {
  studentId: string;
  studentFeeId: number;
  dueAmount: number;
  payments?: Payment[];
  variant?: "default" | "compact";
};

/* =====================================================
   COMPONENT
===================================================== */
export default function PaymentForm({
  studentId,
  studentFeeId,
  dueAmount,
  payments = [],
  variant = "default",
}: PaymentFormProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(dueAmount);
  const [mode, setMode] = useState<
    "CASH" | "UPI" | "CARD" | "BANK_TRANSFER"
  >("CASH");
  const [loading, setLoading] = useState(false);

  /* ================= ACTION ================= */
  const submitPayment = async () => {
    if (amount <= 0 || amount > dueAmount) return;

    try {
      setLoading(true);
      await recordPayment(studentFeeId, studentId, amount, mode);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className={
          variant === "compact"
            ? "px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-md"
            : "px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md"
        }
      >
        {variant === "compact" ? "Pay" : "+ Record Payment"}
      </button>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-[400px] rounded-lg p-5 space-y-4">
            <h2 className="text-lg font-semibold">Record Payment</h2>

            {/* PAYMENT HISTORY */}
            {payments.length > 0 && (
              <div className="border rounded-md p-3 bg-gray-50 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Payment History</p>

                  {/* ✅ RECEIPT BUTTON */}
                  <a
                    href={`/api/receipts/${studentFeeId}`}
                    target="_blank"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View Receipt (PDF)
                  </a>
                </div>

                <div className="space-y-1">
                  {payments.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-xs text-gray-600"
                    >
                      <span>
                        {new Intl.DateTimeFormat("en-GB").format(
                          new Date(p.paidAt)
                        )}
                      </span>
                      <span className="font-medium">
                        ₹{p.amount}
                      </span>
                      <span>{p.mode}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DUE */}
            <p className="text-sm">
              Due Amount:{" "}
              <span className="font-semibold text-red-600">
                ₹{dueAmount}
              </span>
            </p>

            {/* AMOUNT */}
            <input
              type="number"
              value={amount}
              min={1}
              max={dueAmount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Payment amount"
            />

            {/* PAYMENT MODE */}
            <select
              value={mode}
              onChange={(e) =>
                setMode(
                  e.target.value as
                    | "CASH"
                    | "UPI"
                    | "CARD"
                    | "BANK_TRANSFER"
                )
              }
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>

            {/* ACTIONS */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-3 py-1.5 text-sm bg-gray-200 rounded-md"
              >
                Cancel
              </button>

              <button
                onClick={submitPayment}
                disabled={loading || amount <= 0 || amount > dueAmount}
                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
