"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function PaymentSort() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  /* ================= ACTIONS ================= */
  const apply = (sortBy: string) => {
    const q = new URLSearchParams(params.toString());

    q.set("sortBy", sortBy);
    if (!q.get("sortOrder")) q.set("sortOrder", "asc");

    q.set("page", "1");
    router.push(`?${q.toString()}`);
    setOpen(false);
  };

  const toggleOrder = () => {
    const q = new URLSearchParams(params.toString());
    const curr = q.get("sortOrder") || "asc";

    q.set("sortOrder", curr === "asc" ? "desc" : "asc");
    q.set("page", "1");

    router.push(`?${q.toString()}`);
    setOpen(false);
  };

  const hasSort = Boolean(params.get("sortBy"));

  return (
    <div ref={ref} className="relative">
      {/* DESKTOP SORT */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          hidden md:flex items-center gap-2
          px-2 py-1.5 text-sm
          border rounded-2xl
          bg-purple-500 text-white
          hover:bg-indigo-500 transition
        "
      >
        ⇅ Sort
      </button>

      {/* MOBILE SORT */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          md:hidden w-6 h-6 rounded-full
          bg-purple-500 text-white
          flex items-center justify-center
        "
      >
        ⇅
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md z-20 w-44">
          <button
            onClick={() => apply("assignedAt")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            Assigned Date
          </button>

          <button
            onClick={() => apply("total")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            Total Amount
          </button>

          <button
            onClick={() => apply("paid")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            Paid Amount
          </button>

          <button
            onClick={() => apply("due")}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            Due Amount
          </button>

          {hasSort && (
            <button
              onClick={toggleOrder}
              className="w-full px-3 py-2 text-left text-sm border-t hover:bg-gray-100"
            >
              Order:{" "}
              {params.get("sortOrder") === "desc"
                ? "Descending ↓"
                : "Ascending ↑"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
