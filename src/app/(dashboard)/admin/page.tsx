import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [keys: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const date = params?.date ?? undefined;

  return (
    <div className="p-1 md:p-4 w-full">
      {/* ✅ SINGLE BACKGROUND WRAPPER (IMPORTANT FIX) */}
      <div
        className="
          w-full max-w-full
          bg-none
          rounded-xl
          overflow-hidden
          flex flex-col lg:flex-row
          gap-4
        "
      >
        {/* ================= LEFT COLUMN ================= */}
        <div className="w-full lg:w-2/3 flex flex-col gap-4 md:gap-8">
          {/* USER CARDS */}
          <div
            className="
              grid grid-cols-2 gap-3
              sm:grid-cols-2
              md:flex md:flex-wrap md:gap-4 md:justify-between
            "
          >
            <UserCard type="admin" />
            <UserCard type="teacher" />
            <UserCard type="student" />
            <UserCard type="parent" />
          </div>

          {/* STUDENT + ATTENDANCE */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="w-full lg:w-1/3 min-h-[260px] sm:min-h-[320px] lg:h-[450px]">
              <CountChartContainer />
            </div>

            <div className="w-full lg:w-2/3 min-h-[260px] sm:min-h-[320px] lg:h-[450px]">
              <AttendanceChartContainer />
            </div>
          </div>

          {/* FINANCE */}
          <div className="w-full min-h-[260px] sm:min-h-[320px] lg:h-[450px]">
            <FinanceChart />
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 md:gap-8">
          <EventCalendarContainer date={date} />
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
