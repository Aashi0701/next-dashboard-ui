"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ParentFilters({ students }: any) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const [studentId, setStudentId] = useState(params.get("studentId") || "");

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    if (studentId) query.set("studentId", studentId);
    else query.delete("studentId");

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());
    query.delete("studentId");
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
          <div className="w-80 bg-white shadow-2xl h-full p-6 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl font-light text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="mt-6 flex flex-col gap-6">
              
              {/* Student Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Filter by Student
                </label>

                <select
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  <option value="">All</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="mt-auto pt-6 border-t flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 border border-gray-300 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition"
              >
                Reset
              </button>

              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white p-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
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
