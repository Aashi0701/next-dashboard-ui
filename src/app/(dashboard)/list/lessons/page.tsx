import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Lesson, Prisma, Subject, Teacher } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";
import { scopeLessons } from "@/lib/rbac";
import LessonFilters from "@/components/filters/LessonFilters";
import LessonSort from "@/components/filters/LessonSort";
import LessonCard from "@/components/mobile/LessonCard";
import { BookOpen } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

type LessonList = Lesson & {
  subject: Subject;
  class: Class;
  teacher: Teacher;
};

const LessonListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { role, userId, isAdmin } = await getAuthUser();
  const params = await searchParams;
  const queryString = new URLSearchParams(params as any).toString();
  const { page, sortBy, sortOrder, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;

  /* ================= FILTER DATA ================= */
  const [subjects, teachers, classes] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  const relatedData = { subjects, teachers, classes };

  /* ================= TABLE STRUCTURE (DESKTOP) ================= */
  const columns = [
    { header: "Lesson Name", accessor: "name" },
    { header: "Subject", accessor: "subject" },
    { header: "Class", accessor: "class" },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    ...(isAdmin
      ? [
          {
            header: "Actions",
            accessor: "action",
            className: "text-center w-[120px]",
          },
        ]
      : []),
  ];

  const renderRow = (item: LessonList) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
    >
      <td className="px-2 py-1.5 md:px-3 md:py-2 truncate">{item.name}</td>
      <td className="px-2 py-1.5 md:px-3 md:py-2">{item.subject.name}</td>
      <td className="px-2 py-1.5 md:px-3 md:py-2">{item.class.name}</td>
      <td className="px-2 py-1.5 md:px-3 md:py-2 truncate hidden md:table-cell">
        {item.teacher.name} {item.teacher.surname}
      </td>

      {isAdmin && (
        <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
          <div className="flex justify-center items-center gap-2 whitespace-nowrap">
            <Tooltip content="Edit lesson">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="lesson"
                  type="update"
                  id={item.id} // ✅ REQUIRED
                  data={item}
                  relatedData={relatedData}
                  query={queryString}
                />
              </span>
            </Tooltip>

            <Tooltip content="Delete lesson">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="lesson"
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
  const query: Prisma.LessonWhereInput = {
    ...scopeLessons(role, userId),
  };

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "subjectId":
        query.subjectId = Number(value);
        break;
      case "classId": {
        const selectedClass = classes.find((c) => String(c.id) === value);

        // 🚀 If "All Classes" → DO NOT apply filter
        if (selectedClass?.name === "All Classes") {
          break;
        }

        query.classId = Number(value);
        break;
      }
      case "teacherId":
        if (isAdmin) {
          query.teacherId = value;
        }
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

  /* ================= SORT ================= */
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
        orderBy = { id: order };
        break;
    }
  }

  /* ================= DATA ================= */
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

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  const lessonFilterConfig = {
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
  };

  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <BookOpen size={14} />
            </span>
            Lessons
          </h1>

          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span> lessons
              <span className="ml-2 text-gray-400">
                • Page <span className="font-medium text-gray-700">{p}</span> of{" "}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </span>
            </p>
          )}
        </div>

        {/* ===== SEARCH + ACTIONS ===== */}
        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          {/* Search (shrinks properly on mobile) */}
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <LessonFilters
              subjects={subjects}
              teachers={teachers}
              classes={classes}
              role={role}
            />
            <LessonSort />

            {role === "admin" && (
              <FormContainer
                table="lesson"
                type="create"
                relatedData={relatedData}
              />
            )}
          </div>
        </div>
      </div>

      <AdvancedFilterBar config={lessonFilterConfig} />

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden mt-3 space-y-3">
        {data.map((item) => {
          const isTarget = params.action && params.id === String(item.id);

          return (
            <LessonCard
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
};

export default LessonListPage;
