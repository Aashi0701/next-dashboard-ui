"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  label = "Back",
}: {
  label?: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition"
    >
      <span className="text-xs font-extrabold">←</span>
      {label}
    </button>
  );
}
