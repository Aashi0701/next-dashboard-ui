"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import RadixSelect from "@/components/ui/RadixSelect";
import FilterDrawer from "@/components/filters/FilterDrawer";

interface PaymentFiltersProps {
  classes: { id: number; name: string }[];
  students: { id: string; name: string }[];
}

export default function PaymentFilters({
  classes,
  students,
}: PaymentFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);

  const [studentId, setStudentId] = useState<string>(
    params.get("studentId") || ""
  );
  const [status, setStatus] = useState<string>(
    params.get("status") || ""
  );
  const [classId, setClassId] = useState<string>(
    params.get("classId") || ""
  );

  /* ================= APPLY ================= */

  const applyFilters = () => {
    const q = new URLSearchParams(params.toString());

    studentId ? q.set("studentId", studentId) : q.delete("studentId");
    status ? q.set("status", status) : q.delete("status");
    classId ? q.set("classId", classId) : q.delete("classId");

    // reset pagination
    q.set("page", "1");

    router.push("?" + q.toString());
    setOpen(false);
  };

  /* ================= RESET ================= */

  const resetFilters = () => {
    const q = new URLSearchParams(params.toString());

    ["studentId", "status", "classId"].forEach((k) => q.delete(k));
    q.set("page", "1");

    router.push("?" + q.toString());

    setStudentId("");
    setStatus("");
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
        {/* STUDENT */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Student
          </label>
          <RadixSelect
            value={studentId}
            placeholder="All Students"
            options={students.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
            onChange={(v) => setStudentId(v ?? "")}
          />
        </div>

        {/* STATUS */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Status
          </label>
          <RadixSelect
            value={status}
            placeholder="All Status"
            options={[
              { value: "PAID", label: "Paid" },
              { value: "PARTIAL", label: "Partial" },
              { value: "PENDING", label: "Pending" },
            ]}
            onChange={(v) => setStatus(v ?? "")}
          />
        </div>

        {/* CLASS */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Class
          </label>
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
