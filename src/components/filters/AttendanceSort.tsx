"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AttendanceSort() {
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
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-lamaYellow flex justify-center items-center"
      >
        <img src="/sort.png" width={18} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-white shadow-lg border rounded text-[10px] z-40">
          <button
            onClick={() => toggleSort("student")}
            className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
          >
            By Student
          </button>
          <button
            onClick={() => toggleSort("lesson")}
            className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
          >
            By Lesson
          </button>
          <button
            onClick={() => toggleSort("class")}
            className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
          >
            By Class
          </button>
          <button
            onClick={() => toggleSort("date")}
            className="w-full text-left px-3 py-1.5 hover:bg-gray-100"
          >
            By Date
          </button>
        </div>
      )}
    </div>
  );
}
