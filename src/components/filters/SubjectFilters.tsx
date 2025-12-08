"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SubjectFilters({ teachers }: any) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const [teacherId, setTeacherId] = useState(params.get("teacherId") || "");

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    if (teacherId) query.set("teacherId", teacherId);
    else query.delete("teacherId");

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());
    query.delete("teacherId");

    router.push("?" + query.toString());
    setOpen(false);
  };

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow"
      >
        <img src="/adjust.png" width={18} height={18} />
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-72 bg-white shadow-2xl h-full p-6 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col gap-6 mt-6">

              {/* Filter by Teacher */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">
                  Teacher
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Footer */}
            <div className="mt-auto flex gap-2 pt-6 border-t">
              <button
                onClick={resetFilters}
                className="flex-1 p-2 rounded-lg border text-sm hover:bg-gray-100"
              >
                Reset
              </button>

              <button
                onClick={applyFilters}
                className="flex-1 p-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
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
