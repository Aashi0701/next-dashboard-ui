"use client";

import { useState } from "react";
import { assignStudentFee } from "./actions";

/* ✅ Match Prisma FeeStructure */
type Fee = {
  id: number;
  title: string;        // ✅ FIXED
  amount: number;
  type: string;
  term: string | null;
  class: {
    name: string;
  } | null;
};

export default function StudentFeeForm({
  studentId,
  fees,
}: {
  studentId: string;
  fees: Fee[];
}) {
  const [open, setOpen] = useState(false);
  const [feeId, setFeeId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!feeId) return;

    try {
      setLoading(true);
      setError("");

      await assignStudentFee(studentId, Number(feeId));

      setOpen(false);
      setFeeId("");
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm"
      >
        Assign
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-5 rounded-md w-[360px]">
            <h2 className="font-semibold mb-3">Assign Fee</h2>

            <select
              value={feeId}
              onChange={(e) => setFeeId(Number(e.target.value))}
              className="w-full border rounded-md p-2 mb-3"
            >
              <option value="">Select fee</option>

              {fees.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} {/* ✅ FIX */}
                  {f.term ? ` (${f.term.replace("_", " ")})` : ""}
                  {" – ₹"}
                  {f.amount}
                </option>
              ))}
            </select>

            {error && (
              <p className="text-red-500 text-xs mb-2">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded-md bg-gray-200 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={submit}
                disabled={loading || !feeId}
                className="px-3 py-1 rounded-md bg-green-600 text-white text-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
