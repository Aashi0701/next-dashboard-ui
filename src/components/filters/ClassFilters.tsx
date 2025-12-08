"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ClassFilters({ supervisors }: any) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  const [supervisorId, setSupervisorId] = useState(params.get("supervisorId") || "");

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    if (supervisorId) query.set("supervisorId", supervisorId);
    else query.delete("supervisorId");

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());
    query.delete("supervisorId");

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

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-72 bg-white shadow-xl h-full p-6 flex flex-col">

            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button onClick={() => setOpen(false)} className="text-2xl text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="flex flex-col gap-6 mt-6">

              {/* Supervisor Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-600">Supervisor</label>
                <select
                  className="p-3 border rounded-lg text-sm"
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                >
                  <option value="">All</option>
                  {supervisors.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.surname}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="mt-auto flex gap-2 pt-6 border-t">
              <button
                onClick={resetFilters}
                className="flex-1 border rounded-lg p-2 text-sm hover:bg-gray-100"
              >
                Reset
              </button>

              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white rounded-lg p-2 text-sm hover:bg-blue-700"
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
