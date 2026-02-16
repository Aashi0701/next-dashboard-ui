"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import BigCalendarClient from "@/components/BigCalendarClient";
import { Attendance, Holiday, StudentEvent, CalendarEvent } from "@/lib/types";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { MoreVertical } from "lucide-react";

export default function StudentAttendanceCalendar({
  attendance = [],
  holidays = [],
  events = [],
}: {
  attendance: Attendance[];
  holidays: Holiday[];
  events: StudentEvent[];
}) {
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  /* ATTENDANCE % */
  const percent = useMemo(() => {
    if (!attendance.length) return 0;
    const present = attendance.filter((a) => a.status === "PRESENT").length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  const presentCount = attendance.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;

  /* MAP → CALENDAR EVENTS */
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const attendanceEvents: CalendarEvent[] = attendance.map((a) => {
      const start = new Date(a.date);
      const end = new Date(a.date);
      end.setHours(23, 59, 59, 999);

      return {
        id: `att-${start.toISOString()}`,
        title: a.status === "PRESENT" ? "Present" : "Absent",
        start,
        end,
        type: a.status,
        allDay: true,
      };
    });

    const holidayEvents: CalendarEvent[] = holidays.map((h) => ({
      id: `holiday-${h.id}`,
      title: `🎉 ${h.title}`,
      start: h.date,
      end: h.date,
      type: "HOLIDAY",
      allDay: true,
    }));

    const otherEvents: CalendarEvent[] = events.map((e) => ({
      id: `event-${e.id}`,
      title: e.title,
      start: e.start,
      end: e.end,
      type: "EVENT",
    }));

    return [...attendanceEvents, ...holidayEvents, ...otherEvents];
  }, [attendance, holidays, events]);

  /* CSV EXPORT (existing) */
  const exportCSV = () => {
    const rows = attendance.map((a) => [
      format(new Date(a.date), "dd/MM/yyyy"),
      a.status,
    ]);

    const csv = "Date,Status\n" + rows.map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
  };

  /* EXCEL EXPORT (.xlsx) */
  const exportExcel = () => {
    const data = attendance.map((a) => ({
      Date: format(new Date(a.date), "dd/MM/yyyy"),
      Status: a.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    XLSX.writeFile(wb, "attendance.xlsx");
  };

  /* PRINT / PDF */
  const printSheet = () => {
    window.print();
  };

  /* BULK MARK (admin) */
  const bulkMark = async (status: "PRESENT" | "ABSENT") => {
    await fetch("/api/attendance/bulk", {
      method: "POST",
      body: JSON.stringify({ status }),
    });

    location.reload();
  };

  /* SMS ALERT (absence) */
  const sendSMSAlert = async () => {
    await fetch("/api/attendance/sms", {
      method: "POST",
    });

    alert("Parent SMS alerts sent");
  };

  /* UI */
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border overflow-hidden">
      {/* Title + controls */}
      <div className="flex items-center justify-between w-full">
        <h2 className="font-semibold text-sm sm:text-base">
          Attendance
        </h2>

        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap
        ${
          percent >= 75
            ? "bg-green-100 text-green-700"
            : percent >= 50
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
        }
      `}
          >
            {percent}% Attendance
          </span>

          <ActionMenu
            onCSV={exportCSV}
            onExcel={exportExcel}
            onPDF={printSheet}
            onSMS={sendSMSAlert}
            onPresent={() => bulkMark("PRESENT")}
            onAbsent={() => bulkMark("ABSENT")}
          />
        </div>
      </div>

      {/* ================= ANALYTICS MINI BAR ================= */}
      <div className="flex justify-center gap-4 sm:gap-6 items-end mb-3 text-[10px] sm:text-xs">
        <MiniBar label="Present" value={presentCount} color="bg-green-500" />
        <MiniBar label="Absent" value={absentCount} color="bg-red-500" />
      </div>

      {/* ================= CALENDAR ================= */}
      <BigCalendarClient
        events={calendarEvents}
        onEventClick={(e) => setSelected(e)}
      />

      {selected && <Modal event={selected} onClose={() => setSelected(null)} />}

      {/* ================= LEGEND ================= */}
      <div className="flex flex-wrap justify-center gap-3 text-[10px] sm:text-xs mt-3">
        <Legend color="bg-green-500" label="Present" />
        <Legend color="bg-red-500" label="Absent" />
        <Legend color="bg-yellow-400" label="Holiday" />
        <Legend color="bg-emerald-500" label="Event" />
      </div>
    </div>
  );
}

function ActionMenu({
  onCSV,
  onExcel,
  onPDF,
  onSMS,
  onPresent,
  onAbsent,
}: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* ===============================
     CLOSE ON OUTSIDE CLICK
  =============================== */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Kebab button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-8 h-8 flex items-center justify-center rounded border hover:bg-gray-50"
      >
        <MoreVertical size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-40 sm:w-44 max-w-[90vw] bg-white border rounded-lg shadow-lg text-xs z-50">
          <MenuItem
            onClick={() => {
              onCSV();
              setOpen(false);
            }}
          >
            Export CSV
          </MenuItem>

          <MenuItem
            onClick={() => {
              onExcel();
              setOpen(false);
            }}
          >
            Export Excel
          </MenuItem>

          <MenuItem
            onClick={() => {
              onPDF();
              setOpen(false);
            }}
          >
            Download PDF
          </MenuItem>

          <MenuItem
            onClick={() => {
              onSMS();
              setOpen(false);
            }}
          >
            Send SMS Alert
          </MenuItem>

          <div className="border-t my-1" />

          <MenuItem
            color="green"
            onClick={() => {
              onPresent();
              setOpen(false);
            }}
          >
            Mark All Present
          </MenuItem>

          <MenuItem
            color="red"
            onClick={() => {
              onAbsent();
              setOpen(false);
            }}
          >
            Mark All Absent
          </MenuItem>
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, onClick, color }: any) {
  const styles =
    color === "green"
      ? "text-green-600 hover:bg-green-50"
      : color === "red"
        ? "text-red-600 hover:bg-red-50"
        : "hover:bg-gray-50";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 ${styles}`}
    >
      {children}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={`w-3 h-3 rounded ${color}`} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}

function MiniBar({ label, value, color }: any) {
  return (
    <div className="flex items-end gap-2">
      <div
        className={`${color} w-3 rounded`}
        style={{ height: `${Math.max(value * 6, 4)}px` }}
      />
      <span className="text-gray-600">
        {label}: {value}
      </span>
    </div>
  );
}

function Modal({ event, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-72">
        <h3 className="font-semibold">{event.title}</h3>
        <p className="text-xs mt-1">{format(event.start, "dd MMM yyyy")}</p>
        <button
          onClick={onClose}
          className="mt-3 border w-full text-xs py-1 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
