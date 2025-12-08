// components/filters/ResultFilters.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResultFilters({ students, teachers, classes, subjects }: any) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const [studentId, setStudentId] = useState(params.get("studentId") || "");
  const [teacherId, setTeacherId] = useState(params.get("teacherId") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [subjectId, setSubjectId] = useState(params.get("subjectId") || "");
  const [typeFilter, setTypeFilter] = useState(params.get("type") || ""); // "exam" | "assignment" | ""

  // Safety: if any list is undefined fallback to empty array (prevents runtime .map errors)
  const safeStudents = Array.isArray(students) ? students : [];
  const safeTeachers = Array.isArray(teachers) ? teachers : [];
  const safeClasses = Array.isArray(classes) ? classes : [];
  const safeSubjects = Array.isArray(subjects) ? subjects : [];

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());
    studentId ? query.set("studentId", studentId) : query.delete("studentId");
    teacherId ? query.set("teacherId", teacherId) : query.delete("teacherId");
    classId ? query.set("classId", classId) : query.delete("classId");
    subjectId ? query.set("subjectId", subjectId) : query.delete("subjectId");
    typeFilter ? query.set("type", typeFilter) : query.delete("type");
    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const q = new URLSearchParams(params.toString());
    ["studentId", "teacherId", "classId", "subjectId", "type"].forEach((k) => q.delete(k));
    router.push("?" + q.toString());
    setOpen(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
        <img src="/adjust.png" width={18} height={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-80 bg-white shadow-2xl h-full p-6 flex flex-col">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setOpen(false)} className="text-2xl text-gray-500">×</button>
            </div>

            <div className="mt-6 flex flex-col gap-4 text-sm">
              <div>
                <label className="text-xs text-gray-600">Student</label>
                <select className="w-full border p-2 rounded mt-1" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
                  <option value="">All</option>
                  {safeStudents.map((s: any) => <option key={s.id} value={s.id}>{s.name} {s.surname}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Teacher</label>
                <select className="w-full border p-2 rounded mt-1" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                  <option value="">All</option>
                  {safeTeachers.map((t: any) => <option key={t.id} value={t.id}>{t.name} {t.surname}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Class</label>
                <select className="w-full border p-2 rounded mt-1" value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">All</option>
                  {safeClasses.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Subject</label>
                <select className="w-full border p-2 rounded mt-1" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                  <option value="">All</option>
                  {safeSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Type</label>
                <select className="w-full border p-2 rounded mt-1" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="exam">Exam</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
            </div>

            <div className="mt-auto pt-6 border-t flex gap-3">
              <button onClick={resetFilters} className="flex-1 border rounded p-2 text-sm">Reset</button>
              <button onClick={applyFilters} className="flex-1 bg-blue-600 text-white p-2 rounded text-sm">Apply</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
