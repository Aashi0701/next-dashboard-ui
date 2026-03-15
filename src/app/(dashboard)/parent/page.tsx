import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import ParentTabs from "./ParentTabs";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import Image from "next/image";
import ParentDashboardClient from "./ParentDashboardClient";
import { getGreeting } from "@/lib/getGreeting";
import PayFeeButton from "@/components/PayFeeButton";
import StatCard from "@/app/(dashboard)/StatCard";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import { Day } from "@prisma/client";

const ParentPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) => {
  const params = await searchParams;

  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const parentName = user?.firstName || "Parent";

  const students = await prisma.student.findMany({
    where: { parentId: userId },
    include: {
      class: true,
      attendances: true,
      results: {
        include: {
          exam: {
            include: {
              lesson: {
                include: {
                  subject: true,
                  teacher: true,
                },
              },
            },
          },
        },
      },
      studentFees: {
        include: {
          feeStructure: true,
          payments: {
            orderBy: { paidAt: "desc" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  if (students.length === 0) return null;

  const activeId = params?.studentId || students[0].id;
  const student = students.find((s) => s.id === activeId) || students[0];
  const now = new Date();

  /* ================= UPCOMING EXAMS ================= */
  const upcomingExams = await prisma.exam.findMany({
    where: {
      lesson: {
        classId: student.classId,
      },
      startTime: {
        gte: new Date(),
      },
    },
    include: {
      lesson: {
        include: {
          subject: true,
        },
      },
    },
    orderBy: {
      startTime: "asc",
    },
    take: 5,
  });

  /* ================= TODAY'S LESSONS ================= */

  const dayMap: Record<number, Day | null> = {
    0: null, // Sunday → no school
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: null, // Saturday → no school
  };

  const todayEnumDay = dayMap[now.getDay()];

  let todayLessons: any[] = [];

  if (todayEnumDay) {
    todayLessons = await prisma.lesson.findMany({
      where: {
        classId: student.classId,
        day: todayEnumDay,
      },
      include: {
        subject: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });
  }

  /* ================= RESULTS ================= */

  const recentResults = student.results
    .filter(
      (r): r is typeof r & { exam: NonNullable<typeof r.exam> } =>
        r.exam !== null,
    )
    .sort((a, b) => b.exam.startTime.getTime() - a.exam.startTime.getTime())
    .slice(0, 5);

  /* ================= MONTHLY ATTENDANCE ================= */

  const monthlyAttendance = student.attendances.filter((a) => {
    const d = new Date(a.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const totalDays = monthlyAttendance.length;
  const presentDays = monthlyAttendance.filter((a) => a.present).length;

  const attendancePercent =
    totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  /* ================= ATTENDANCE TREND (6 MONTHS) ================= */

  const lastSixMonths = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);

    return {
      month: d.toLocaleString("default", {
        month: "short",
      }),
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
    };
  });

  const attendanceTrend = lastSixMonths.map(({ month, monthIndex, year }) => {
    const records = student.attendances.filter((a) => {
      const d = new Date(a.date);
      return d.getMonth() === monthIndex && d.getFullYear() === year;
    });

    const total = records.length;
    const present = records.filter((a) => a.present).length;

    return {
      month,
      percent: total ? Math.round((present / total) * 100) : null,
    };
  });

  /* ================= ACADEMIC PERFORMANCE ================= */

  const subjectMap: Record<string, { total: number; count: number }> = {};

  student.results.forEach((r) => {
    if (!r.exam) return; // 🔒 Guard against null exam

    const subjectName = r.exam.lesson.subject.name;

    if (!subjectMap[subjectName]) {
      subjectMap[subjectName] = { total: 0, count: 0 };
    }

    subjectMap[subjectName].total += r.score;
    subjectMap[subjectName].count += 1;
  });

  const performanceData = Object.entries(subjectMap).map(
    ([subject, value]) => ({
      subject,
      average: Math.round(value.total / value.count),
    }),
  );

  const overallAverage =
    performanceData.length > 0
      ? Math.round(
          performanceData.reduce((sum, s) => sum + s.average, 0) /
            performanceData.length,
        )
      : 0;

  /* ================= FEES ================= */

  const totalFee = student.studentFees.reduce(
    (sum, f) => sum + f.totalAmount,
    0,
  );

  const totalPaid = student.studentFees.reduce(
    (sum, f) => sum + f.payments.reduce((pSum, p) => pSum + p.amount, 0),
    0,
  );

  const pending = totalFee - totalPaid;

  const announcements = await prisma.announcement.findMany({
    orderBy: { date: "desc" },
    take: 5,
  });

  const greeting = `${getGreeting()}, ${parentName}`;

  return (
    <div className="flex-1 px-4 py-6 md:p-4 flex flex-col gap-5">
      {/* ================= GREETING HEADER ================= */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <p className="text-sm text-gray-500">Welcome back</p>

          <h1 className="text-2xl font-semibold text-gray-800">
            {greeting} 👋
          </h1>
        </div>
        <div className="w-[580px] text-sm gap-10 mt-4">
          <AnnouncementTicker announcements={announcements} />
        </div>
      </div>
      {students.length > 1 && (
        <div className="rounded-2xl p-3">
          <ParentTabs students={students} activeId={student.id} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
        {/* LEFT SIDE (70%) */}
        <div className="xl:col-span-7">
          <ParentDashboardClient studentId={student.id}>
            {/* ================= ROW 1 ================= */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
              {/* PROFILE */}
              <div className="bg-gradient-to-r from-lamaSky/90 to-lamaSky rounded-2xl p-3 flex items-center gap-4 shadow-sm">
                <Image
                  src={student.img || "/noAvatar.png"}
                  alt={student.name}
                  width={60}
                  height={60}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white"
                />

                <div className="flex flex-col text-sm text-gray-800">
                  <h2 className="text-base font-semibold text-gray-900">
                    {student.name} {student.surname}
                  </h2>

                  <span className="text-xs font-medium">
                    Class: {student.class.name}
                  </span>

                  <span className="text-xs">
                    DOB:{" "}
                    {student.birthday
                      ? new Intl.DateTimeFormat("en-IN").format(
                          new Date(student.birthday),
                        )
                      : "-"}
                  </span>

                  <span className="text-xs">
                    Blood Group: {student.bloodType || "-"}
                  </span>
                </div>
              </div>

              {/* MONTH ATTENDANCE */}
              <StatCard
                title="Attendance"
                subtitle={now.toLocaleString("default", { month: "long" })}
                value={`${attendancePercent}%`}
                trend={`${presentDays} Present • ${totalDays - presentDays} Absent`}
                trendDirection="up"
                color="green"
                icon="attendance"
                chartData={[
                  { value: 60 },
                  { value: 70 },
                  { value: 65 },
                  { value: 80 },
                  { value: 75 },
                  { value: attendancePercent },
                ]}
              />

              {/* RECENT RESULTS */}
              <StatCard
                title="Results"
                subtitle="Average Score"
                value={`${overallAverage}%`}
                trend={`${recentResults.length} Recent Exams`}
                trendDirection="up"
                color="blue"
                chartData={[
                  { value: 50 },
                  { value: 65 },
                  { value: 70 },
                  { value: 80 },
                  { value: 85 },
                  { value: overallAverage },
                ]}
              />
            </div>

            {/* ================= ROW 2 (2 CARDS ONLY) ================= */}
            <div className="bg-white rounded-2xl p-7 border shadow-sm mb-4">
              <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                📅 Schedule
              </h3>
              <BigCalendarContainer type="classId" id={student.classId} />
            </div>
          </ParentDashboardClient>
        </div>

        {/* RIGHT SIDE (30%) */}
        <div className="xl:col-span-3">
          {/* FEES */}
          <div className="bg-white p-4 rounded-xl border space-y-4 mb-2">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold">Fees</h2>
              <a
                href={`/api/receipts/full/${student.id}`}
                target="_blank"
                className="text-blue-600 text-xs font-medium"
              >
                📄 Download Full Report
              </a>
            </div>

            {/* SUMMARY */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <SummaryBox label="Total" value={totalFee} />
              <SummaryBox label="Paid" value={totalPaid} color="green" />
              <SummaryBox label="Pending" value={pending} color="red" />
            </div>

            {/* FEE LIST */}
            <div className="space-y-2">
              {student.studentFees.map((f) => {
                const paid = f.payments.reduce((s, p) => s + p.amount, 0);
                const due = Math.max(f.totalAmount - paid, 0);

                return (
                  <div
                    key={f.id}
                    className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {f.feeStructure?.title || "Fee"}
                        </p>

                        <p className="text-[11px] text-gray-400">
                          {student.class.name}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-800">
                          ₹ {f.totalAmount}
                        </p>

                        {due === 0 ? (
                          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold">
                            PAID
                          </span>
                        ) : paid > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                            Due ₹{due}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
                            DUE ₹{due}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* PAY BUTTON */}
                    {due > 0 && (
                      <div className="mt-2 flex justify-end">
                        <PayFeeButton amount={due} studentFeeId={f.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* UPCOMING EXAMS */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-2">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              📘 Upcoming Exams
            </h3>

            <div className="space-y-3 text-sm">
              {upcomingExams.length === 0 && (
                <p className="text-gray-400">No upcoming exams</p>
              )}

              {upcomingExams.map((exam) => (
                <div key={exam.id} className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {exam.title}
                    </span>

                    <span className="text-xs text-gray-500">
                      {exam.lesson.subject.name}
                    </span>
                  </div>

                  <span className="text-xs text-gray-500">
                    {new Date(exam.startTime).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ASSIGNMENTS */}
          <div className="bg-white rounded-2xl p-5 border shadow-sm">
            <h3 className="font-semibold mb-3">📚 Today's Classes</h3>

            <div className="space-y-2 text-sm">
              {todayLessons.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span>{l.subject.name}</span>
                  <span>
                    {new Date(l.startTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPage;

const SummaryBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "red";
}) => (
  <div className="border rounded-lg p-3 bg-gray-50 flex flex-col">
    <span className="text-[11px] text-gray-500">{label}</span>

    <span
      className={`text-sm font-semibold mt-1 ${
        color === "green"
          ? "text-green-600"
          : color === "red"
            ? "text-red-600"
            : "text-gray-800"
      }`}
    >
      ₹ {value.toLocaleString()}
    </span>
  </div>
);
