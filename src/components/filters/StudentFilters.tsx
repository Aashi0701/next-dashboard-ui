"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function StudentFilters({ grades, classes }: any) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  const [grade, setGrade] = useState(params.get("grade") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    if (grade) query.set("grade", grade);
    else query.delete("grade");

    if (classId) query.set("classId", classId);
    else query.delete("classId");

    router.push(`/list/students?${query.toString()}`);
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());
    query.delete("grade");
    query.delete("classId");
    router.push(`/list/students?${query.toString()}`);
    setOpen(false);
  };

  return (
    <>
      {/* Adjust Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
      >
        <img src="/adjust.png" width={18} height={18} />
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-80 bg-white shadow-xl h-full p-6 flex flex-col gap-6">
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-xl text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Grade Filter */}
            <div>
              <label className="text-sm font-medium text-gray-600">Grade</label>
              <select
                className="w-full p-3 border rounded-lg mt-2"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                <option value="">All</option>
                {grades.map((g: any) => (
                  <option value={g.id} key={g.id}>
                    {g.level}
                  </option>
                ))}
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <label className="text-sm font-medium text-gray-600">Class</label>
              <select
                className="w-full p-3 border rounded-lg mt-2"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                <option value="">All</option>
                {classes.map((c: any) => (
                  <option value={c.id} key={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={resetFilters}
                className="flex-1 border rounded-lg p-2"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white p-2 rounded-lg"
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
