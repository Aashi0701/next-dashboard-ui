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

export const dynamic = "force-dynamic";

export default async function AttendanceListPage({ searchParams }: any) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...filters } = params;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  /* ================= DATA ================= */
  const [students, lessons] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: "asc" } }),
    prisma.lesson.findMany({
      include: { subject: true, class: true },
      orderBy: { id: "asc" },
    }),
  ]);

  /* ================= QUERY ================= */
  const query: Prisma.AttendanceWhereInput = {
    lesson: {},
    date: {},
  };

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;
    const v = value as string;

    switch (key) {
      case "studentId":
        query.studentId = v;
        break;
      case "classId":
        query.lesson!.classId = Number(v);
        break;
      case "present":
        query.present = v === "present";
        break;
      case "dateFrom":
        query.date = { ...(query.date as any), gte: new Date(v) };
        break;
      case "dateTo":
        query.date = { ...(query.date as any), lte: new Date(v) };
        break;
    }
  }

  if (role === "teacher") query.lesson!.teacherId = currentUserId!;
  if (role === "student") query.studentId = currentUserId!;
  if (role === "parent") query.student = { parentId: currentUserId! };

  /* ================= SORT ================= */
  const order: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";

  let orderBy: Prisma.AttendanceOrderByWithRelationInput = {
    date: "desc", // default sort
  };

  switch (sortBy) {
    case "student":
      orderBy = {
        student: { name: order },
      };
      break;

    case "class":
      orderBy = {
        lesson: { class: { name: order } },
      };
      break;

    case "date":
      orderBy = {
        date: order,
      };
      break;

    case "status":
      orderBy = {
        present: order, // ✅ Present / Absent sorting
      };
      break;
  }

  /* ================= FETCH ================= */
  const [rows, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      orderBy,
      include: {
        student: true,
        lesson: { include: { class: true, subject: true } },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.attendance.count({ where: query }),
  ]);

  const data = rows.map((item) => ({
    id: item.id,
    student: `${item.student.name} ${item.student.surname}`,
    class: item.lesson.class.name,
    date: new Intl.DateTimeFormat("en-US").format(item.date),
    status: (item.present ? "Present" : "Absent") as "Present" | "Absent",
  }));

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-base md:text-lg font-semibold">
          Attendance Records
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />
          <AttendanceFilters students={students} lessons={lessons} />
          <AttendanceSort />
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="attendance" type="create" />
          )}
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
          renderRow={(item) => (
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
                      data={item}
                      id={item.id}
                    />
                    <FormContainer
                      table="attendance"
                      type="delete"
                      id={item.id}
                    />
                  </div>
                </td>
              )}
            </tr>
          )}
        />
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden mt-4 space-y-2">
        {data.map((item) => (
          <AttendanceCard
            key={item.id}
            item={item}
            actions={
              role === "admin" && (
                <div className="flex gap-2">
                  <FormContainer
                    table="attendance"
                    type="update"
                    id={item.id}
                  />
                  <FormContainer
                    table="attendance"
                    type="delete"
                    id={item.id}
                  />
                </div>
              )
            }
          />
        ))}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
}
