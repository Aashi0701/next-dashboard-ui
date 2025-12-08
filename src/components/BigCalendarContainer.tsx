import prisma from "@/lib/prisma";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import BigCalendarClient from "./BigCalendarClient";

export default async function BigCalendarContainer({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) {
  const lessons = await prisma.lesson.findMany({
    where:
      type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number },
  });

  const data = lessons.map((l) => ({
    title: l.name,
    start: l.startTime,
    end: l.endTime,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[720px]">
        <BigCalendarClient data={schedule} />
      </div>
    </div>
  );
}
