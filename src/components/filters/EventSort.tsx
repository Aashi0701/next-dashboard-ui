"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EventSort() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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
    <div ref={dropdownRef} className="relative">
      {/* ===== DESKTOP SORT (PILL) ===== */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          hidden md:flex
          items-center gap-2
          px-2 py-1.5
          text-sm
          border rounded-2xl
          bg-purple-500
          text-white
          hover:bg-indigo-500
          transition
        "
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

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-lg z-40 text-[10px]">
          <button className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            onClick={() => toggleSort("title")}>By Title</button>

          <button className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            onClick={() => toggleSort("class")}>By Class</button>

          <button className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            onClick={() => toggleSort("date")}>By Date</button>

          <button className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            onClick={() => toggleSort("startTime")}>By Start Time</button>

          <button className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            onClick={() => toggleSort("endTime")}>By End Time</button>
        </div>
      )}
    </div>
  );
}
