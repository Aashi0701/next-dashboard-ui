"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function AttendanceFilters({ students, lessons }: any) {
  const [open, setOpen] = useState(false);

  const params = useSearchParams();
  const router = useRouter();

  const [studentId, setStudentId] = useState(params.get("studentId") || "");
  const [lessonId, setLessonId] = useState(params.get("lessonId") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [present, setPresent] = useState(params.get("present") || "");
  const [dateFrom, setDateFrom] = useState(params.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(params.get("dateTo") || "");

  const apply = () => {
    const q = new URLSearchParams(params.toString());

    studentId ? q.set("studentId", studentId) : q.delete("studentId");
    lessonId ? q.set("lessonId", lessonId) : q.delete("lessonId");
    classId ? q.set("classId", classId) : q.delete("classId");
    present ? q.set("present", present) : q.delete("present");

    dateFrom ? q.set("dateFrom", dateFrom) : q.delete("dateFrom");
    dateTo ? q.set("dateTo", dateTo) : q.delete("dateTo");

    router.push("?" + q.toString());
    setOpen(false);
  };

  const reset = () => {
    router.push("?");
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-full bg-lamaYellow flex justify-center items-center"
      >
        <img src="/adjust.png" width={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <div className="w-80 bg-white p-6 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>

            <label className="text-xs">Student</label>
            <select
              className="border p-2 rounded mb-3"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">All</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.surname}
                </option>
              ))}
            </select>

            <label className="text-xs">Lesson</label>
            <select
              className="border p-2 rounded mb-3"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
            >
              <option value="">All</option>
              {lessons.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.subject.name} - {l.class.name}
                </option>
              ))}
            </select>

            <label className="text-xs">Class</label>
            <select
              className="border p-2 rounded mb-3"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">All</option>
              {lessons
                .map((l: any) => l.class)
                .filter(
                  (c: any, idx: number, arr: any[]) =>
                    arr.findIndex((a) => a.id === c.id) === idx
                )
                .map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>

            <label className="text-xs">Status</label>
            <select
              className="border p-2 rounded mb-3"
              value={present}
              onChange={(e) => setPresent(e.target.value)}
            >
              <option value="">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>

            <label className="text-xs">Date From</label>
            <input
              type="date"
              className="border p-2 rounded mb-3"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <label className="text-xs">Date To</label>
            <input
              type="date"
              className="border p-2 rounded mb-3"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />

            <div className="mt-auto flex gap-3">
              <button className="border p-2 rounded flex-1" onClick={reset}>
                Reset
              </button>
              <button
                className="bg-blue-600 text-white p-2 rounded flex-1"
                onClick={apply}
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
