import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

type Props = {
  date?: string;
};

type HolidayInfo = {
  title: string;
  isFullDay: boolean;
};

const toLocalDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

export default async function EventCalendarContainer({ date }: Props) {
  const selectedDate =
    date && !isNaN(new Date(date).getTime())
      ? new Date(date)
      : new Date();

  /* Fetch holidays for ACTIVE month */
  const holidays = await prisma.holiday.findMany({
    where: {
      date: {
        gte: startOfMonth(selectedDate),
        lte: endOfMonth(selectedDate),
      },
    },
    select: {
      title: true,
      date: true,
      isFullDay: true,
    },
    orderBy: { date: "asc" },
  });

  const holidayMap = new Map<string, HolidayInfo>();
  for (const h of holidays) {
    holidayMap.set(toLocalDateKey(h.date), {
      title: h.title,
      isFullDay: h.isFullDay,
    });
  }

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <EventCalendar selectedDate={selectedDate} holidays={holidayMap} />

      <div className="flex items-center justify-between mt-4 mb-2">
        <h1 className="text-sm font-semibold text-gray-800 tracking-wide">Events</h1>
        <Link
          href="/list/events"
          className="text-sm text-blue-600 hover:text-green-600"
        >
          View All
        </Link>
      </div>

      <div className="events-scroll flex flex-col gap-4 max-h-[240px] overflow-y-auto pr-2">
        <EventList dateParam={date} />
      </div>
    </div>
  );
}
