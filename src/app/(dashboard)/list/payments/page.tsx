// app/(dashboard)/list/payments/page.tsx

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import PaymentsClient, { FullStudentFee } from "@/components/PaymentsClient";
import PaymentsFilters from "@/components/filters/PaymentFilters";
import PaymentsSort from "@/components/filters/PaymentSort";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

/* ============================================================
   TYPES
============================================================ */
interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
  classId?: string;
  studentId?: string;
  sortBy?: string;
  sortOrder?: string;
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const { page, search, status, classId, studentId, sortBy, sortOrder } =
    params;

  const p = page ? Number(page) : 1;

  /* ================= USER ROLE ================= */
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role ?? "";

  /* ================= STUDENT FILTER ================= */
  const studentWhere: Prisma.StudentWhereInput = {};

  /* SEARCH (name / surname) */
  if (search) {
    studentWhere.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { surname: { contains: search, mode: "insensitive" } },
    ];
  }

  /* CLASS FILTER */
  if (classId) {
    studentWhere.classId = Number(classId);
  }

  /* STUDENT FILTER */
  if (studentId) {
    studentWhere.id = studentId;
  }

  /* ================= FINAL WHERE ================= */
  const where: Prisma.StudentFeeWhereInput = {};

  if (Object.keys(studentWhere).length > 0) {
    where.student = {
      is: studentWhere,
    };
  }

  /* ================= SORT ================= */
  let orderBy: Prisma.StudentFeeOrderByWithRelationInput = {
    assignedAt: "desc",
  };

  if (sortBy) {
    orderBy = {
      [sortBy]: sortOrder === "desc" ? "desc" : "asc",
    };
  }

  /* ================= FETCH ================= */
  const fullData = await prisma.studentFee.findMany({
    where,
    include: {
      student: {
        include: {
          class: true,
          parent: true,
        },
      },
      feeStructure: true,
      payments: true,
    },
    orderBy,
  });

  /* ================= STATUS FILTER (IN-MEMORY) ================= */
  const filteredData = fullData.filter((item) => {
    const total = item.feeStructure.amount;
    const paid = item.payments.reduce((sum, p) => sum + p.amount, 0);

    if (status === "PAID") return paid === total;
    if (status === "PARTIAL") return paid > 0 && paid < total;
    if (status === "PENDING") return paid === 0;

    return true;
  });

  /* ================= PAGINATION ================= */
  const count = filteredData.length;

  const paginatedData = filteredData.slice(
    ITEM_PER_PAGE * (p - 1),
    ITEM_PER_PAGE * p,
  );

  const typedData = paginatedData as FullStudentFee[];

  /* ================= FILTER DATA ================= */
  const [classes, students] = await Promise.all([
    prisma.class.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.student.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
          <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
            <CreditCard size={14} />
          </span>
          Payments
        </h1>

        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          {/* Search */}
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <PaymentsFilters classes={classes} students={students} />
            <PaymentsSort />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <PaymentsClient
        data={typedData}
        count={count}
        page={p}
        role={role}
        classes={classes}
      />

      <Pagination page={p} count={count} />
    </div>
  );
}
