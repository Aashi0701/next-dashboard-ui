import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const StudentPage = async () => {
  const { userId } = await auth();

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId! } },
    },
  });

  const selectedDate = new Date();

  const holidaysRaw = await prisma.holiday.findMany({
    select: {
      title: true,
      date: true,
      isFullDay: true,
    },
  });

  // Convert to Map<string, { title, isFullDay }>
  const holidays = new Map(
    holidaysRaw.map((h) => [
      `${h.date.getFullYear()}-${String(h.date.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(h.date.getDate()).padStart(2, "0")}`,
      { title: h.title, isFullDay: h.isFullDay },
    ]),
  );

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row min-w-0 max-w-full overflow-x-hidden">
      {/* LEFT */}
      <div className="w-full xl:w-2/3 min-w-0">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-lg md:text-xl font-semibold mb-3">
            Schedule (4A)
          </h1>

          {/* ✅ ONLY scrollable area */}
          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <BigCalendarContainer type="classId" id={classItem[0].id} />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 min-w-0 flex flex-col gap-6">
        <EventCalendar selectedDate={selectedDate} holidays={holidays} />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
