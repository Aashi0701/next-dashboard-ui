// app/(dashboard)/list/results/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

import ResultFilters from "@/components/filters/ResultFilters";
import ResultSort from "@/components/filters/ResultSort";

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

function mergeSafe<T extends object>(base: T | null | undefined, extend: Partial<T>): T {
  return {
    ...(typeof base === "object" && base !== null ? base : {}),
    ...extend,
  } as T;
}

/** Helper: set lesson-level nested filter using `is` wrapper */
function setLessonFilter(target: any, field: string, value: any) {
  target.lesson = mergeSafe(target.lesson, {
    is: mergeSafe(target.lesson?.is, {
      [field]: value,
    }),
  });
}

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

  // Load dropdowns used by Filter component
  const [students, teachers, classes, subjects] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Student", accessor: "student" },
    { header: "Score", accessor: "score", className: "hidden md:table-cell" },
    { header: "Teacher", accessor: "teacher", className: "hidden md:table-cell" },
    { header: "Class", accessor: "class", className: "hidden md:table-cell" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "admin" || role === "teacher" ? [{ header: "Actions", accessor: "action" }] : []),
  ];

  const renderRow = (item: ResultList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight">
      <td className="p-4">{item.title}</td>
      <td>{item.studentName + " " + item.studentSurname}</td>
      <td className="hidden md:table-cell">{item.score}</td>
      <td className="hidden md:table-cell">{item.teacherName + " " + item.teacherSurname}</td>
      <td className="hidden md:table-cell">{item.className}</td>
      <td className="hidden md:table-cell">{new Intl.DateTimeFormat("en-US").format(item.startTime)}</td>
      <td>
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="result" type="update" data={item} />
              <FormContainer table="result" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Build Result where
  const query: Prisma.ResultWhereInput = {};

  const examCond: Prisma.ExamWhereInput = {};
  const assignmentCond: Prisma.AssignmentWhereInput = {};

  // Apply filters
  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;
    switch (key) {
      case "studentId":
        // studentId in your schema is String
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
        // restrict to presence of relation
        if (value === "exam") query.exam = { isNot: null };
        if (value === "assignment") query.assignment = { isNot: null };
        break;

      case "search":
        // search exams, assignments and student name
        query.OR = [
          { exam: { title: { contains: value, mode: "insensitive" } } },
          { assignment: { title: { contains: value, mode: "insensitive" } } },
          { student: { name: { contains: value, mode: "insensitive" } } },
          { student: { surname: { contains: value, mode: "insensitive" } } },
        ];
        break;

      default:
        break;
    }
  }

  if (Object.keys(examCond).length > 0) query.exam = mergeSafe(query.exam, examCond);
  if (Object.keys(assignmentCond).length > 0) query.assignment = mergeSafe(query.assignment, assignmentCond);

  // role constraints
  if (role === "teacher") {
    // teacher sees results belonging to their lessons only
    setLessonFilter(examCond, "teacherId", currentUserId!);
    setLessonFilter(assignmentCond, "teacherId", currentUserId!);
    query.OR = [
      { exam: mergeSafe(query.exam, examCond) },
      { assignment: mergeSafe(query.assignment, assignmentCond) },
    ];
  } else if (role === "student") {
    query.studentId = currentUserId!;
  } else if (role === "parent") {
    query.student = { parentId: currentUserId! };
  }

  // Sorting
  const order = sortOrder === "desc" ? "desc" : "asc";
  let orderBy: any = {};

  if (sortBy) {
    switch (sortBy) {
      case "title":
        // Order by exam.title first then assignment.title as fallback
        orderBy = [{ exam: { title: order } }, { assignment: { title: order } }];
        break;
      case "student":
        orderBy = { student: { name: order } };
        break;
      case "teacher":
        orderBy = [{ exam: { lesson: { teacher: { name: order } } } }, { assignment: { lesson: { teacher: { name: order } } } }];
        break;
      case "class":
        orderBy = [{ exam: { lesson: { class: { name: order } } } }, { assignment: { lesson: { class: { name: order } } } }];
        break;
      default:
        orderBy = { id: "desc" };
    }
  }

  // Fetch
  const [rows, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: true,
        exam: { include: { lesson: { include: { teacher: true, class: true, subject: true } } } },
        assignment: { include: { lesson: { include: { teacher: true, class: true, subject: true } } } },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.result.count({ where: query }),
  ]);

  const data = rows
    .map((item) => {
      const src = item.exam || item.assignment;
      if (!src) return null;

      // exam likely has startTime, assignment assumed to have startDate (fallback)
      const isExam = Boolean(item.exam);
      const startTime = isExam ? (item.exam!.startTime as Date) : ((item.assignment as any)!.startDate as Date);

      return {
        id: item.id,
        title: src.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: src.lesson.teacher.name,
        teacherSurname: src.lesson.teacher.surname,
        score: item.score,
        className: src.lesson.class.name,
        startTime,
      } as ResultList;
    })
    .filter(Boolean) as ResultList[];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <ResultFilters students={students} teachers={teachers} classes={classes} subjects={subjects} />
            <ResultSort />
            {(role === "admin" || role === "teacher") && <FormContainer table="result" type="create" />}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
}
