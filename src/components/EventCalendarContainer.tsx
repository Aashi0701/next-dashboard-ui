import Image from "next/image";
import EventCalendar from "./EventCalendar";
import EventList from "./EventList";
import Link from "next/link";

type Props = {
  date?: string;
};

const EventCalendarContainer = ({ date }: Props) => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <EventCalendar />

      <div className="flex items-center justify-between mt-4 mb-2">
        <h1 className="text-lg font-semibold">Events</h1>

        <Link
          href="/list/events"
          className="text-sm text-blue-600 hover:text-green-600"
        >
          View All
        </Link>
      </div>

      {/* SCROLLABLE EVENT LIST */}
      <div className="events-fade">
        <div className="events-scroll flex flex-col gap-4 max-h-[240px] overflow-y-auto pr-2">
          <EventList dateParam={date} />
        </div>
      </div>
    </div>
  );
};

export default EventCalendarContainer;
