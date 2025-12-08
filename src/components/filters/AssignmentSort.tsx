"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AssignmentSort() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const toggleSort = (field: string) => {
    const query = new URLSearchParams(params.toString());

    const currentField = params.get("sortBy");
    const currentOrder = params.get("sortOrder") || "asc";

    const newOrder = currentField === field && currentOrder === "asc" ? "desc" : "asc";

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
        <img src="/sort.png" width={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white shadow border rounded z-40">
          <div className="text-[10px] text-gray-700 py-1">
            <button
              onClick={() => toggleSort("subject")}
              className="w-full text-left px-3 py-1 hover:bg-gray-100"
            >
              Subject
            </button>
            <button
              onClick={() => toggleSort("class")}
              className="w-full text-left px-3 py-1 hover:bg-gray-100"
            >
              Class
            </button>
            <button
              onClick={() => toggleSort("teacher")}
              className="w-full text-left px-3 py-1 hover:bg-gray-100"
            >
              Teacher
            </button>
            <button
              onClick={() => toggleSort("dueDate")}
              className="w-full text-left px-3 py-1 hover:bg-gray-100"
            >
              Due Date
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
