"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import RadixSelect from "@/components/ui/RadixSelect";
import FilterDrawer from "@/components/filters/FilterDrawer";

/* ================= COMPONENT ================= */

export default function AttendanceFilters({
  students = [],
  lessons = [],
}: any) {
  const router = useRouter();
  const params = useSearchParams();

  const [open, setOpen] = useState(false);

  const [studentId, setStudentId] = useState(params.get("studentId") || "");
  const [lessonId, setLessonId] = useState(params.get("lessonId") || "");
  const [classId, setClassId] = useState(params.get("classId") || "");
  const [present, setPresent] = useState(params.get("present") || "");

  const [dateFrom, setDateFrom] = useState<Dayjs | null>(
    params.get("dateFrom") ? dayjs(params.get("dateFrom")) : null
  );
  const [dateTo, setDateTo] = useState<Dayjs | null>(
    params.get("dateTo") ? dayjs(params.get("dateTo")) : null
  );

  /* ================= APPLY ================= */

  const applyFilters = () => {
    const q = new URLSearchParams(params.toString());

    studentId ? q.set("studentId", studentId) : q.delete("studentId");
    lessonId ? q.set("lessonId", lessonId) : q.delete("lessonId");
    classId ? q.set("classId", classId) : q.delete("classId");
    present ? q.set("present", present) : q.delete("present");

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
    [
      "studentId",
      "lessonId",
      "classId",
      "present",
      "dateFrom",
      "dateTo",
    ].forEach((k) => q.delete(k));

    router.push("?" + q.toString());

    setStudentId("");
    setLessonId("");
    setClassId("");
    setPresent("");
    setDateFrom(null);
    setDateTo(null);

    setOpen(false);
  };

  /* ================= UNIQUE CLASSES ================= */

  const uniqueClasses = Array.from(
    new Map(lessons.map((l: any) => [l.class.id, l.class])).values()
  );

  /* ================= UI ================= */

  return (
    <>
      {/* DESKTOP FILTER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm rounded-2xl bg-purple-500 text-white hover:bg-indigo-500 transition"
      >
        <img src="/filter1.png" width={14} alt="" />
        Filter
      </button>

      {/* MOBILE FILTER BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
      >
        <img src="/filter1.png" width={14} alt="" />
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
          {/* STUDENT */}
          <FilterSelect
            label="Student"
            value={studentId}
            onChange={setStudentId}
            placeholder="All Students"
            options={students.map((s: any) => ({
              value: s.id,
              label: `${s.name} ${s.surname}`,
            }))}
          />

          {/* LESSON */}
          <FilterSelect
            label="Lesson"
            value={lessonId}
            onChange={setLessonId}
            placeholder="All Lessons"
            options={lessons.map((l: any) => ({
              value: l.id,
              label: `${l.subject.name} `,
            }))}
          />

          {/* CLASS */}
          <FilterSelect
            label="Class"
            value={classId}
            onChange={setClassId}
            placeholder="All Classes"
            options={uniqueClasses.map((c: any) => ({
              value: c.id,
              label: c.name,
            }))}
          />

          {/* STATUS */}
          <FilterSelect
            label="Status"
            value={present}
            onChange={setPresent}
            placeholder="All Status"
            options={[
              { value: "present", label: "Present" },
              { value: "absent", label: "Absent" },
            ]}
          />

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

/* ================= SUB COMPONENT ================= */

function FilterSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <RadixSelect
        value={value}
        placeholder={placeholder}
        options={options}
        onChange={(v) => onChange(v ?? "")}
      />
    </div>
  );
}
