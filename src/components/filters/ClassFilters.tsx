"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import RadixSelect from "@/components/ui/RadixSelect";

export default function ClassFilters({ supervisors }: any) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);
  const [supervisorId, setSupervisorId] = useState(
    params.get("supervisorId") || ""
  );

  /* ================= LOCK BACKGROUND SCROLL ================= */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* ================= ACTIONS ================= */

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    supervisorId
      ? query.set("supervisorId", supervisorId)
      : query.delete("supervisorId");

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());
    query.delete("supervisorId");

    router.push("?" + query.toString());
    setSupervisorId("");
    setOpen(false);
  };

  /* ================= UI ================= */

  return (
    <>
      {/* ===== DESKTOP FILTER BUTTON ===== */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm rounded-2xl bg-purple-500 text-white hover:bg-indigo-500 transition"
      >
        <Image src="/filter1.png" alt="filter" width={14} height={14} />
        Filter
      </button>

      {/* ===== MOBILE FILTER BUTTON ===== */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
      >
        <Image src="/filter1.png" alt="filter" width={14} height={14} />
      </button>

      {/* ===== DRAWER ===== */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          {/* CLICK OUTSIDE */}
          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
          />

          <div
            className="
              fixed bottom-0 left-0 right-0
              md:top-0 md:right-0 md:left-auto
              h-[45%] md:h-full
              max-h-[85vh] md:max-h-none
              md:w-80
              bg-white
              rounded-t-2xl md:rounded-none
              shadow-xl
              flex flex-col
            "
          >
            {/* HEADER */}
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h2 className="text-base font-semibold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-lg"
              >
                ×
              </button>
            </div>

            {/* BODY */}
            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Supervisor
                </label>

                <RadixSelect
                  value={supervisorId}
                  onChange={(v) => setSupervisorId(v ?? "")}
                  placeholder="All Supervisors"
                  options={supervisors.map((s: any) => ({
                    value: String(s.id), // ✅ non-empty
                    label: `${s.name} ${s.surname}`,
                  }))}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-5 py-4 border-t flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 border rounded-xl py-2 text-sm"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
