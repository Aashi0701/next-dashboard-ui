import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
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

  /* ================= STUDENT ================= */
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

  /* ================= STUDENT FEES ================= */
  const studentFees = await prisma.studentFee.findMany({
    where: { studentId: student.id },
    include: {
      feeStructure: { include: { class: true } },
      payments: { orderBy: { paidAt: "asc" } },
    },
    orderBy: { assignedAt: "asc" },
  });

  /* ================= NORMALIZED FEES ================= */
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

  /* ================= SUMMARY ================= */
  const totalFee = fees.reduce((s, f) => s + f.total, 0);
  const totalPaid = fees.reduce((s, f) => s + f.paid, 0);
  const pending = totalFee - totalPaid;

  /* ================= AVAILABLE FEES ================= */
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

  /* ================= RENDER ================= */
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* PROFILE */}
        <div className="bg-lamaSky py-6 px-4 rounded-md flex gap-4">
          <Image
            src={student.img || "/noAvatar.png"}
            alt=""
            width={144}
            height={144}
            className="w-36 h-36 rounded-full object-cover"
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">
                {student.name} {student.surname}
              </h1>
              {role === "admin" && (
                <FormContainer table="student" type="update" data={student} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <span>Blood: {student.bloodType}</span>
              <span>
                DOB:{" "}
                {new Intl.DateTimeFormat("en-GB").format(student.birthday)}
              </span>
              <span>Email: {student.email || "-"}</span>
              <span>Phone: {student.phone || "-"}</span>
            </div>
          </div>
        </div>

        {/* SCHEDULE */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h1 className="font-semibold mb-2">Student Schedule</h1>
          <BigCalendarContainer type="classId" id={student.class.id} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        {/* FEES */}
        {role === "admin" && (
          <div className="bg-white p-5 rounded-md border space-y-5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Fees</h2>
              <StudentFeeForm studentId={student.id} fees={availableFees} />
            </div>

            {/* SUMMARY */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <SummaryBox label="Total" value={totalFee} />
              <SummaryBox label="Paid" value={totalPaid} color="green" />
              <SummaryBox label="Pending" value={pending} color="red" />
            </div>

            {/* FEES LIST */}
            <div className="space-y-3">
              {fees.map((f) => (
                <div key={f.id} className="border rounded-md p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{f.title}</p>
                      <p className="text-xs text-gray-400">{f.className}</p>

                      {/* DATE LINE */}
                      {f.isPaid ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Paid on{" "}
                          {new Intl.DateTimeFormat("en-GB").format(
                            f.lastPaymentDate!
                          )}
                        </p>
                      ) : f.paid > 0 ? (
                        <p className="text-xs text-gray-500 mt-1">
                          Last paid on{" "}
                          {new Intl.DateTimeFormat("en-GB").format(
                            f.lastPaymentDate!
                          )}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">
                          Due date{" "}
                          {f.dueDate
                            ? new Intl.DateTimeFormat("en-GB").format(f.dueDate)
                            : "—"}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-medium">₹ {f.total}</p>
                      {f.paid > 0 && f.due > 0 && (
                        <p className="text-xs text-gray-400">
                          ₹{f.paid} paid
                        </p>
                      )}
                      <StatusBadge paid={f.paid} due={f.due} />
                      {f.isPaid && (
                        <a
                          href={`/api/receipts/${f.id}`}
                          target="_blank"
                          className="inline-block mt-1 text-xs text-blue-600 hover:underline font-medium"
                        >
                          Download Receipt
                        </a>
                      )}
                    </div>
                  </div>

                  {/* ACTIONS */}
                  {f.due > 0 && (
                    <div className="mt-3 flex justify-end items-center gap-2">
                      <PaymentForm
                        studentId={student.id}
                        studentFeeId={f.id}
                        dueAmount={f.due}
                        payments={studentFees
                          .find(sf => sf.id === f.id)
                          ?.payments ?? []}
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

        <Performance />
        <Announcements />
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
  <div className="border rounded-md p-3 bg-gray-50">
    <p className="text-xs text-gray-500">{label}</p>
    <p
      className={`font-semibold ${
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
  if (due === 0) {
    return (
      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
        PAID
      </span>
    );
  }

  if (paid > 0) {
    return (
      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
        Due ₹{due}
      </span>
    );
  }

  return (
    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
      DUE ₹{due}
    </span>
  );
};

export default SingleStudentPage;
