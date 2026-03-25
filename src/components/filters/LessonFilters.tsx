"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import FilterDrawer from "@/components/filters/FilterDrawer";
import RadixSelect from "@/components/ui/RadixSelect";

/* ================= TYPES ================= */

type Props = {
  subjects: { id: number; name: string }[];
  classes: { id: number; name: string }[];
  teachers?: { id: string; name: string; surname: string }[];
  role?: string;
};

/* ================= COMPONENT ================= */

export default function LessonFilters({
  subjects,
  classes,
  teachers,
  role,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);

  const [subjectId, setSubjectId] = useState(params.get("subjectId") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [teacherId, setTeacherId] = useState(params.get("teacherId") || "");

  /* ================= ACTIONS ================= */

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    subjectId ? query.set("subjectId", subjectId) : query.delete("subjectId");

    classId ? query.set("classId", classId) : query.delete("classId");

    if (role === "admin") {
      teacherId ? query.set("teacherId", teacherId) : query.delete("teacherId");
    }

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());

    ["subjectId", "classId"].forEach((k) => query.delete(k));

    if (role === "admin") {
      query.delete("teacherId");
    }

    router.push("?" + query.toString());

    setSubjectId("");
    setClassId("");
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
        {/* SUBJECT */}
        <div>
          <label className="font-medium text-gray-700">Subject</label>
          <RadixSelect
            value={subjectId}
            onChange={(v) => setSubjectId(v ?? "")}
            placeholder="All Subjects"
            options={subjects.map((s) => ({
              value: String(s.id),
              label: s.name,
            }))}
          />
        </div>

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

        {/* TEACHER */}
        {/* TEACHER (ADMIN ONLY) */}
        {role === "admin" && teachers && (
          <div>
            <label className="font-medium text-gray-700">Teacher</label>
            <RadixSelect
              value={teacherId}
              onChange={(v) => setTeacherId(v ?? "")}
              placeholder="All Teachers"
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.name} ${t.surname}`,
              }))}
            />
          </div>
        )}
      </FilterDrawer>
    </>
  );
}
