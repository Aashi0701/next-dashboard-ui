// FIXED AttendanceListPage.tsx

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

export default async function AttendanceListPage({ searchParams }: any) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...filters } = params;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const [students, lessons] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: "asc" } }),
    prisma.lesson.findMany({
      orderBy: { id: "asc" },
      include: { subject: true, class: true },
    }),
  ]);

  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Lesson", accessor: "lesson" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Status", accessor: "status", className: "hidden md:table-cell" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const query: Prisma.AttendanceWhereInput = {
  student: {},
  lesson: {
    class: {},
    teacher: {},
    subject: {},
  },
  date: {}, // fix undefined spread errors
};

for (const [key, value] of Object.entries(filters)) {
  if (!value) continue;

  const v = value as string;  // FIX #1: ensures v is a string

  switch (key) {
    case "studentId":
      query.studentId = v;
      break;

    case "lessonId":
      query.lessonId = Number(v);
      break;

    case "classId":
      query.lesson!.classId = Number(v);
      break;

    case "present":
      query.present = v === "present";
      break;

    case "dateFrom":
      query.date = {
        ...(query.date as Prisma.DateTimeFilter),
        gte: new Date(v),  // FIX #2
      };
      break;

    case "dateTo":
      query.date = {
        ...(query.date as Prisma.DateTimeFilter),
        lte: new Date(v),  // FIX #3
      };
      break;

    case "search":
      query.student = {
        is: {
          OR: [
            { name: { contains: v, mode: "insensitive" } },
            { surname: { contains: v, mode: "insensitive" } },
          ],
        },
      };
      break;
  }
}


  // Role conditions
  if (role === "teacher") {
    if (!query.lesson) query.lesson = {};
    query.lesson.teacherId = currentUserId!;
  }

  if (role === "student") {
    query.studentId = currentUserId!;
  }

  if (role === "parent") {
    query.student = { parentId: currentUserId! };
  }

  // Sorting
  const order = sortOrder === "desc" ? "desc" : "asc";
  let orderBy: any = {};

  if (sortBy) {
    switch (sortBy) {
      case "student":
        orderBy = { student: { name: order } };
        break;
      case "lesson":
        orderBy = { lesson: { subject: { name: order } } };
        break;
      case "class":
        orderBy = { lesson: { class: { name: order } } };
        break;
      case "date":
        orderBy = { date: order };
        break;
    }
  }

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

  const data = rows.map((item) => ({
    id: item.id,
    student: item.student.name + " " + item.student.surname,
    lesson: item.lesson.subject.name,
    class: item.lesson.class.name,
    date: new Intl.DateTimeFormat("en-US").format(item.date),
    status: item.present ? "Present" : "Absent",
  }));

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Attendance Records
        </h1>

        <div className="flex items-center gap-4">
          <TableSearch />
          <AttendanceFilters students={students} lessons={lessons} />
          <AttendanceSort />

          {(role === "admin" || role === "teacher") && (
            <FormContainer table="attendance" type="create" />
          )}
        </div>
      </div>

      <Table
        columns={columns}
        data={data}
        renderRow={(item) => (
          <tr key={item.id} className="border-b border-gray-200 text-sm">
            <td className="p-4">{item.student}</td>

            <td className="p-4">{item.lesson}</td>

            <td className="p-4 hidden md:table-cell">{item.class}</td>

            <td className="p-4 hidden md:table-cell">{item.date}</td>

            <td className="p-4 hidden md:table-cell">
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

            {(role === "admin" || role === "teacher") && (
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
      <Pagination page={p} count={count} />
    </div>
  );
}
