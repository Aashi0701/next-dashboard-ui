import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

import LessonFilters from "@/components/filters/LessonFilters";
import LessonSort from "@/components/filters/LessonSort";

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const params = await searchParams;
  const { page, sortBy, sortOrder, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;

  // LOAD FILTER DATA
  const [subjects, teachers, classes] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  const relatedData = { subjects, teachers, classes };

  // TABLE STRUCTURE
  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Subject */}
      <td className="p-4 truncate">
        {item.subject.name}
      </td>

      {/* Class */}
      <td className="p-4 truncate">
        {item.class.name}
      </td>

      {/* Teacher */}
      <td className="p-4 truncate hidden md:table-cell">
        {item.teacher.name} {item.teacher.surname}
      </td>

      {/* Actions */}
      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer
              table="lesson"
              type="update"
              data={item}
              relatedData={relatedData}
            />
            <FormContainer
              table="lesson"
              type="delete"
              id={item.id}
            />
          </div>
        </td>
      )}
    </tr>
  );

  // BUILD QUERY
  const query: Prisma.LessonWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "subjectId":
        query.subjectId = Number(value);
        break;
      case "classId":
        query.classId = Number(value);
        break;
      case "teacherId":
        query.teacherId = value;
        break;
      case "search":
        query.OR = [
          { subject: { name: { contains: value, mode: "insensitive" } } },
          { teacher: { name: { contains: value, mode: "insensitive" } } },
          { class: { name: { contains: value, mode: "insensitive" } } },
        ];
        break;
    }
  }

  // SORT LOGIC
  let orderBy: any = {};
  const order = sortOrder === "desc" ? "desc" : "asc";

  if (sortBy) {
    switch (sortBy) {
      case "subject":
        orderBy = { subject: { name: order } };
        break;
      case "class":
        orderBy = { class: { name: order } };
        break;
      case "teacher":
        orderBy = { teacher: { name: order } };
        break;
      case "date":
        orderBy = { createdAt: order };
        break;
    }
  }

  // FETCH DATA
  const [data, count] = await prisma.$transaction([
    prisma.lesson.findMany({
      where: query,
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.lesson.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Lessons</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <LessonFilters subjects={subjects} teachers={teachers} classes={classes} />
            <LessonSort />

            {role === "admin" && (
              <FormContainer table="lesson" type="create" relatedData={relatedData} />
            )}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default LessonListPage;
