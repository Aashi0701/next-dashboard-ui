import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import ExamFilters from "@/components/filters/ExamFilters";
import ExamSort from "@/components/filters/ExamSort";
import ExamCard from "@/components/mobile/ExamCard";
import { ClipboardCheck } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

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
  const p = page ? parseInt(page) : 1;
  const queryString = new URLSearchParams(params as any).toString();

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  /* ================= FILTER DATA ================= */
  const [subjects, classes, teachers] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
  ]);

  /* ================= FILTER CONFIG ================= */
  const examFilterConfig = {
    subjectId: {
      label: "Subject",
      icon: "📘",
      options: subjects.map((s) => ({
        label: s.name,
        value: String(s.id),
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

    teacherId: {
      label: "Teacher",
      icon: "👨‍🏫",
      options: teachers.map((t) => ({
        label: `${t.name} ${t.surname}`,
        value: t.id,
      })),
    },

    sortBy: {
      label: "Sort By",
      icon: "↕️",
      options: [
        { label: "Title", value: "title" },
        { label: "Subject", value: "subject" },
        { label: "Class", value: "class" },
        { label: "Teacher", value: "teacher" },
        { label: "Date", value: "date" },
      ],
    },

    sortOrder: {
      label: "Order",
      icon: "🔽",
      options: [
        { label: "Ascending", value: "asc" },
        { label: "Descending", value: "desc" },
      ],
    },
  };

  /* ================= TABLE STRUCTURE (DESKTOP) ================= */
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell",
    },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: ExamList) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
    >
      {/* TITLE */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 font-medium truncate">
        {item.title}
      </td>
      <td className="px-2 py-1.5 md:px-3 md:py-2 truncate">
        {item.lesson.subject.name}
      </td>
      <td className="px-2 py-1.5 md:px-3 md:py-2 truncate">
        {item.lesson.class.name}
      </td>
      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell truncate">
        {item.lesson.teacher.name} {item.lesson.teacher.surname}
      </td>
      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell truncate">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {(role === "admin" || role === "teacher") && (
        <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
          <div className="flex justify-center gap-2">
            <Tooltip content="Edit Exam">
              <span className="inline-flex">
                <FormContainer
                  table="exam"
                  type="update"
                  data={item}
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>
            <Tooltip content="Delete Exam">
              <span className="inline-flex">
                <FormContainer
                  table="exam"
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
  let lessonWhere: Prisma.LessonWhereInput = {};

  /* ================= ROLE-BASED FILTER ================= */

  let teacherRecord: Teacher | null = null;

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

    lessonWhere.teacherId = teacherRecord.id; // ✅ FIX
  }

  if (role === "student") {
    lessonWhere.class = {
      students: { some: { id: currentUserId! } },
    };
  }

  if (role === "parent") {
    lessonWhere.class = {
      students: { some: { parentId: currentUserId! } },
    };
  }

  /* ================= FILTER PARAMS ================= */

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "subjectId":
        lessonWhere.subjectId = Number(value);
        break;

      case "classId":
        lessonWhere.classId = Number(value);
        break;

      case "teacherId":
        if (role !== "teacher") {
          lessonWhere.teacherId = value;
        }
        break;

      case "search":
        lessonWhere.subject = {
          name: { contains: value, mode: "insensitive" },
        };
        break;
    }
  }

  /* ================= FINAL QUERY ================= */
  const query: Prisma.ExamWhereInput = {
    lesson: lessonWhere,
  };

  /* ================= DATE FILTER ================= */

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    if (key === "dateFrom") {
      query.startTime = { gte: new Date(value) };
    }

    if (key === "dateTo") {
      query.startTime = {
        ...((query.startTime as any)?.gte
          ? { gte: (query.startTime as any).gte }
          : {}),
        lte: new Date(value),
      };
    }

    if (key === "search") {
      query.OR = [
        {
          title: {
            contains: value,
            mode: "insensitive",
          },
        },
        {
          lesson: {
            subject: {
              name: {
                contains: value,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }
  }

  /* ================= SORT ================= */
  const order: "asc" | "desc" = sortOrder === "desc" ? "desc" : "asc";
  let orderBy: Prisma.ExamOrderByWithRelationInput = { startTime: order };

  switch (sortBy) {
    case "title":
      orderBy = { title: order };
      break;
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

  /* ================= DATA ================= */
  const [data, count] = (await prisma.$transaction([
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
  ])) as [ExamList[], number];

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <ClipboardCheck size={14} />
            </span>
            Exams
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span> exams
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
            <ExamFilters
              subjects={subjects}
              classes={classes}
              teachers={teachers}
            />
            <ExamSort />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <AdvancedFilterBar config={examFilterConfig} />
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden mt-4 space-y-3">
        {data.map((item) => {
          const isTarget = params.action && params.id === String(item.id);

          return (
            <ExamCard
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

      {/* ===== PAGINATION ===== */}
      <Pagination page={p} count={count} />
    </div>
  );
}
