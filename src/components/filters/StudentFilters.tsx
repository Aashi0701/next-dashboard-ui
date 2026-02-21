"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import FilterDrawer from "@/components/filters/FilterDrawer";
import RadixSelect from "@/components/ui/RadixSelect";

/* ================= TYPES ================= */

type Props = {
  classes: { id: number; name: string }[];
};

/* ================= COMPONENT ================= */

export default function StudentFilters({ classes }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);

  const [classId, setClassId] = useState(
    params.get("classId") || "",
  );

  /* ================= ACTIONS ================= */

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    classId
      ? query.set("classId", classId)
      : query.delete("classId");

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());

    query.delete("classId");

    router.push("?" + query.toString());

    setClassId("");
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

      {/* ===== FILTER DRAWER ===== */}
      <FilterDrawer
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex gap-3">
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
        }
      >
        {/* CLASS */}
        <div>
          <label className="font-medium text-gray-700">Class</label>
          <RadixSelect
            value={classId}
            onChange={(v) => setClassId(v ?? "")}
            placeholder="All Classes"
            options={classes.map((c) => ({
              value: String(c.id),
              label: c.name,
            }))}
          />
        </div>
      </FilterDrawer>
    </>
  );
}