"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ParentSort() {
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
              Sort by Latest
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
