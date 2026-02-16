"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StudentSort() {
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

  const handleSort = (value: string) => {
    const query = new URLSearchParams(params.toString());
    query.set("sort", value);
    router.push(`/list/students?${query.toString()}`);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="hidden md:flex
          items-center gap-2
          px-2 py-1.5
          text-sm
          border rounded-2xl
          bg-purple-500
          text-white
          hover:bg-indigo-500
          transition"
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
        <div className="absolute right-0 mt-2 w-28 md:w-44 bg-white border shadow-lg rounded-md z-40">
          <div className="py-1 text-[12px] text-gray-700">
          <button
            onClick={() => handleSort("name")}
            className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
          >
            Sort by Name
          </button>
          <button
            onClick={() => handleSort("grade")}
            className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
          >
            Sort by Grade
          </button>
          <button
            onClick={() => handleSort("date")}
            className="block w-full text-left px-3 py-1.5 hover:bg-gray-100"
          >
            Sort by Latest
          </button>
          </div>
        </div>
      )}
    </div>
  );
}
