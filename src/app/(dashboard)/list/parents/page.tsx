import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student, Class } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import ParentFilters from "@/components/filters/ParentFilters";
import ParentSort from "@/components/filters/ParentSort";
import ParentCard from "@/components/mobile/ParentCard";
import Tooltip from "@/components/ui/Tooltip";
import { UsersRound } from "lucide-react";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

type ParentList = Parent & {
  students: (Student & {
    class: Class;
  })[];
};

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;
  const queryString = new URLSearchParams(params as any).toString();

  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* ================= TABLE ================= */

  const columns = [
    { header: "Parent", accessor: "parent" },
    {
      header: "Students",
      accessor: "students",
      className: "hidden md:table-cell",
    },
    {
      header: "Class", // ✅ ADD THIS
      accessor: "class",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden md:table-cell",
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
    },
    {
      header: "Created",
      accessor: "createdAt",
      className: "hidden lg:table-cell",
    },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
    >
      <td className="px-2 py-1.5 md:px-3 md:py-2">
        <div className="flex flex-col max-w-[280px]">
          <span className="font-semibold truncate">
            {item.name} {item.surname}
          </span>
          {item.email && (
            <span className="text-xs text-gray-400 truncate">{item.email}</span>
          )}
        </div>
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell truncate max-w-[180px]">
        {item.students.length > 0
          ? item.students.map((s) => s.name).join(", ")
          : "—"}
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell truncate max-w-[200px]">
        {item.students.length > 0
          ? item.students.map((s) => s.class?.name).join(", ")
          : "—"}
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell truncate">
        {item.phone}
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden lg:table-cell">
        <div className="max-w-[200px] truncate">
          <Tooltip content={item.address}>
            <span className="block truncate cursor-help">{item.address}</span>
          </Tooltip>
        </div>
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2 hidden lg:table-cell">
        {new Date(item.createdAt).toLocaleDateString()}
      </td>

      {role === "admin" && (
        <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
          <div className="flex justify-center gap-2">
            <Tooltip content="Edit Parent">
              <span>
                <FormContainer
                  table="parent"
                  type="update"
                  data={item}
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>

            <Tooltip content="Delete Parent">
              <span>
                <FormContainer
                  table="parent"
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

  const query: Prisma.ParentWhereInput = {};

  /* 🔐 ROLE-BASED FILTER */

  let teacherRecord = null;

  if (role === "teacher") {
    teacherRecord = await prisma.teacher.findUnique({
      where: { userId: userId! },
    });

    if (!teacherRecord) {
      throw new Error("Teacher not mapped to system");
    }

    // ✅ STRICT CLASS-BASED FILTER (BEST PRACTICE)
    query.students = {
      some: {
        class: {
          supervisorId: teacherRecord.id,
        },
      },
    };
  }

  /* 🔍 QUERY PARAMS */

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "search":
        query.OR = [
          { name: { contains: value, mode: "insensitive" } },
          { surname: { contains: value, mode: "insensitive" } },
          { username: { contains: value, mode: "insensitive" } },
          { phone: { contains: value, mode: "insensitive" } },
        ];
        break;

      case "studentId":
        query.students = {
          some: {
            id: value,
            ...(role === "teacher"
              ? {
                  class: {
                    supervisorId: teacherRecord?.id,
                  },
                }
              : {}),
          },
        };
        break;
    }
  }

  /* ================= SORT ================= */

  const order: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

  const sortableFields: Record<string, Prisma.ParentOrderByWithRelationInput> =
    {
      name: { name: order },
      phone: { phone: order },
      createdAt: { createdAt: order },
    };

  const orderBy = (sortBy && sortableFields[sortBy]) || {
    createdAt: "desc",
  };

  /* ================= FILTER DATA ================= */

  const allStudents = await prisma.student.findMany({
    orderBy: { name: "asc" },
  });

  const parentFilterConfig = {
    studentId: {
      label: "Student",
      icon: "🎓",
      options: allStudents.map((s) => ({
        label: s.name,
        value: s.id,
      })),
    },
  };

  /* ================= DATA ================= */

  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: {
        students: {
          include: {
            class: true, // ✅ IMPORTANT
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  /* ================= PAGINATION ================= */

  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = data.length === 0;

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <UsersRound size={14} />
            </span>
            Parents
          </h1>

          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing {start}–{end} of {count} parents • Page {p} of{" "}
              {totalPages}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <TableSearch />

          <div className="flex gap-2">
            <ParentFilters students={allStudents} />
            <ParentSort />
            {role === "admin" && <FormContainer table="parent" type="create" />}
          </div>
        </div>
      </div>

      <div className="hidden md:block mt-4">
        <AdvancedFilterBar config={parentFilterConfig} />
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="md:hidden mt-4 space-y-3">
        {data.map((item) => (
          <ParentCard key={item.id} parent={item} role={role} />
        ))}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default ParentListPage;
