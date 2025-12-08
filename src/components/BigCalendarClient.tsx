"use client";

import dynamic from "next/dynamic";

const BigCalendar = dynamic(() => import("./BigCalendar"), {
  ssr: false,
  loading: () => (
    <div className="h-[350px] flex items-center justify-center text-gray-400">
      Loading schedule…
    </div>
  ),
});

export type CalendarEvent = {
  title: string;
  start: Date;
  end: Date;
};

export default function BigCalendarClient({
  data,
}: {
  data: CalendarEvent[];
}) {
  return <BigCalendar data={data} />;
}
