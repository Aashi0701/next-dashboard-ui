"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ExamSort() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const toggleSort = (field: string) => {
    const query = new URLSearchParams(params.toString());

    const currentField = params.get("sortBy");
    const currentOrder = params.get("sortOrder") || "asc";

    const newOrder =
      currentField === field && currentOrder === "asc" ? "desc" : "asc";

    query.set("sortBy", field);
    query.set("sortOrder", newOrder);

    router.push("?" + query.toString());
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
      >
        <img src="/sort.png" width={18} height={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-40">
          <div className="py-1 text-[10px]">

            <button onClick={() => toggleSort("subject")} className="block w-full px-3 py-1.5 text-left hover:bg-gray-100">
              Sort by Subject
            </button>

            <button onClick={() => toggleSort("class")} className="block w-full px-3 py-1.5 text-left hover:bg-gray-100">
              Sort by Class
            </button>

            <button onClick={() => toggleSort("teacher")} className="block w-full px-3 py-1.5 text-left hover:bg-gray-100">
              Sort by Teacher
            </button>

            <button onClick={() => toggleSort("date")} className="block w-full px-3 py-1.5 text-left hover:bg-gray-100">
              Sort by Date
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
