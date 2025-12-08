"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AnnouncementFilters({ classes }: any) {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const params = useSearchParams();

  const [classId, setClassId] = useState(params.get("classId") || "");
  const [dateFrom, setDateFrom] = useState(params.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(params.get("dateTo") || "");

  const applyFilters = () => {
    const q = new URLSearchParams(params.toString());

    classId ? q.set("classId", classId) : q.delete("classId");
    dateFrom ? q.set("dateFrom", dateFrom) : q.delete("dateFrom");
    dateTo ? q.set("dateTo", dateTo) : q.delete("dateTo");

    router.push("?" + q.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const q = new URLSearchParams(params.toString());
    ["classId", "dateFrom", "dateTo"].forEach((k) => q.delete(k));
    router.push("?" + q.toString());
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
            <div className="flex justify-between items-center border-b pb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl text-gray-500"
              >
                ×
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-5 text-sm">
              <div>
                <label className="text-xs text-gray-600">Class</label>
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

              <div>
                <label className="text-xs text-gray-600">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full border p-2 rounded mt-1"
                />
              </div>
            </div>

            <div className="mt-auto pt-6 border-t flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 p-2 rounded border text-sm"
              >
                Reset
              </button>

              <button
                onClick={applyFilters}
                className="flex-1 p-2 rounded bg-blue-600 text-white text-sm"
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
