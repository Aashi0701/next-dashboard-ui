"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import RadixSelect from "@/components/ui/RadixSelect";
import FilterDrawer from "@/components/filters/FilterDrawer";

/* ================= COMPONENT ================= */

export default function ResultFilters({
  students = [],
  teachers = [],
  classes = [],
  subjects = [],
}: any) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);

  const [studentId, setStudentId] = useState(params.get("studentId") || "");
  const [teacherId, setTeacherId] = useState(params.get("teacherId") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [subjectId, setSubjectId] = useState(params.get("subjectId") || "");
  const [type, setType] = useState(params.get("type") || "");

  /* ================= APPLY ================= */

  const applyFilters = () => {
    const q = new URLSearchParams(params.toString());

    studentId ? q.set("studentId", studentId) : q.delete("studentId");
    teacherId ? q.set("teacherId", teacherId) : q.delete("teacherId");
    classId ? q.set("classId", classId) : q.delete("classId");
    subjectId ? q.set("subjectId", subjectId) : q.delete("subjectId");
    type ? q.set("type", type) : q.delete("type");

    router.push("?" + q.toString());
    setOpen(false);
  };

  /* ================= RESET ================= */

  const resetFilters = () => {
    const q = new URLSearchParams(params.toString());
    ["studentId", "teacherId", "classId", "subjectId", "type"].forEach((k) =>
      q.delete(k)
    );

    router.push("?" + q.toString());

    setStudentId("");
    setTeacherId("");
    setClassId("");
    setSubjectId("");
    setType("");

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
        <Image src="/filter1.png" width={14} height={14} alt="filter" />
        Filter
      </button>

      {/* ===== MOBILE FILTER BUTTON ===== */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
      >
        <Image src="/filter1.png" width={14} height={14} alt="filter" />
      </button>

      {/* ===== FILTER DRAWER ===== */}
      <FilterDrawer
        open={open}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex gap-3">
            <button
              onClick={resetFilters}
              className="flex-1 h-11 border rounded-xl text-sm font-medium"
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
        <FilterSelect
          label="Student"
          value={studentId}
          onChange={setStudentId}
          placeholder="All Students"
          options={students.map((s: any) => ({
            value: s.id,
            label: `${s.name} ${s.surname}`,
          }))}
        />

        {/* TEACHER */}
        <FilterSelect
          label="Teacher"
          value={teacherId}
          onChange={setTeacherId}
          placeholder="All Teachers"
          options={teachers.map((t: any) => ({
            value: t.id,
            label: `${t.name} ${t.surname}`,
          }))}
        />

        {/* CLASS */}
        <FilterSelect
          label="Class"
          value={classId}
          onChange={setClassId}
          placeholder="All Classes"
          options={classes.map((c: any) => ({
            value: String(c.id),
            label: c.name,
          }))}
        />

        {/* SUBJECT */}
        <FilterSelect
          label="Subject"
          value={subjectId}
          onChange={setSubjectId}
          placeholder="All Subjects"
          options={subjects.map((s: any) => ({
            value: String(s.id),
            label: s.name,
          }))}
        />

        {/* TYPE */}
        <FilterSelect
          label="Type"
          value={type}
          onChange={setType}
          placeholder="All Types"
          options={[
            { value: "exam", label: "Exam" },
            { value: "assignment", label: "Assignment" },
          ]}
        />
      </FilterDrawer>
    </>
  );
}

/* ================= SUB COMPONENT ================= */

function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <RadixSelect
        value={value}
        placeholder={placeholder}
        options={options}
        onChange={(v) => onChange(v ?? "")}
      />
    </div>
  );
}
