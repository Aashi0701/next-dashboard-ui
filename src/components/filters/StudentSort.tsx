"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StudentSort() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handleSort = (value: string) => {
    const query = new URLSearchParams(params.toString());
    query.set("sort", value);
    router.push(`/list/students?${query.toString()}`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
      >
        <img src="/sort.png" width={18} height={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-md w-40 border z-40">
          <div className="py-1 text-[12px] text-gray-700">
          <button
            onClick={() => handleSort("name")}
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Sort by Name
          </button>
          <button
            onClick={() => handleSort("grade")}
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Sort by Grade
          </button>
          <button
            onClick={() => handleSort("date")}
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Newest First
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
