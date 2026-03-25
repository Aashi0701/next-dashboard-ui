// app/(dashboard)/list/attendance/page.tsx

import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import FormContainer from "@/components/FormContainer";
import AttendanceFilters from "@/components/filters/AttendanceFilters";
import AttendanceSort from "@/components/filters/AttendanceSort";
import AttendanceCard from "@/components/mobile/AttendanceCard";
import type { AttendanceItem } from "@/lib/types";
import { CalendarCheck } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

export const dynamic = "force-dynamic";

export default async function AttendanceListPage({ searchParams }: any) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...filters } = params;

  const p = page ? parseInt(page) : 1;
  const queryString = new URLSearchParams(params as any).toString();

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  /* ================= FILTER DATA ================= */

  const students = await prisma.student.findMany({
    include: { class: true },
    orderBy: { name: "asc" },
  });

  // ✅ UNIQUE CLASS LIST
  const classOptions = Array.from(
    new Map(students.map((s) => [s.class.id, s.class.name])).entries(),
  ).map(([id, name]) => ({
    label: name,
    value: String(id),
  }));

  /* ================= FILTER CONFIG ================= */

  const attendanceFilterConfig = {
    studentId: {
      label: "Student",
      icon: "🎓",
      options: students.map((s) => ({
        label: `${s.name} ${s.surname}`,
        value: s.id,
      })),
    },

    classId: {
      label: "Class",
      icon: "🏫",
      options: classOptions,
    },

    present: {
      label: "Status",
      icon: "✅",
      options: [
        { label: "Present", value: "present" },
        { label: "Absent", value: "absent" },
      ],
    },

    // sortBy: {
    //   label: "Sort By",
    //   icon: "↕️",
    //   options: [
    //     { label: "Student", value: "student" },
    //     { label: "Class", value: "class" },
    //     { label: "Status", value: "status" },
    //     { label: "Date", value: "date" },
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

  /* ================= QUERY ================= */

  let query: Prisma.AttendanceWhereInput = {};

  /* ================= ROLE-BASED FILTER ================= */

  let teacherRecord = null;

  if (role === "teacher") {
    teacherRecord = await prisma.teacher.findUnique({
      where: { userId: currentUserId! },
    });

    if (!teacherRecord) {
      return (
        <div className="p-6 text-sm text-red-500">
          Teacher not mapped to system.
        </div>
      );
    }

    query.student = {
      class: {
        lessons: {
          some: {
            teacherId: teacherRecord.id, // ✅ FIXED
          },
        },
      },
    };
  }

  if (role === "student") {
    query.studentId = currentUserId!;
  }

  if (role === "parent") {
    query.student = {
      parentId: currentUserId!,
    };
  }

  /* ================= FILTER PARAMS ================= */

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    switch (key) {
      case "studentId":
        query.studentId = value;
        break;

      case "classId":
        query.student = {
          ...(query.student as Prisma.StudentWhereInput),
          classId: Number(value),
        };
        break;

      case "present":
        query.status = value;
        break;

      case "dateFrom":
        query.date = {
          ...(query.date as Prisma.DateTimeFilter),
          gte: new Date(String(value)),
        };
        break;

      case "dateTo":
        query.date = {
          ...(query.date as Prisma.DateTimeFilter),
          lte: new Date(String(value)),
        };
        break;
    }
  }

  /* ================= SORT ================= */

  const order: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

  let orderBy: Prisma.AttendanceOrderByWithRelationInput = { date: "desc" };

  switch (sortBy) {
    case "student":
      orderBy = { student: { name: order } };
      break;
    case "status":
      orderBy = { status: order };
      break;
    case "date":
      orderBy = { date: order };
      break;
  }

  /* ================= DATA ================= */

  const [rows, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: {
          include: {
            class: true, // ✅ FIX
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.attendance.count({ where: query }),
  ]);

  /* ================= DATA MAPPING ================= */

  const data: AttendanceItem[] = rows.map((item) => ({
    id: item.id,
    student: `${item.student.name} ${item.student.surname}`,
    class: item.student.class.name,
    date: new Intl.DateTimeFormat("en-US").format(item.date),
    status: item.status === "present" ? "Present" : "Absent",
  }));

  /* ================= PAGINATION ================= */

  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = data.length === 0;

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <CalendarCheck size={14} />
            </span>
            Attendance
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span>{" "}
              attendance
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
            <AttendanceFilters students={students} lessons={[]} />
            <AttendanceSort />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="attendance" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block mt-4">
        <AdvancedFilterBar config={attendanceFilterConfig} />
        <Table
          columns={[
            { header: "Student", accessor: "student", className: "w-[30%]" },
            { header: "Class", accessor: "class", className: "w-[20%]" },
            { header: "Date", accessor: "date", className: "w-[20%]" },
            { header: "Status", accessor: "status", className: "w-[15%]" },
            ...(role === "admin"
              ? [
                  {
                    header: "Actions",
                    accessor: "action",
                    className: "w-[15%] text-center",
                  },
                ]
              : []),
          ]}
          data={data}
          renderRow={(item) => {
            // 🔑 IMPORTANT: map back to RAW prisma row
            const row = rows.find((r) => r.id === item.id)!;

            return (
              <tr
                key={item.id}
                className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
              >
                <td className="px-2 py-1.5 md:px-3 md:py-2">{item.student}</td>
                <td className="px-2 py-1.5 md:px-3 md:py-2">{item.class}</td>
                <td className="px-2 py-1.5 md:px-3 md:py-2">{item.date}</td>
                <td className="px-2 py-1.5 md:px-3 md:py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.status === "Present"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                {role === "admin" && (
                  <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Tooltip content="Edit Attendance">
                        <span className="inline-flex shrink-0">
                          <FormContainer
                            table="attendance"
                            type="update"
                            id={row.id}
                            data={{
                              id: row.id,
                              studentId: row.studentId,
                              date: row.date,
                              present: row.status === "present",
                            }}
                            query={queryString}
                          />
                        </span>
                      </Tooltip>
                      <Tooltip content="Delete Attendance">
                        <span className="inline-flex shrink-0">
                          <FormContainer
                            table="attendance"
                            type="delete"
                            id={row.id}
                            query={queryString}
                          />
                        </span>
                      </Tooltip>
                    </div>
                  </td>
                )}
              </tr>
            );
          }}
        />
      </div>

      {/* MOBILE */}
      <div className="md:hidden mt-4 space-y-3">
        {data.map((item) => (
          <AttendanceCard key={item.id} item={item} role={role} />
        ))}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
}
