"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import RadixSelect from "@/components/ui/RadixSelect";
import FilterDrawer from "@/components/filters/FilterDrawer";

export default function FeeFilters({
  classes = [],
}: {
  classes: { id: number; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState(params.get("classId") || "");

  /* ================= APPLY ================= */

  const applyFilters = () => {
    const q = new URLSearchParams(params.toString());

    classId ? q.set("classId", classId) : q.delete("classId");

    router.push("?" + q.toString());
    setOpen(false);
  };

  /* ================= RESET ================= */

  const resetFilters = () => {
    const q = new URLSearchParams(params.toString());
    q.delete("classId");

    router.push("?" + q.toString());
    setClassId("");
    setOpen(false);
  };

  /* ================= UI ================= */

  return (
    <>
      {/* DESKTOP FILTER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm rounded-2xl bg-purple-500 text-white hover:bg-indigo-500 transition"
      >
        <Image src="/filter1.png" alt="filter" width={14} height={14} />
        Filter
      </button>

      {/* MOBILE FILTER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
      >
        <Image src="/filter1.png" alt="filter" width={14} height={14} />
      </button>

      <FilterDrawer
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex gap-3">
            <button
              onClick={resetFilters}
              className="flex-1 h-11 border rounded-xl text-sm"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 h-11 bg-blue-600 text-white rounded-xl text-sm font-medium"
            >
              Apply
            </button>
          </div>
        }
      >
        {/* CLASS */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Class</label>
          <RadixSelect
            value={classId}
            placeholder="All Classes"
            options={classes.map((c) => ({
              value: String(c.id),
              label: c.name,
            }))}
            onChange={(v) => setClassId(v ?? "")}
          />
        </div>
      </FilterDrawer>
    </>
  );
}
