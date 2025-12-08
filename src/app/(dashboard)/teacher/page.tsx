import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { auth } from "@clerk/nextjs/server";

export default async function TeacherPage() {
  const { userId } = await auth();
  if (!userId) return null;

  return (
    <div className="p-4 flex flex-col xl:flex-row gap-4 w-full">
      {/* LEFT – Schedule */}
      <div className="w-full xl:w-2/3 min-w-0">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-lg md:text-xl font-semibold mb-3">
            Schedule
          </h1>

          {/* ✅ Calendar renders safely on all screen sizes */}
          <BigCalendarContainer
            type="teacherId"
            id={userId}
          />
        </div>
      </div>

      {/* RIGHT – Announcements */}
      <div className="w-full xl:w-1/3 min-w-0 flex flex-col gap-6">
        <Announcements />
      </div>
    </div>
  );
}
