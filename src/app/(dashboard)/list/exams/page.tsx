import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

import ExamFilters from "@/components/filters/ExamFilters";
import ExamSort from "@/components/filters/ExamSort";

type ExamList = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

export default async function ExamListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...queryParams } = params;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const p = page ? parseInt(page) : 1;

  // Load filters data
  const [subjects, classes, teachers] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
  ]);

  // Table Columns
  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 truncate">{item.lesson.subject.name}</td>
      <td className="p-4 truncate">{item.lesson.class.name}</td>
      <td className="p-4 hidden md:table-cell truncate">
        {item.lesson.teacher.name} {item.lesson.teacher.surname}
      </td>
      <td className="p-4 hidden md:table-cell truncate">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {(role === "admin" || role === "teacher") && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer table="exam" type="update" data={item} />
            <FormContainer table="exam" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // --------------------------------------------------------
  //                 BUILD FILTER QUERY (FULL FIX)
  // --------------------------------------------------------

  const query: Prisma.ExamWhereInput = {
    lesson: {
      subject: {},
      teacher: {},
      class: {},
    },
  };

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "subjectId":
        query.lesson!.subjectId = Number(value);
        break;

      case "classId":
        query.lesson!.classId = Number(value);
        break;

      case "teacherId":
        query.lesson!.teacherId = value; // teacherId is string
        break;

      case "dateFrom":
        query.startTime = { gte: new Date(value) };
        break;

      case "dateTo": {
        const existing = query.startTime;

        // Only merge if startTime is an object, not string or Date
        if (existing && typeof existing === "object" && !("getTime" in existing)) {
          query.startTime = {
            ...(existing.gte ? { gte: existing.gte } : {}),
            lte: new Date(value),
          };
        } else {
          query.startTime = { lte: new Date(value) };
        }
        break;
      }

      case "search":
        query.lesson!.subject = {
          name: { contains: value, mode: "insensitive" },
        };
        break;
    }
  }

  // --------------------------------------------------------
  //                  ROLE CONDITIONS 
  // --------------------------------------------------------

  if (role === "teacher") {
    query.lesson!.teacherId = currentUserId!;
  }

  if (role === "student") {
    query.lesson!.class = {
      students: { some: { id: currentUserId! } },
    };
  }

  if (role === "parent") {
    query.lesson!.class = {
      students: { some: { parentId: currentUserId! } },
    };
  }

  // --------------------------------------------------------
  //                        SORTING 
  // --------------------------------------------------------

  let orderBy: any = {};
  const order = sortOrder === "desc" ? "desc" : "asc";

  switch (sortBy) {
    case "subject":
      orderBy = { lesson: { subject: { name: order } } };
      break;

    case "class":
      orderBy = { lesson: { class: { name: order } } };
      break;

    case "teacher":
      orderBy = { lesson: { teacher: { name: order } } };
      break;

    case "date":
      orderBy = { startTime: order };
      break;
  }

  // --------------------------------------------------------
  //                    FETCH DATA 
  // --------------------------------------------------------

  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: true,
            teacher: true,
            class: true,
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.exam.count({ where: query }),
  ]);

  // --------------------------------------------------------
  //                    RETURN UI 
  // --------------------------------------------------------

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <ExamFilters subjects={subjects} classes={classes} teachers={teachers} />
            <ExamSort />

            {(role === "admin" || role === "teacher") && (
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
}
