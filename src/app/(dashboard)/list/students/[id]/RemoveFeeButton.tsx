"use client";

import { useTransition } from "react";
import { removeStudentFee } from "./actions";

/* =====================================================
   TYPES
===================================================== */
type RemoveFeeButtonProps = {
  studentFeeId: number;
  studentId: string;
  variant?: "default" | "compact";
};

/* =====================================================
   COMPONENT
===================================================== */
export default function RemoveFeeButton({
  studentFeeId,
  studentId,
  variant = "default",
}: RemoveFeeButtonProps) {
  const [pending, startTransition] = useTransition();

  const onRemove = () => {
    startTransition(() => {
      removeStudentFee(studentFeeId, studentId);
    });
  };

  return (
    <button
      disabled={pending}
      onClick={onRemove}
      className={
        variant === "compact"
          ? "px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
          : "px-4 py-2 text-sm font-medium rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
      }
    >
      {pending ? "Removing..." : variant === "compact" ? "Remove" : "Remove Fee"}
    </button>
  );
}
