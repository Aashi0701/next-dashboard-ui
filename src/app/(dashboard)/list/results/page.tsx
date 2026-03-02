// app/(dashboard)/list/results/page.tsx

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import ResultFilters from "@/components/filters/ResultFilters";
import ResultSort from "@/components/filters/ResultSort";
import ResultsCard from "@/components/mobile/ResultsCard";

/* ================= TYPES ================= */

type ResultList = {
  id: number;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  className: string;
  startTime: Date;
};

/* ================= HELPERS ================= */

function mergeSafe<T extends object>(
  base: T | null | undefined,
  extend: Partial<T>,
): T {
  return {
    ...(typeof base === "object" && base !== null ? base : {}),
    ...extend,
  } as T;
}

function setLessonFilter(target: any, field: string, value: any) {
  target.lesson = mergeSafe(target.lesson, {
    is: mergeSafe(target.lesson?.is, {
      [field]: value,
    }),
  });
}

/* ================= PAGE ================= */

export default async function ResultListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...filters } = params;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  /* ================= FILTER DATA ================= */
  const [students, teachers, classes, subjects] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  /* ================= TABLE STRUCTURE ================= */
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Student", accessor: "student" },
    { header: "Score", accessor: "score", className: "hidden md:table-cell" },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* TITLE */}
      <td className="p-4 max-w-[220px] truncate">{item.title}</td>

      {/* STUDENT */}
      <td className="p-4 max-w-[180px] truncate">
        {item.studentName} {item.studentSurname}
      </td>

      {/* SCORE */}
      <td className="p-4 hidden md:table-cell">{item.score}</td>

      {/* TEACHER */}
      <td className="p-4 hidden md:table-cell max-w-[180px] truncate">
        {item.teacherName} {item.teacherSurname}
      </td>

      {/* CLASS */}
      <td className="p-4 hidden md:table-cell max-w-[140px] truncate">
        {item.className}
      </td>

      {/* DATE */}
      <td className="p-4 hidden md:table-cell whitespace-nowrap">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {/* ACTIONS */}
      {(role === "admin" || role === "teacher") && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer
              table="result"
              type="update"
              data={item}
              id={item.id}
            />
            <FormContainer table="result" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= QUERY ================= */
  const query: Prisma.ResultWhereInput = {};
  const examCond: Prisma.ExamWhereInput = {};
  const assignmentCond: Prisma.AssignmentWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    switch (key) {
      case "studentId":
        query.studentId = value;
        break;

      case "classId":
        setLessonFilter(examCond, "classId", Number(value));
        setLessonFilter(assignmentCond, "classId", Number(value));
        break;

      case "subjectId":
        setLessonFilter(examCond, "subjectId", Number(value));
        setLessonFilter(assignmentCond, "subjectId", Number(value));
        break;

      case "teacherId":
        setLessonFilter(examCond, "teacherId", value);
        setLessonFilter(assignmentCond, "teacherId", value);
        break;

      case "type":
        if (value === "exam") query.exam = { isNot: null };
        if (value === "assignment") query.assignment = { isNot: null };
        break;

      case "search":
        query.OR = [
          { exam: { title: { contains: value, mode: "insensitive" } } },
          { assignment: { title: { contains: value, mode: "insensitive" } } },
          { student: { name: { contains: value, mode: "insensitive" } } },
          { student: { surname: { contains: value, mode: "insensitive" } } },
        ];
        break;
    }
  }

  if (Object.keys(examCond).length > 0)
    query.exam = mergeSafe(query.exam, examCond);
  if (Object.keys(assignmentCond).length > 0)
    query.assignment = mergeSafe(query.assignment, assignmentCond);

  /* ================= ROLE CONDITIONS ================= */
  if (role === "teacher") {
    setLessonFilter(examCond, "teacherId", currentUserId!);
    setLessonFilter(assignmentCond, "teacherId", currentUserId!);
    query.OR = [
      { exam: mergeSafe(query.exam, examCond) },
      { assignment: mergeSafe(query.assignment, assignmentCond) },
    ];
  }

  if (role === "student") query.studentId = currentUserId!;
  if (role === "parent") query.student = { parentId: currentUserId! };

  /* ================= SORT ================= */
  const order = sortOrder === "desc" ? "desc" : "asc";
  let orderBy: any = { id: "desc" };

  switch (sortBy) {
    case "title":
      orderBy = [{ exam: { title: order } }, { assignment: { title: order } }];
      break;
    case "student":
      orderBy = { student: { name: order } };
      break;
    case "teacher":
      orderBy = [
        { exam: { lesson: { teacher: { name: order } } } },
        { assignment: { lesson: { teacher: { name: order } } } },
      ];
      break;
    case "class":
      orderBy = [
        { exam: { lesson: { class: { name: order } } } },
        { assignment: { lesson: { class: { name: order } } } },
      ];
      break;
  }

  /* ================= DATA ================= */
  const [rows, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: true,
        exam: {
          include: {
            lesson: { include: { teacher: true, class: true } },
          },
        },
        assignment: {
          include: {
            lesson: { include: { teacher: true, class: true } },
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data: ResultList[] = rows
    .map((item) => {
      const src = item.exam || item.assignment;
      if (!src) return null;

      return {
        id: item.id,
        title: src.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: src.lesson.teacher.name,
        teacherSurname: src.lesson.teacher.surname,
        score: item.score,
        className: src.lesson.class.name,
        startTime: item.exam
          ? item.exam.startTime
          : (item.assignment as any).startDate,
      };
    })
    .filter(Boolean) as ResultList[];

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <h1 className="text-base md:text-lg font-semibold text-gray-900">
          Results
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-1 sm:gap-2">
            <ResultFilters
              students={students}
              teachers={teachers}
              classes={classes}
              subjects={subjects}
            />
            <ResultSort />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
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
            <ResultsCard
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
