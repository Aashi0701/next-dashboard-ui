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
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

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
  const queryString = new URLSearchParams(params as any).toString();

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

  /* ================= FILTER CONFIG ================= */
  const paymentFilterConfig = {
    classId: {
      label: "Class",
      icon: "🏫",
      options: classes.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    },

    studentId: {
      label: "Student",
      icon: "🎓",
      options: students.map((s) => ({
        label: s.name,
        value: s.id,
      })),
    },

    status: {
      label: "Status",
      icon: "💳",
      options: [
        { label: "Paid", value: "PAID" },
        { label: "Partial", value: "PARTIAL" },
        { label: "Pending", value: "PENDING" },
      ],
    },

    // sortBy: {
    //   label: "Sort By",
    //   icon: "↕️",
    //   options: [
    //     { label: "Assigned Date", value: "assignedAt" },
    //     { label: "Amount", value: "amount" },
    //   ],
    // },

    // sortOrder: {
    //   label: "Order",
    //   icon: "🔽",
    //   options: [
    //     { label: "Ascending", value: "asc" },
    //     { label: "Descending", value: "desc" },
    //   ],
    // },
  };

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = typedData.length === 0;

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <CreditCard size={14} />
            </span>
            Payments
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span>{" "}
              payments
              <span className="ml-2 text-gray-400">
                • Page <span className="font-medium text-gray-700">{p}</span> of{" "}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </span>
            </p>
          )}
        </div>

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
      <AdvancedFilterBar config={paymentFilterConfig} />
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
