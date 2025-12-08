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
      {/* ICON BUTTON */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center hover:bg-yellow-400"
      >
        <Image src="/sort.png" alt="sort" width={14} height={14} />
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
