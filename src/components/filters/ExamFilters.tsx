"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ExamFilters({ subjects, classes, teachers }: any) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const [subjectId, setSubjectId] = useState(params.get("subjectId") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [teacherId, setTeacherId] = useState(params.get("teacherId") || "");
  const [dateFrom, setDateFrom] = useState(params.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(params.get("dateTo") || "");

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    subjectId ? query.set("subjectId", subjectId) : query.delete("subjectId");
    classId ? query.set("classId", classId) : query.delete("classId");
    teacherId ? query.set("teacherId", teacherId) : query.delete("teacherId");
    dateFrom ? query.set("dateFrom", dateFrom) : query.delete("dateFrom");
    dateTo ? query.set("dateTo", dateTo) : query.delete("dateTo");

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());

    ["subjectId", "classId", "teacherId", "dateFrom", "dateTo"].forEach((key) =>
      query.delete(key)
    );

    router.push("?" + query.toString());
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
      >
        <img src="/adjust.png" width={18} height={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-80 bg-white shadow-xl h-full p-6 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl text-gray-600 hover:text-gray-800"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-6 mt-6">

              {/* Subject */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Subject</label>
                <select
                  className="p-2 border rounded"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                >
                  <option value="">All</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Class</label>
                <select
                  className="p-2 border rounded"
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                >
                  <option value="">All</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Teacher</label>
                <select
                  className="p-2 border rounded"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">All</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.surname}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">From</label>
                <input
                  type="date"
                  className="p-2 border rounded"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <label className="text-sm font-medium">To</label>
                <input
                  type="date"
                  className="p-2 border rounded"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-auto pt-6 border-t">
              <button
                onClick={resetFilters}
                className="flex-1 border rounded p-2 text-sm hover:bg-gray-100"
              >
                Reset
              </button>

              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white rounded p-2 text-sm hover:bg-blue-700"
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
