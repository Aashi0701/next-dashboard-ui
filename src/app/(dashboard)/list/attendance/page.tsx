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

export const dynamic = "force-dynamic";

export default async function AttendanceListPage({ searchParams }: any) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...filters } = params;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  /* ================= FILTER DATA ================= */

  const [students, lessons] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: "asc" } }),
    prisma.lesson.findMany({
      include: { subject: true, class: true },
      orderBy: { id: "asc" },
    }),
  ]);

  /* ================= QUERY ================= */

  const query: Prisma.AttendanceWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    switch (key) {
      case "studentId":
        query.studentId = value;
        break;

      case "classId":
        query.lesson = { classId: Number(value) };
        break;

      case "present":
        query.present = value === "present";
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

  if (role === "teacher") query.lesson = { teacherId: currentUserId! };
  if (role === "student") query.studentId = currentUserId!;
  if (role === "parent") query.student = { parentId: currentUserId! };

  /* ================= SORT ================= */

  const order: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

  let orderBy: Prisma.AttendanceOrderByWithRelationInput = { date: "desc" };

  switch (sortBy) {
    case "student":
      orderBy = { student: { name: order } };
      break;
    case "class":
      orderBy = { lesson: { class: { name: order } } };
      break;
    case "status":
      orderBy = { present: order };
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
        student: true,
        lesson: { include: { class: true, subject: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.attendance.count({ where: query }),
  ]);

  // 👉 Display-only data
  const data: AttendanceItem[] = rows.map((item) => ({
    id: item.id,
    student: `${item.student.name} ${item.student.surname}`,
    class: item.lesson.class.name,
    date: new Intl.DateTimeFormat("en-US").format(item.date),
    status: item.present ? "Present" : "Absent",
  }));

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <h1 className="text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
          Attendance
        </h1>

        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          {/* Search */}
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <AttendanceFilters students={students} lessons={lessons} />
            <AttendanceSort />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="attendance" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block mt-4">
        <Table
          columns={[
            { header: "Student", accessor: "student" },
            { header: "Class", accessor: "class" },
            { header: "Date", accessor: "date" },
            { header: "Status", accessor: "status" },
            ...(role === "admin"
              ? [{ header: "Actions", accessor: "action" }]
              : []),
          ]}
          data={data}
          renderRow={(item) => {
            // 🔑 IMPORTANT: map back to RAW prisma row
            const row = rows.find((r) => r.id === item.id)!;

            return (
              <tr key={item.id} className="border-b text-sm">
                <td className="p-4">{item.student}</td>
                <td className="p-4">{item.class}</td>
                <td className="p-4">{item.date}</td>
                <td className="p-4">
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
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <FormContainer
                        table="attendance"
                        type="update"
                        id={row.id}
                        data={{
                          id: row.id,
                          studentId: row.studentId,
                          lessonId: row.lessonId,
                          date: row.date,
                          present: row.present,
                        }}
                      />
                      <FormContainer
                        table="attendance"
                        type="delete"
                        id={row.id}
                      />
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
