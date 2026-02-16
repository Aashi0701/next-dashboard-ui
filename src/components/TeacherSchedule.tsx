"use client";

import { useMemo, useState } from "react";
import BigCalendarClient from "@/components/BigCalendarClient";
import { CalendarEvent } from "@/lib/types";

/**
 * Cleaner + compact premium mobile schedule
 * (UI only – no logic change)
 */
export default function TeacherSchedule({
  events = [], // ✅ SAFE DEFAULT
}: {
  events?: CalendarEvent[]; // ✅ optional for safety
}) {
  const [tab, setTab] = useState<"today" | "upcoming">("today");

  const filteredEvents = useMemo(() => {
  const today = new Date();

  // helper → compare only calendar day (timezone safe)
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (tab === "today") {
    return events.filter((e) => isSameDay(new Date(e.start), today));
  }

  // upcoming (today + future)
  return events.filter((e) => new Date(e.start) >= today);
}, [events, tab]);


  return (
    <div className="w-full">
      {/* ================= MOBILE ================= */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 whitespace-nowrap">
            Schedule
          </h3>

          <div className="flex bg-gray-100 rounded-full p-1 text-xs">
            {["today", "upcoming"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as "today" | "upcoming")}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  tab === t
                    ? "bg-white shadow text-gray-900"
                    : "text-gray-500"
                }`}
              >
                {t === "today" ? "Today" : "Upcoming"}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[140px] overflow-y-auto scrollbar-none space-y-2">
          <MobileAgenda events={filteredEvents} />
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden sm:block">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <BigCalendarClient events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MOBILE AGENDA ---------------- */

function MobileAgenda({ events }: { events: CalendarEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-gray-400 text-sm">
        <div className="text-3xl mb-2">📅</div>
        No scheduled events
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((e) => (
        <div
          key={e.id}
          className={`rounded-lg px-3 py-2 text-xs border shadow-sm ${
            e.type === "HOLIDAY"
              ? "bg-yellow-50 border-yellow-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <p className="font-semibold text-gray-900">{e.title}</p>

          <p className="text-gray-600 mt-0.5">
            {new Date(e.start).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
            {!e.allDay && (
              <>
                {" · "}
                {new Date(e.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" – "}
                {new Date(e.end).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
