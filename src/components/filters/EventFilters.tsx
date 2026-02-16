"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import RadixSelect from "@/components/ui/RadixSelect";
import FilterDrawer from "@/components/filters/FilterDrawer";

type Props = {
  classes: { id: number; name: string }[];
};

export default function EventFilters({ classes = [] }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);

  // App state uses empty string
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [type, setType] = useState(params.get("type") || "");

  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    params.get("dateFrom") ? dayjs(params.get("dateFrom")) : null
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(
    params.get("dateTo") ? dayjs(params.get("dateTo")) : null
  );

  /* ================= APPLY ================= */

  const applyFilters = () => {
    const q = new URLSearchParams(params.toString());

    classId ? q.set("classId", classId) : q.delete("classId");
    type ? q.set("type", type) : q.delete("type");

    dateFrom
      ? q.set("dateFrom", dateFrom.format("YYYY-MM-DD"))
      : q.delete("dateFrom");

    dateTo
      ? q.set("dateTo", dateTo.format("YYYY-MM-DD"))
      : q.delete("dateTo");

    router.push("?" + q.toString());
    setOpen(false);
  };

  /* ================= RESET ================= */

  const resetFilters = () => {
    const q = new URLSearchParams(params.toString());
    ["classId", "type", "dateFrom", "dateTo"].forEach((k) => q.delete(k));

    router.push("?" + q.toString());

    setClassId("");
    setType("");
    setDateFrom(null);
    setDateTo(null);
    setOpen(false);
  };

  return (
    <>
      {/* DESKTOP FILTER */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm rounded-2xl bg-purple-500 text-white"
      >
        <Image src="/filter1.png" width={14} height={14} alt="" />
        Filter
      </button>

      {/* MOBILE FILTER */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
      >
        <Image src="/filter1.png" width={14} height={14} alt="" />
      </button>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FilterDrawer
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 h-11 border rounded-xl text-sm"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 h-11 bg-blue-600 text-white rounded-xl text-sm font-medium"
              >
                Apply
              </button>
            </div>
          }
        >
          {/* CLASS */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Class
            </label>
            <RadixSelect
              value={classId || undefined} // ✅ correct
              placeholder="All Classes"
              onChange={(v) => setClassId(v ?? "")}
              options={[
                { value: "null", label: "Global Events" },
                ...classes.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                })),
              ]}
            />
          </div>

          {/* EVENT TYPE */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Event Type
            </label>
            <RadixSelect
              value={type || undefined} // ✅ correct
              placeholder="All Types"
              onChange={(v) => setType(v ?? "")}
              options={[
                { value: "global", label: "Global Events Only" },
                { value: "class", label: "Class Events Only" },
              ]}
            />
          </div>

          {/* DATE RANGE */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Date range
            </label>

            <DatePicker
              label="From"
              value={dateFrom}
              onChange={setDateFrom}
              slotProps={{
                textField: { fullWidth: true, size: "small" },
                popper: { sx: { zIndex: 999999 } },
              }}
            />

            <DatePicker
              label="To"
              value={dateTo}
              minDate={dateFrom ?? undefined}
              onChange={setDateTo}
              slotProps={{
                textField: { fullWidth: true, size: "small" },
                popper: { sx: { zIndex: 999999 } },
              }}
            />
          </div>
        </FilterDrawer>
      </LocalizationProvider>
    </>
  );
}
