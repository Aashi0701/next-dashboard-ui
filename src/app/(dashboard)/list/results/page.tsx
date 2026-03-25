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
import { BarChart3 } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

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
  const queryString = new URLSearchParams(params as any).toString();

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

  /* ================= FILTER CONFIG ================= */

  const resultFilterConfig = {
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
      options: classes.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    },

    subjectId: {
      label: "Subject",
      icon: "📘",
      options: subjects.map((s) => ({
        label: s.name,
        value: String(s.id),
      })),
    },

    teacherId: {
      label: "Teacher",
      icon: "👨‍🏫",
      options: teachers.map((t) => ({
        label: `${t.name} ${t.surname}`,
        value: t.id,
      })),
    },

    type: {
      label: "Type",
      icon: "📝",
      options: [
        { label: "Exam", value: "exam" },
        { label: "Assignment", value: "assignment" },
      ],
    },

    // sortBy: {
    //   label: "Sort By",
    //   icon: "↕️",
    //   options: [
    //     { label: "Title", value: "title" },
    //     { label: "Student", value: "student" },
    //     { label: "Teacher", value: "teacher" },
    //     { label: "Class", value: "class" },
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
      className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
    >
      {/* TITLE */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 max-w-[220px] truncate">
        {item.title}
      </td>

      {/* STUDENT */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 max-w-[180px] truncate">
        {item.studentName} {item.studentSurname}
      </td>

      {/* SCORE */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell">
        {item.score}
      </td>

      {/* TEACHER */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell max-w-[180px] truncate">
        {item.teacherName} {item.teacherSurname}
      </td>

      {/* CLASS */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell max-w-[140px] truncate">
        {item.className}
      </td>

      {/* DATE */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell whitespace-nowrap">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {/* ACTIONS */}
      {(role === "admin" || role === "teacher") && (
        <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
          <div className="flex justify-center gap-2">
            <Tooltip content="Edit Result">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="result"
                  type="update"
                  data={item}
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>

            <Tooltip content="Delete Result">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="result"
                  type="delete"
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>
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

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <BarChart3 size={14} />
            </span>
            Results
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span>{" "}
              results
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
        <AdvancedFilterBar config={resultFilterConfig} />
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
