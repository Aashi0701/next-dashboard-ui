import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Assignment, Class, Prisma, Subject, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import FormContainer from "@/components/FormContainer";
import AssignmentFilters from "@/components/filters/AssignmentFilters";
import AssignmentSort from "@/components/filters/AssignmentSort";
import AssignmentCard from "@/components/mobile/AssignmentCard";

type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

export default async function AssignmentListPage({
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

  /* ================= FILTER DATA ================= */
  const [subjects, classes, teachers] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
  ]);

  /* ================= TABLE STRUCTURE ================= */
  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: AssignmentList) => (
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
        {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
      </td>

      {(role === "admin" || role === "teacher") && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer
              table="assignment"
              type="update"
              data={item}
              id={item.id}
            />
            <FormContainer table="assignment" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= QUERY ================= */
  const query: Prisma.AssignmentWhereInput = {
    lesson: { subject: {}, teacher: {}, class: {} },
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
        query.lesson!.teacherId = value;
        break;
      case "dateFrom":
        query.dueDate = { gte: new Date(value) };
        break;
      case "dateTo":
        query.dueDate = {
          ...((query.dueDate as any)?.gte
            ? { gte: (query.dueDate as any).gte }
            : {}),
          lte: new Date(value),
        };
        break;
      case "search":
        query.lesson!.subject = {
          name: { contains: value, mode: "insensitive" },
        };
        break;
    }
  }

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

  /* ================= SORT ================= */
  const order = sortOrder === "desc" ? "desc" : "asc";
  let orderBy: any = {};

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
    case "dueDate":
      orderBy = { dueDate: order };
      break;
  }

  /* ================= DATA ================= */
  const [data, count] = await prisma.$transaction([
    prisma.assignment.findMany({
      where: query,
      include: {
        lesson: { select: { subject: true, teacher: true, class: true } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.assignment.count({ where: query }),
  ]);

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-base md:text-lg font-semibold">Assignments</h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />
          <AssignmentFilters
            subjects={subjects}
            classes={classes}
            teachers={teachers}
          />
          <AssignmentSort />
          {(role === "admin" || role === "teacher") && (
            <FormContainer table="assignment" type="create" />
          )}
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden mt-4 space-y-3">
        {data.map((item) => {
          const isTarget = params.action && params.id === String(item.id);

          return (
            <AssignmentCard
              key={item.id}
              item={item}
              role={role}
              action={
                isTarget ? (params.action as "edit" | "delete") : undefined
              }
            />
          );
        })}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
}
