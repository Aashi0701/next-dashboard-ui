"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AssignmentFilters({ subjects, classes, teachers }: any) {
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
    ["subjectId", "classId", "teacherId", "dateFrom", "dateTo"].forEach((x) =>
      query.delete(x)
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
        <img src="/adjust.png" width={18} />
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-72 bg-white shadow-xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)} className="text-xl">
                ×
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4 text-sm">
              {/* Subject */}
              <div>
                <label>Subject</label>
                <select
                  className="w-full border p-2 rounded mt-1"
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
              <div>
                <label>Class</label>
                <select
                  className="w-full border p-2 rounded mt-1"
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
              <div>
                <label>Teacher</label>
                <select
                  className="w-full border p-2 rounded mt-1"
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

              {/* Dates */}
              <div>
                <label>From Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded mt-1"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label>To Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded mt-1"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-auto flex gap-3">
              <button onClick={resetFilters} className="border p-2 rounded w-1/2">
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white p-2 rounded w-1/2"
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
