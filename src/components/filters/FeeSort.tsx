"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function FeeSort() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  function apply(sortBy: string) {
    const q = new URLSearchParams(params.toString());
    q.set("sortBy", sortBy);
    router.push(`?${q.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hidden md:flex
          items-center gap-2
          px-2 py-1.5
          text-sm
          border rounded-2xl
          bg-purple-500
          text-white
          hover:bg-indigo-500
          transition"
          aria-label="Sort"
      >
        <span className="text-base leading-none">⇅</span>
        Sort
      </button>

      {/* ===== MOBILE SORT (ICON) ===== */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          md:hidden
          w-6 h-6
          rounded-full
          bg-purple-500
          text-white
          flex items-center justify-center
          hover:brightness-95
          transition
        "
        aria-label="Sort"
      >
        ⇅
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md z-20 w-40">
          <button
            onClick={() => apply("title")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            Title (A–Z)
          </button>
          <button
            onClick={() => apply("amount")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            Amount
          </button>
          <button
            onClick={() => apply("type")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            Fee Type
          </button>
        </div>
      )}
    </div>
  );
}
