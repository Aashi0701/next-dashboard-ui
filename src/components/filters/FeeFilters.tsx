"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState } from "react";

export default function FeeFilters({
  classes,
}: {
  classes: { id: number; name: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  function apply(classId?: string) {
    const q = new URLSearchParams(params.toString());

    if (classId) q.set("classId", classId);
    else q.delete("classId");

    router.push(`?${q.toString()}`);
    setOpen(false);
  }

  return (
    <div className="relative">
      {/* ICON BUTTON */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center hover:bg-yellow-400"
      >
        <Image src="/filter.png" alt="filter" width={14} height={14} />
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 bg-white border rounded-md shadow-md z-20 w-44">
          <button
            onClick={() => apply()}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
          >
            All Classes
          </button>

          {classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => apply(String(cls.id))}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
            >
              {cls.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
