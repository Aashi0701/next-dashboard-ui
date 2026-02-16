"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import FilterDrawer from "@/components/filters/FilterDrawer";
import RadixSelect from "@/components/ui/RadixSelect";

/* ================= TYPES ================= */

type Props = {
  teachers: { id: string; name: string }[];
};

/* ================= COMPONENT ================= */

export default function SubjectFilters({ teachers }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);
  const [teacherId, setTeacherId] = useState(
    params.get("teacherId") || ""
  );

  /* ================= ACTIONS ================= */

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    teacherId
      ? query.set("teacherId", teacherId)
      : query.delete("teacherId");

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());
    query.delete("teacherId");

    router.push("?" + query.toString());

    setTeacherId("");
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
        {/* TEACHER */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Teacher
          </label>

          <RadixSelect
            value={teacherId}
            onChange={(v) => setTeacherId(v ?? "")}
            placeholder="All Teachers"
            options={teachers.map((t) => ({
              value: t.id, // ✅ non-empty
              label: t.name,
            }))}
          />
        </div>
      </FilterDrawer>
    </>
  );
}
