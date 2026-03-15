import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";
import { getGreeting } from "@/lib/getGreeting";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { IndianRupee, CreditCard, BarChart3 } from "lucide-react";
import KPICard from "@/components/KPICard";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [keys: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const date = params?.date ?? undefined;

  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const adminName = user?.firstName || "Admin";

  const greeting = `${getGreeting()}, ${adminName}`;

  /* ================= FINANCE DATA ================= */

  const payments = await prisma.payment.findMany({
    select: {
      amount: true,
      paidAt: true,
    },
  });

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const financeData = months.map((month, index) => {
    const monthPayments = payments.filter(
      (p) => new Date(p.paidAt).getMonth() === index,
    );

    const totalFees = monthPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      month,
      fees: totalFees,
    };
  });

  /* ================= FINANCE STATS ================= */

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const averagePayment = payments.length
    ? Math.round(totalCollected / payments.length)
    : 0;

  return (
    <div className="p-2 sm:p-3 md:p-4 lg:p-5 w-full space-y-6">
      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs lg:text-sm text-gray-500">Welcome back</p>

          <h1 className="text-xs lg:text-sm font-semibold text-gray-800">
            {greeting} 👋
          </h1>
        </div>
      </div>

      {/* ================= KPI CARDS ================= */}

      <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
        <UserCard type="admin" />
        <UserCard type="teacher" />
        <UserCard type="student" />
        <UserCard type="parent" />
        <KPICard
          title="Total Amount"
          value={totalCollected}
          prefix="₹ "
          icon={<IndianRupee size={10} />}
          color="text-emerald-600"
          bg="bg-gradient-to-br from-rose-50 to-rose-100/60"
          trend={12}
        />
        <KPICard
          title="Average"
          value={averagePayment}
          prefix="₹ "
          icon={<BarChart3 size={10} />}
          color="text-blue-600"
          bg="bg-gradient-to-br from-indigo-50 to-indigo-100/60"
          trend={8}
        />
      </div>

      {/* ================= MAIN GRID ================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-[340px] overflow-hidden rounded-xl">
              <CountChartContainer />
            </div>

            <div className="h-[340px] overflow-hidden rounded-xl">
              <AttendanceChartContainer />
            </div>
          </div>

          <div className="h-[240px]">
            <FinanceChart data={financeData} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-6 mt-12 lg:mt-0">
          {/* <div className="grid grid-cols-1 gap-5">
            <KPICard
              title="Payments"
              value={payments.length}
              icon={<CreditCard size={18} />}
              color="text-indigo-600"
              trend={5}
            />
          </div> */}
          <EventCalendarContainer date={date} />
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
