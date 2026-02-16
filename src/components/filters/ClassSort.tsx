"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ClassSort() {
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
    const query = new URLSearchParams(params.toString());

    const currentField = query.get("sortBy");
    const currentOrder = query.get("sortOrder") || "asc";

    const newOrder =
      currentField === field && currentOrder === "asc" ? "desc" : "asc";

    query.set("sortBy", field);
    query.set("sortOrder", newOrder);

    router.push("?" + query.toString());
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

      {/* ===== DROPDOWN ===== */}
      {open && (
        <div className="absolute right-0 mt-2 w-28 md:w-44 bg-white border shadow-lg rounded-md z-40">
          <div className="py-1 text-[10px] text-gray-700">
            <button
              onClick={() => toggleSort("name")}
              className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            >
              Name
            </button>

            <button
              onClick={() => toggleSort("capacity")}
              className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            >
              Capacity
            </button>

            <button
              onClick={() => toggleSort("grade")}
              className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            >
              Grade
            </button>

            <button
              onClick={() => toggleSort("date")}
              className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
            >
              Newly Added
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
