"use client";

import React, { useEffect, useState } from "react";

export default function VerifyReceiptPage({
  params,
}: {
  params: Promise<{ hash: string }> | { hash: string };
}) {
  // STEP 1: unwrap params safely for both cases
  let unwrapped: { hash: string };

  if (params instanceof Promise) {
    // Next.js migration behavior → unwrap with React.use()
    unwrapped = (React as any).use(params);
  } else {
    unwrapped = params;
  }

  // STEP 2: Now hash is ALWAYS a non-undefined string
  const hash: string = unwrapped.hash;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  /* ================= VERIFY RECEIPT ================= */
  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/verify-receipt/${hash}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          setError("Invalid or expired receipt.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setResult(data);
      } catch {
        setError("Failed to verify the receipt.");
      }
      setLoading(false);
    }

    verify();
  }, [hash]);

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-gray-500 text-lg">Verifying your receipt…</div>
      </div>
    );
  }

  /* ================= INVALID RECEIPT ================= */
  if (error || !result?.valid) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center border border-red-200">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <span className="text-red-600 text-3xl">✖</span>
            </div>
          </div>

          <h1 className="text-xl font-bold text-red-600 mb-3">
            Invalid or Expired Receipt
          </h1>
          <p className="text-gray-600">
            The verification link is invalid or the receipt cannot be authenticated.
          </p>
        </div>
      </div>
    );
  }

  /* ================= VALID RECEIPT ================= */
  const data = result;

  return (
    <div className="flex justify-center px-4 py-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full border border-gray-200">

        {/* Animated Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
            <span className="text-green-600 text-4xl">✔</span>
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-green-600 text-center mb-2">
          Receipt Verified
        </h1>

        <p className="text-center text-gray-600 mb-6 text-sm">
          The receipt is authentic and validated by TrueSunshine Educational Society.
        </p>

        <hr className="my-4 border-gray-300" />

        {/* Receipt Details */}
        <div className="space-y-3 text-gray-800 text-sm">

          <div>
            <span className="font-medium">Receipt No:</span> {data.receiptNo}
          </div>

          <div>
            <span className="font-medium">Student:</span>{" "}
            {data.student.name} {data.student.surname}
          </div>

          <div>
            <span className="font-medium">Fee Category:</span> {data.feeTitle}
          </div>

          <div>
            <span className="font-medium">Total Amount:</span> ₹
            {data.totalAmount.toLocaleString("en-IN")}
          </div>

          <div>
            <span className="font-medium">Total Paid:</span> ₹
            {data.totalPaid.toLocaleString("en-IN")}
          </div>

          <div>
            <span className="font-medium">Pending:</span> ₹
            {data.pending.toLocaleString("en-IN")}
          </div>

          <div>
            <span className="font-medium">Status:</span>{" "}
            <span className="text-green-600 font-bold">{data.status}</span>
          </div>
        </div>

        <hr className="my-5 border-gray-300" />

        <p className="text-xs text-gray-500 text-center mb-4">
          Verified at: {data.verifiedAt}
        </p>

        {/* Download Button */}
        <div className="flex justify-center">
          <a
            href={`/api/receipts/${data.studentFeeId}`}
            target="_blank"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-md transition-all"
          >
            Download Verified Receipt
          </a>
        </div>
      </div>
    </div>
  );
}
