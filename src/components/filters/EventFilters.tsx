"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function EventFilters({ classes }: any) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const [classId, setClassId] = useState(params.get("classId") || "");
  const [dateFrom, setDateFrom] = useState(params.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState(params.get("dateTo") || "");
  const [type, setType] = useState(params.get("type") || "");

  const applyFilters = () => {
    const q = new URLSearchParams(params.toString());

    classId ? q.set("classId", classId) : q.delete("classId");
    dateFrom ? q.set("dateFrom", dateFrom) : q.delete("dateFrom");
    dateTo ? q.set("dateTo", dateTo) : q.delete("dateTo");
    type ? q.set("type", type) : q.delete("type");

    router.push("?" + q.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const q = new URLSearchParams(params.toString());
    ["classId", "dateFrom", "dateTo", "type"].forEach((k) => q.delete(k));
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
          <div className="w-80 bg-white h-full p-6 shadow-2xl flex flex-col">

            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setOpen(false)} className="text-2xl text-gray-500">×</button>
            </div>

            <div className="mt-6 flex flex-col gap-4 text-sm">

              <div>
                <label className="text-xs text-gray-600">Class</label>
                <select className="w-full border p-2 rounded mt-1" value={classId} onChange={(e) => setClassId(e.target.value)}>
                  <option value="">All</option>
                  <option value="null">Global Events</option>
                  {classes.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-600">Date From</label>
                <input type="date" className="w-full border p-2 rounded mt-1"
                  value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-gray-600">Date To</label>
                <input type="date" className="w-full border p-2 rounded mt-1"
                  value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>

              <div>
                <label className="text-xs text-gray-600">Event Type</label>
                <select className="w-full border p-2 rounded mt-1" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">All</option>
                  <option value="global">Global Events Only</option>
                  <option value="class">Class Events Only</option>
                </select>
              </div>

            </div>

            <div className="mt-auto pt-6 border-t flex gap-3">
              <button onClick={resetFilters} className="flex-1 border p-2 rounded">Reset</button>
              <button onClick={applyFilters} className="flex-1 bg-blue-600 text-white p-2 rounded">Apply</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
