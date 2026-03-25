export const dynamic = "force-dynamic"; // 🔥 FIX: disable caching

import prisma from "@/lib/prisma";
import Announcements from "@/components/Announcements";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getGreeting } from "@/lib/getGreeting";
import {
  ClipboardCheck,
  BarChart3,
  ClipboardList,
  Users,
  Sparkles,
} from "lucide-react";
import ClassAttendance from "@/components/dashboard/ClassAttendance";
import ClassPerformanceChart from "@/components/dashboard/ClassPerformanceChart";
import SubmissionAnalytics from "@/components/dashboard/SubmissionAnalytics";
import TeacherActivity from "@/components/dashboard/TeacherActivity";
import SmartAlerts from "@/components/dashboard/SmartAlerts";
import AttendanceChart from "@/components/dashboard/AttendanceChart";
import AttendanceBarChart from "@/components/dashboard/AttendanceBarChart";
import AttendanceHeatmap from "@/components/dashboard/AttendanceHeatmap";
import DashboardKPIs from "@/components/dashboard/DashboardKPIs";
import { getTodayUTCRange } from "@/lib/date";
import { getWeekRangeUTC } from "@/lib/getWeekRange";
import { generateTeacherInsights } from "@/lib/teacherInsights";

export default async function TeacherPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await currentUser();
  const teacherName = user?.firstName || "Teacher";
  const greeting = `${getGreeting()}, ${teacherName}`;

  // ✅ LOCAL DATE (NO UTC)
  const now = new Date();
  const startMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
  );
  const { start, end } = getTodayUTCRange();

  // ================= CLASSES =================
  const myClasses = await prisma.class.findMany({
    where: { supervisorId: userId },
    include: {
      students: {
        select: { id: true, name: true },
      },
    },
  });

  const classIds = myClasses.map((c) => c.id);

  const classWiseStats = await Promise.all(
    myClasses.map(async (cls) => {
      const present = await prisma.attendance.count({
        where: {
          date: { gte: start, lte: end }, // make sure you already defined start/end
          status: "present",
          student: { classId: cls.id },
        },
      });

      const absent = await prisma.attendance.count({
        where: {
          date: { gte: start, lte: end },
          status: "absent",
          student: { classId: cls.id },
        },
      });

      const totalMarked = present + absent;

      const totalStudents = cls.students.length;
      const pending = totalStudents - totalMarked;

      return {
        className: cls.name,
        percentage:
          totalMarked === 0 ? 0 : Math.round((present / totalMarked) * 100),
        present,
        absent,
        totalStudents,
        pending,
      };
    }),
  );

  // ================= DATA =================
  const [
    attendanceToday,
    submissionStats, // ✅ ADD HERE
    studentAlerts,
    results,
    attendanceMonth,
  ] = await Promise.all([
    // ✅ TODAY ATTENDANCE
    prisma.attendance.findMany({
      where: {
        date: { gte: start, lte: end },
        student: { classId: { in: classIds } },
      },
    }),

    // 🔥 NEW: PER CLASS SUBMISSION ANALYTICS
    Promise.all(
      myClasses.map(async (cls) => {
        const total = await prisma.assignment.count({
          where: { lesson: { classId: cls.id } },
        });

        const submitted = await prisma.result.count({
          where: {
            assignment: { lesson: { classId: cls.id } },
          },
        });

        return {
          className: cls.name,
          submitted,
          total,
          percent: total === 0 ? 0 : Math.round((submitted / total) * 100),
        };
      }),
    ),

    // STUDENT ALERTS
    prisma.student.count({
      where: {
        classId: { in: classIds },
        attendances: {
          some: {
            status: "absent",
            date: { gte: start, lte: end },
          },
        },
      },
    }),

    // RESULTS
    prisma.result.findMany({
      where: {
        OR: [
          { exam: { lesson: { classId: { in: classIds } } } },
          { assignment: { lesson: { classId: { in: classIds } } } },
        ],
      },
      include: {
        exam: { include: { lesson: { include: { class: true } } } },
        assignment: {
          include: { lesson: { include: { class: true } } },
        },
      },
    }),

    // MONTH DATA
    prisma.attendance.findMany({
      where: {
        date: { gte: startMonth, lte: end },
        student: { classId: { in: classIds } },
      },
      include: {
        student: {
          select: { id: true, name: true },
        },
      },
    }),
  ]);

  // ================= KPI =================
  const presentCount = await prisma.attendance.count({
    where: {
      date: { gte: start, lte: end },
      status: "present",
      student: { classId: { in: classIds } },
    },
  });

  const totalMarked = await prisma.attendance.count({
    where: {
      date: { gte: start, lte: end },
      student: { classId: { in: classIds } },
    },
  });

  const attendanceRate =
    totalMarked === 0 ? 0 : Math.round((presentCount / totalMarked) * 100);

  // ================= STUDENT ANALYTICS =================
  const studentMap: Record<
    string,
    { name: string; present: number; total: number }
  > = {};

  myClasses.forEach((cls) => {
    cls.students.forEach((s) => {
      studentMap[s.id] = {
        name: s.name,
        present: 0,
        total: 0,
      };
    });
  });

  // 🔥 APPLY ATTENDANCE
  attendanceMonth.forEach((a: any) => {
    const student = studentMap[a.studentId];
    if (!student) return;

    student.total++;

    if (a.status === "present") {
      student.present++;
    }
  });

  // 🔥 CALCULATE %
  const studentStats = Object.values(studentMap).map((s) => ({
    ...s,
    percentage: s.total === 0 ? 0 : Math.round((s.present / s.total) * 100),
  }));

  const lowStudents = studentStats.filter((s) => s.percentage < 50).length;

  const topStudent =
    studentStats.sort((a, b) => {
      if (b.percentage === a.percentage) {
        return b.total - a.total;
      }
      return b.percentage - a.percentage;
    })[0]?.name || "-";

  // ================= PERFORMANCE =================
  const performanceMap: Record<string, number[]> = {};

  results.forEach((r) => {
    const className =
      r.exam?.lesson.class.name || r.assignment?.lesson.class.name;

    if (!className) return;

    if (!performanceMap[className]) {
      performanceMap[className] = [];
    }

    performanceMap[className].push(r.score);
  });

  const performanceData = Object.entries(performanceMap).map(
    ([className, scores]) => ({
      class: className,
      score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    }),
  );

  const { start: weekStart, end: weekEnd } = getWeekRangeUTC();

  const attendanceWeek = await prisma.attendance.findMany({
    where: {
      date: { gte: weekStart, lte: weekEnd },
      student: { classId: { in: classIds } },
    },
  });

  const insights = generateTeacherInsights({
    attendanceRate,
    studentStats,
    pendingAssignments: 0,
  });

  // ================= UI =================
  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 w-full">
      <div>
        <p className="text-xs text-gray-500">Welcome back</p>
        <h1 className="text-xl font-semibold text-gray-800">{greeting} 👋</h1>
      </div>

      <DashboardKPIs
        totalClasses={myClasses.length}
        classWiseStats={classWiseStats}
        lowStudents={lowStudents}
      />

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="w-full xl:w-[70%] flex flex-col gap-6">
          <PremiumSection
            title="My Classes"
            subtitle="Manage daily attendance efficiently"
            icon={<Users size={16} />}
          >
            <ClassAttendance
              classes={myClasses}
              attendanceToday={attendanceToday}
              attendanceWeek={attendanceWeek}
            />
          </PremiumSection>

          <AttendanceHeatmap data={attendanceMonth} />

          <PremiumSection
            title="Assignment Progress"
            subtitle="Track submissions across classes"
            icon={<ClipboardList size={16} />}
          >
            <SubmissionAnalytics data={submissionStats} />
          </PremiumSection>

          <PremiumSection
            title="Attendance Insights"
            subtitle="Daily trends & class comparison"
            icon={<Sparkles size={16} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AttendanceChart />
              <AttendanceBarChart />
            </div>
          </PremiumSection>

          <PremiumSection
            title="Class Performance"
            subtitle="Average student scores"
            icon={<BarChart3 size={16} />}
          >
            <ClassPerformanceChart data={performanceData} />
          </PremiumSection>

          <PremiumSection
            title="Teacher Activity"
            subtitle="Recent actions & logs"
            icon={<ClipboardCheck size={16} />}
          >
            <TeacherActivity />
          </PremiumSection>
        </div>

        <div className="w-full xl:w-[30%] flex flex-col gap-6">
          {/* <StudentAnalytics data={attendanceMonth} /> */}

          <SmartAlerts insights={insights} />

          <div className="bg-white border rounded-2xl shadow-sm p-4">
            <EventCalendarContainer />
          </div>

          <Announcements />
        </div>
      </div>
    </div>
  );
}

// ================= PREMIUM SECTION =================

function PremiumSection({ title, subtitle, icon, children }: any) {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-100 text-purple-600">
          {icon}
        </div>

        <div>
          <h2 className="text-md font-semibold">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>

      {children}
    </div>
  );
}
