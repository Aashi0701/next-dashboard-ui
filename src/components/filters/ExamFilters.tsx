"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import Image from "next/image";
import RadixSelect from "@/components/ui/RadixSelect";
import FilterDrawer from "@/components/filters/FilterDrawer";

/* ================= TYPES ================= */

type Props = {
  subjects: { id: number; name: string }[];
  classes: { id: number; name: string }[];
  teachers: { id: string; name: string; surname: string }[];
};

/* ================= COMPONENT ================= */

export default function ExamFilters({
  subjects,
  classes,
  teachers,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);

  const [subjectId, setSubjectId] = useState(params.get("subjectId") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [teacherId, setTeacherId] = useState(params.get("teacherId") || "");

  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    params.get("dateFrom") ? dayjs(params.get("dateFrom")) : null
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(
    params.get("dateTo") ? dayjs(params.get("dateTo")) : null
  );

  /* ================= ACTIONS ================= */

  const applyFilters = () => {
    const query = new URLSearchParams(params.toString());

    subjectId ? query.set("subjectId", subjectId) : query.delete("subjectId");
    classId ? query.set("classId", classId) : query.delete("classId");
    teacherId ? query.set("teacherId", teacherId) : query.delete("teacherId");

    dateFrom
      ? query.set("dateFrom", dateFrom.format("YYYY-MM-DD"))
      : query.delete("dateFrom");

    dateTo
      ? query.set("dateTo", dateTo.format("YYYY-MM-DD"))
      : query.delete("dateTo");

    router.push("?" + query.toString());
    setOpen(false);
  };

  const resetFilters = () => {
    const query = new URLSearchParams(params.toString());

    ["subjectId", "classId", "teacherId", "dateFrom", "dateTo"].forEach((k) =>
      query.delete(k)
    );

    router.push("?" + query.toString());

    setSubjectId("");
    setClassId("");
    setTeacherId("");
    setDateFrom(null);
    setDateTo(null);

    setOpen(false);
  };

  /* ================= UI ================= */

  return (
    <>
      {/* ===== DESKTOP FILTER BUTTON ===== */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm rounded-2xl bg-purple-500 text-white hover:bg-indigo-500 transition"
      >
        <Image src="/filter1.png" alt="filter" width={14} height={14} />
        Filter
      </button>

      {/* ===== MOBILE FILTER BUTTON ===== */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
      >
        <Image src="/filter1.png" alt="filter" width={14} height={14} />
      </button>

      {/* ===== FILTER DRAWER ===== */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FilterDrawer
          open={open}
          onClose={() => setOpen(false)}
          footer={
            <div className="flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 border rounded-xl py-2 text-sm"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm"
              >
                Apply
              </button>
            </div>
          }
        >
          {/* SUBJECT */}
          <div>
            <label className="font-medium text-gray-700">Subject</label>
            <RadixSelect
              value={subjectId}
              onChange={(v) => setSubjectId(v ?? "")}
              placeholder="All Subjects"
              options={subjects.map((s) => ({
                value: String(s.id),
                label: s.name,
              }))}
            />
          </div>

          {/* CLASS */}
          <div>
            <label className="font-medium text-gray-700">Class</label>
            <RadixSelect
              value={classId}
              onChange={(v) => setClassId(v ?? "")}
              placeholder="All Classes"
              options={classes.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />
          </div>

          {/* TEACHER */}
          <div>
            <label className="font-medium text-gray-700">Teacher</label>
            <RadixSelect
              value={teacherId}
              onChange={(v) => setTeacherId(v ?? "")}
              placeholder="All Teachers"
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.name} ${t.surname}`,
              }))}
            />
          </div>

          {/* DATE RANGE */}
          <div className="space-y-3">
            <p className="font-medium text-gray-700">Date range</p>

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
              onChange={setDateTo}
              minDate={dateFrom ?? undefined}
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
