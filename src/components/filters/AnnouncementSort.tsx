"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AnnouncementSort() {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  const toggleSort = (field: string) => {
    const q = new URLSearchParams(params.toString());
    const current = params.get("sortBy");
    const currentOrder = params.get("sortOrder") || "asc";

    const newOrder =
      current === field && currentOrder === "asc" ? "desc" : "asc";

    q.set("sortBy", field);
    q.set("sortOrder", newOrder);

    router.push("?" + q.toString());
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
        <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 shadow-lg rounded-md z-40">
          <div className="py-1 text-[10px] text-gray-700">
            <button
              onClick={() => toggleSort("title")}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
            >
              Sort by Title
            </button>

            <button
              onClick={() => toggleSort("class")}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
            >
              Sort by Class
            </button>

            <button
              onClick={() => toggleSort("date")}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
            >
              Sort by Date
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
