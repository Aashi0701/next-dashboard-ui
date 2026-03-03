import Announcements from "@/components/Announcements";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Class, Student } from "@prisma/client";
import Image from "next/image";
import { notFound } from "next/navigation";
import StudentFeeForm from "./StudentFeeForm";
import PaymentForm from "./PaymentForm";
import RemoveFeeButton from "./RemoveFeeButton";
import StudentAttendanceCalendar from "@/components/StudentAttendanceCalendar";
import { Attendance } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/* =====================================================
   PAGE
===================================================== */
const SingleStudentPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* STUDENT */
  const student:
    | (Student & {
        class: Class & { _count: { lessons: number } };
      })
    | null = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { include: { _count: { select: { lessons: true } } } },
    },
  });

  if (!student) return notFound();

  /* ATTENDANCE DATA */

  const attendanceRaw = await prisma.attendance.findMany({
    where: { studentId: student.id },
    select: {
      date: true,
      present: true,
    },
  });

  const holidaysRaw = await prisma.holiday.findMany({
    select: {
      id: true,
      title: true,
      date: true,
    },
  });

  const activitiesRaw = await prisma.event.findMany({
    where: { classId: student.classId },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
    },
  });

  /* STUDENT FEES */
  const studentFees = await prisma.studentFee.findMany({
    where: { studentId: student.id },
    include: {
      feeStructure: { include: { class: true } },
      payments: { orderBy: { paidAt: "asc" } },
    },
    orderBy: { assignedAt: "asc" },
  });

  /* NORMALIZED FEES */
  const fees = studentFees.map((sf) => {
    const paid = sf.payments.reduce((s, p) => s + p.amount, 0);
    const due = Math.max(sf.totalAmount - paid, 0);
    const lastPayment = sf.payments.at(-1);

    return {
      id: sf.id,
      title: sf.feeStructure.title,
      className: sf.feeStructure.class?.name ?? "School-wide",
      total: sf.totalAmount,
      paid,
      due,
      isPaid: due === 0,
      lastPaymentDate: lastPayment?.paidAt,
      dueDate: sf.dueDate,
    };
  });

  /* SUMMARY */
  const totalFee = fees.reduce((s, f) => s + f.total, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paid, 0);
  const pending = totalFee - totalPaid;

  /* AVAILABLE FEES */
  const availableFees =
    role === "admin"
      ? await prisma.feeStructure.findMany({
          where: {
            isActive: true,
            OR: [{ classId: student.classId }, { classId: null }],
          },
          include: { class: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        })
      : [];

  /* NORMALIZE FOR CALENDAR */

  const attendance: Attendance[] = attendanceRaw.map((a) => ({
    date: a.date,
    status: a.present ? "PRESENT" : "ABSENT",
  }));

  const holidays = holidaysRaw.map((h) => ({
    id: String(h.id), // ✅ number → string
    title: h.title,
    date: h.date,
  }));

  const activities = activitiesRaw.map((e) => ({
    id: String(e.id), // ✅ number → string
    title: e.title,
    start: e.startTime,
    end: e.endTime,
  }));

  /* RENDER */
  return (
    <div className="flex-1 p-0 sm:p-4 flex flex-col gap-2 xl:flex-row">
      {/* ================= LEFT ================= */}
      <div className="w-full xl:w-2/3 flex flex-col gap-3">
        {/* ===== HEADER BAR ===== */}
        <div className="flex items-center gap-2 px-1 sm:px-0">
          <Link
            href="/list/students"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Students
          </Link>
        </div>
        {/* ================= PROFILE (POLISHED MOBILE) ================= */}
        <div className="bg-lamaSky/90 rounded-xl p-1 sm:p-3 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <Image
              src={student.img || "/noAvatar.png"}
              alt=""
              width={44}
              height={64}
              className="w-10 h-10 sm:w-24 sm:h-24 rounded-full object-cover"
            />

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-xl font-semibold truncate">
                  {student.name} {student.surname}
                </h1>

                {role === "admin" && (
                  <FormContainer table="student" type="update" data={student} />
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] sm:text-xs text-gray-700 font-semibold">
                <Info icon="/blood.png" value={student.bloodType} />
                <Info
                  icon="/date.png"
                  value={
                    student.birthday
                      ? new Intl.DateTimeFormat("en-GB").format(
                          student.birthday,
                        )
                      : "-"
                  }
                />
                <Info icon="/mail.png" value={student.email || "-"} />
                <Info icon="/phone.png" value={student.phone || "-"} />
              </div>
            </div>
          </div>
        </div>

        {/* ===== ADMIN: ANNOUNCEMENTS (STACKED UNDER PROFILE) ===== */}
        {role === "admin" && (
          <div className="xl:hidden">
            <Announcements />
          </div>
        )}

        {/* ===== STUDENT ATTENDANCE / SCHEDULE ===== */}
        <div className="bg-white rounded-xl p-4">
          <StudentAttendanceCalendar
            attendance={attendance}
            holidays={holidays}
            events={activities}
          />
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="w-full xl:w-1/3 flex flex-col gap-3 xl:mt-[36px]">
        {/* ===== FEES (ADMIN) ===== */}
        {role === "admin" && (
          <div className="bg-white p-4 rounded-xl border space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-semibold">Fees</h2>
              <StudentFeeForm studentId={student.id} fees={availableFees} />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <SummaryBox label="Total" value={totalFee} />
              <SummaryBox label="Paid" value={totalPaid} color="green" />
              <SummaryBox label="Pending" value={pending} color="red" />
            </div>

            <div className="flex justify-end">
              <a
                href={`/api/receipts/full/${student.id}`}
                target="_blank"
                className="text-blue-600 text-xs font-medium"
              >
                📄 Download Full Report
              </a>
            </div>

            <div className="space-y-2">
              {fees.map((f) => (
                <div key={f.id} className="border rounded-lg p-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium">{f.title}</p>
                      <p className="text-[11px] text-gray-400">{f.className}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold">₹ {f.total}</p>
                      {f.isPaid ? (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold">
                          PAID
                        </span>
                      ) : (
                        <StatusBadge paid={f.paid} due={f.due} />
                      )}
                    </div>
                  </div>

                  {f.due > 0 && (
                    <div className="mt-2 flex justify-end gap-2">
                      <PaymentForm
                        studentId={student.id}
                        studentFeeId={f.id}
                        dueAmount={f.due}
                        payments={
                          studentFees.find((sf) => sf.id === f.id)?.payments ??
                          []
                        }
                        variant="compact"
                      />

                      {f.paid === 0 && (
                        <RemoveFeeButton
                          studentFeeId={f.id}
                          studentId={student.id}
                          variant="compact"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== DESKTOP ONLY: ANNOUNCEMENTS + PERFORMANCE ===== */}
        {role === "admin" && (
          <div className="hidden xl:flex flex-col gap-3">
            <Announcements />
          </div>
        )}

        {/* ===== NON-ADMIN RIGHT ===== */}
        {role !== "admin" && (
          <>
            <Performance />
            <Announcements />
          </>
        )}
      </div>
    </div>
  );
};

/* =====================================================
   HELPERS
===================================================== */
const SummaryBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: "green" | "red";
}) => (
  <div className="border rounded-md p-2 bg-gray-50">
    <p className="text-[10px] text-gray-500">{label}</p>
    <p
      className={`font-semibold text-sm ${
        color === "green"
          ? "text-green-600"
          : color === "red"
            ? "text-red-600"
            : ""
      }`}
    >
      ₹ {value}
    </p>
  </div>
);

const StatusBadge = ({ paid, due }: { paid: number; due: number }) => {
  if (paid > 0) {
    return (
      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
        Due ₹{due}
      </span>
    );
  }

  return (
    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-semibold">
      DUE ₹{due}
    </span>
  );
};

const Info = ({ icon, value }: { icon: string; value: string }) => (
  <div className="flex items-start gap-2">
    <Image src={icon} alt="" width={14} height={14} className="mt-0.5" />
    <span className="text-gray-700 break-all sm:break-normal sm:truncate">
      {value}
    </span>
  </div>
);

export default SingleStudentPage;
