import Announcements from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import TeacherSchedule from "@/components/TeacherSchedule";
import { CalendarEvent } from "@/lib/types";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

/* ================= PAGE ================= */

const SingleTeacherPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
        },
      },
    },
  });

  if (!teacher) return notFound();

  /* ================= SCHEDULE EVENTS (✅ FIX) ================= */

  const lessons = await prisma.lesson.findMany({
    where: { teacherId: teacher.id },
    select: {
      id: true,
      name: true,
      startTime: true,
      endTime: true,
    },
  });

  const holidays = await prisma.holiday.findMany({
    select: {
      id: true,
      title: true,
      date: true,
      isFullDay: true,
    },
  });

  /* ---------- EVENTS / ACTIVITIES (⭐ FIX ADDED) ---------- */
  const activities = await prisma.event.findMany({
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
    },
  });

  /* ---------- MAP LESSONS ---------- */
  const classEvents: CalendarEvent[] = lessons.map((l) => ({
    id: `class-${l.id}`,
    title: l.name,
    start: l.startTime,
    end: l.endTime,
    type: "CLASS",
  }));

  const classCount = await prisma.class.count({
    where: {
      supervisorId: teacher.id,
    },
  });

  /* ---------- MAP HOLIDAYS ---------- */
  const holidayEvents: CalendarEvent[] = holidays.map((h) => {
    const start = new Date(h.date);
    const end = new Date(h.date);
    end.setHours(23, 59, 59, 999);

    return {
      id: `holiday-${h.id}`,
      title: `🎉 ${h.title}`,
      start,
      end,
      type: "HOLIDAY",
      allDay: h.isFullDay,
    };
  });

  /* ---------- MAP ACTIVITIES (⭐ NEW) ---------- */
  const activityEvents: CalendarEvent[] = activities.map((a) => ({
    id: `event-${a.id}`,
    title: a.title,
    start: a.startTime,
    end: a.endTime,
    type: "EVENT", // keep same style for now
  }));

  /* ---------- FINAL MERGE (⭐ CRITICAL FIX) ---------- */
  const events: CalendarEvent[] = [
    ...(adjustScheduleToCurrentWeek(classEvents) ?? []),
    ...holidayEvents,
    ...activityEvents,
  ];

  return (
    <div className="flex-1 px-1 py-2 p-2 md:p-6 flex flex-col gap-6 xl:flex-row">
      {/* ================= LEFT ================= */}
      <div className="w-full xl:w-2/3 flex flex-col gap-3">
        {/* ===== HEADER BAR ===== */}
        <div className="flex items-center gap-2 px-1 sm:px-0">
          <Link
            href="/list/teachers"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teachers
          </Link>
        </div>
        {/* PROFILE */}
        <div className="bg-lamaSky rounded-2xl px-4 py-4 sm:p-6 lg:px-8 lg:py-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* AVATAR */}
          <div className="relative shrink-0 flex justify-center sm:justify-start w-full sm:w-auto">
            <Image
              src={teacher.img || "/noAvatar.png"}
              alt="Teacher"
              width={120}
              height={120}
              className="w-20 h-20 sm:w-28 sm:h-28 lg:w-34 lg:h-36 rounded-full object-cover border-2 border-white shadow-sm"
            />

            {role === "admin" && (
              <div className="absolute -bottom-1 right-20 sm:-bottom-2 sm:-right-2 lg:-bottom-1 lg:right-3 scale-90 sm:scale-100">
                <FormContainer
                  table="teacher"
                  type="update"
                  data={teacher}
                  tooltip="Edit Profile"
                />
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex flex-col gap-3 w-full text-center sm:text-left">
            <h1 className="text-base sm:text-xl lg:text-3xl font-semibold leading-tight">
              {teacher.name} {teacher.surname}
            </h1>

            <p className="text-[11px] sm:text-xs text-gray-600">
              Dedicated teacher focused on academic excellence.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-2 text-[10px] sm:text-xs font-bold mt-3">
              <Info icon="/blood.png" value={teacher.bloodType} />
              <Info
                icon="/date.png"
                value={
                  teacher.birthday
                    ? new Intl.DateTimeFormat("en-GB").format(teacher.birthday)
                    : "-"
                }
              />
              <Info icon="/mail.png" value={teacher.email || "-"} />
              <Info icon="/phone.png" value={teacher.phone || "-"} />
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat icon="/singleAttendance.png" value="90%" label="Attendance" />
          <Stat
            icon="/singleBranch.png"
            value={teacher._count.subjects}
            label="Branches"
          />
          <Stat
            icon="/singleLesson.png"
            value={teacher._count.lessons}
            label="Lessons"
          />
          <Stat icon="/singleClass.png" value={classCount} label="Classes" />
        </div>

        {/* SCHEDULE */}
        <div className="bg-white rounded-xl p-4 md:p-6 mb-2">
          <div className="relative">
            <TeacherSchedule events={events} />
          </div>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="w-full xl:w-1/3 flex flex-col gap-3 xl:mt-[36px]">
        <div className="bg-white rounded-xl p-4 md:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-3 text-sm font-medium">
            <Shortcut
              href={`/list/classes?supervisorId=${teacher.id}`}
              label="Classes"
              color="bg-lamaSkyLight"
            />
            <Shortcut
              href={`/list/students?teacherId=${teacher.id}`}
              label="Students"
              color="bg-lamaPurpleLight"
            />
            <Shortcut
              href={`/list/lessons?teacherId=${teacher.id}`}
              label="Lessons"
              color="bg-lamaYellowLight"
            />
            <Shortcut
              href={`/list/exams?teacherId=${teacher.id}`}
              label="Exams"
              color="bg-pink-50"
            />
            <Shortcut
              href={`/list/assignments?teacherId=${teacher.id}`}
              label="Assignments"
              color="bg-lamaSkyLight"
            />
          </div>
        </div>
        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;

/* ================= HELPERS ================= */

const Stat = ({
  icon,
  value,
  label,
}: {
  icon: string;
  value: number | string;
  label: string;
}) => (
  <div className="bg-white rounded-xl px-4 py-4 flex items-center gap-4 shadow-sm">
    <Image src={icon} alt="" width={24} height={24} />
    <div>
      <h3 className="text-xs sm:text-lg font-semibold leading-none">{value}</h3>
      <span className="text-xs sm:text-sm text-gray-500">{label}</span>
    </div>
  </div>
);

const Info = ({ icon, value }: { icon: string; value: string }) => (
  <div className="flex items-start gap-2">
    <Image src={icon} alt="" width={14} height={14} className="mt-0.5" />
    <span className="text-gray-700 break-all sm:break-normal sm:truncate">
      {value}
    </span>
  </div>
);

const Shortcut = ({
  href,
  label,
  color,
}: {
  href: string;
  label: string;
  color: string;
}) => (
  <Link
    href={href}
    className={`p-3 rounded-lg text-center ${color} hover:opacity-80 transition`}
  >
    {label}
  </Link>
);
