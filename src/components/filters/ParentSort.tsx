"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ParentSort() {
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
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-40">
          <div className="py-1 text-[10px] text-gray-700">

            <button
              onClick={() => toggleSort("name")}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
            >
              Sort by Name
            </button>

            <button
              onClick={() => toggleSort("phone")}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
            >
              Sort by Phone
            </button>

            <button
              onClick={() => toggleSort("address")}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
            >
              Sort by Address
            </button>

            <button
              onClick={() => toggleSort("date")}
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md"
            >
              Newly Added
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
