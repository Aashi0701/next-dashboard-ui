import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { Library } from "lucide-react";
import SubjectFilters from "@/components/filters/SubjectFilters";
import SubjectSort from "@/components/filters/SubjectSort";
import SubjectCard from "@/components/mobile/SubjectCard";
import Tooltip from "@/components/ui/Tooltip";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

/* ================= TYPE (FIXED) ================= */
type SubjectList = Subject & {
  teachers: {
    id: string;
    name: string;
    surname: string;
  }[];
};

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  /* ================= AUTH ================= */
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const params = await searchParams;
  const queryString = new URLSearchParams(params as any).toString();

  const { page, sortBy, sortOrder, studentId, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;

  /* ================= PARENT STUDENT ================= */
  let parentStudent: { classId: number } | null = null;

  if (role === "parent") {
    parentStudent = await prisma.student.findFirst({
      where: studentId
        ? { id: studentId, parentId: userId! }
        : { parentId: userId! },
      select: { classId: true },
    });
  }

  /* ================= FILTER DATA ================= */
  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  /* ================= TABLE STRUCTURE ================= */
  const columns = [
    { header: "Subject Name", accessor: "name" },
    {
      header: "Teachers",
      accessor: "teachers",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: SubjectList) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
    >
      {/* SUBJECT NAME */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 truncate">{item.name}</td>

      {/* TEACHERS */}
      <td className="px-2 py-1.5 md:px-3 md:py-2 truncate hidden md:table-cell">
        {item.teachers.map((t) => t.name).join(", ")}
      </td>

      {/* ACTIONS */}
      {role === "admin" && (
        <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
          <div className="flex justify-center items-center gap-2">
            {/* ✅ EDIT (FIXED ICON ISSUE) */}
            <Tooltip content="Edit Subject">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="subject"
                  type="update"
                  data={item}
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>

            {/* DELETE */}
            <Tooltip content="Delete Subject">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="subject"
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
  const query: Prisma.SubjectWhereInput = {};

  /* ---- Parent restriction ---- */
  if (role === "parent" && parentStudent?.classId) {
    query.lessons = {
      some: {
        classId: parentStudent.classId,
      },
    };
  }

  /* ---- Filters ---- */
  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "search":
        query.name = { contains: value, mode: "insensitive" };
        break;

      case "teacherId":
        query.teachers = { some: { id: value } };
        break;
    }
  }

  /* ================= SORT ================= */
  let orderBy: Prisma.SubjectOrderByWithRelationInput = {};
  const order = sortOrder === "desc" ? "desc" : "asc";

  if (sortBy) {
    switch (sortBy) {
      case "name":
        orderBy = { name: order };
        break;
      case "date":
        orderBy = { id: order };
        break;
    }
  }

  /* ================= DATA ================= */
  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: { teachers: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),

    prisma.subject.count({
      where: query,
    }),
  ]);

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = data.length === 0;

  const subjectFilterConfig = {
    teacherId: {
      label: "Teacher",
      icon: "👨‍🏫",
      options: teachers.map((t) => ({
        label: `${t.name} ${t.surname}`,
        value: t.id,
      })),
    },
  };

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <Library size={14} />
            </span>
            Subjects
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span> subjects
              <span className="ml-2 text-gray-400">
                • Page <span className="font-medium text-gray-700">{p}</span> of{" "}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <SubjectFilters teachers={teachers} />
            <SubjectSort />

            {role === "admin" && (
              <FormContainer table="subject" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <AdvancedFilterBar config={subjectFilterConfig} />
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE ===== */}
      <div className="md:hidden mt-3 space-y-3">
        {data.map((item) => {
          const isTarget = params.action && params.id === String(item.id);

          return (
            <SubjectCard
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

export default SubjectListPage;
