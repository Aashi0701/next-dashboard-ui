// components/filters/ResultSort.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResultSort() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const toggleSort = (field: string) => {
    const q = new URLSearchParams(params.toString());
    const current = params.get("sortBy");
    const currentOrder = params.get("sortOrder") || "asc";
    const newOrder = current === field && currentOrder === "asc" ? "desc" : "asc";
    q.set("sortBy", field);
    q.set("sortOrder", newOrder);
    router.push("?" + q.toString());
    setOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
        <img src="/sort.png" width={18} height={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-40">
          <div className="py-1 text-[10px] text-gray-700">
            <button onClick={() => toggleSort("title")} className="block w-full text-left px-3 py-1.5 hover:bg-gray-100">By Title</button>
            <button onClick={() => toggleSort("student")} className="block w-full text-left px-3 py-1.5 hover:bg-gray-100">By Student</button>
            <button onClick={() => toggleSort("teacher")} className="block w-full text-left px-3 py-1.5 hover:bg-gray-100">By Teacher</button>
            <button onClick={() => toggleSort("class")} className="block w-full text-left px-3 py-1.5 hover:bg-gray-100">By Class</button>
          </div>
        </div>
      )}
    </div>
  );
}
