import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import { getAuthUser } from "@/lib/auth";
import Tooltip from "@/components/ui/Tooltip";
import ClassFilters from "@/components/filters/ClassFilters";
import ClassSort from "@/components/filters/ClassSort";
import ClassCard from "@/components/mobile/ClassCard";
import { School } from "lucide-react";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

type ClassList = Class & { supervisor: Teacher | null };

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const ClassListPage = async ({ searchParams }: Props) => {
  const params = await searchParams;

  /* ================= PARAMS ================= */
  const { page, sortBy, sortOrder, action, id, ...queryParams } = params;

  const p = page ? parseInt(page) : 1;
  const order = sortOrder === "desc" ? "desc" : "asc";

  const { role, userId, isAdmin, isTeacher, isParent, isStudent } =
    await getAuthUser();

  /* ================= SAFE QUERY STRING ================= */
  const queryString = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (typeof value === "string") acc[key] = value;
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).toString();

  /* ================= BASE QUERY ================= */
  let where: Prisma.ClassWhereInput = {};

  /* ================= ROLE FILTER ================= */

  const roleFilters: Prisma.ClassWhereInput[] = [];

  let teacherRecord: Teacher | null = null;

  if (isTeacher && userId) {
    teacherRecord = await prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacherRecord) {
      return (
        <div className="p-6 text-sm text-red-500">
          Teacher not mapped to system.
        </div>
      );
    }

    roleFilters.push({
      OR: [
        { supervisorId: teacherRecord.id }, // ✅ FIXED
        {
          lessons: {
            some: {
              teacherId: teacherRecord.id, // ✅ FIXED
            },
          },
        },
      ],
    });
  }

  if (isStudent && userId) {
    roleFilters.push({
      students: {
        some: { id: userId },
      },
    });
  }

  if (isParent && userId) {
    roleFilters.push({
      students: {
        some: { parentId: userId },
      },
    });
  }

  /* ================= URL FILTERS ================= */
  const urlFilters: Prisma.ClassWhereInput[] = [];

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "supervisorId":
        if (isAdmin && value !== "ALL") {
          urlFilters.push({ supervisorId: value });
        }
        break;

      case "classId":
        if (value !== "ALL") {
          urlFilters.push({ id: Number(value) });
        }
        break;

      case "search":
        urlFilters.push({
          name: { contains: value, mode: "insensitive" },
        });
        break;
    }
  }

  /* ================= FINAL WHERE ================= */
  if (roleFilters.length || urlFilters.length) {
    where = {
      AND: [...roleFilters, ...urlFilters],
    };
  }

  /* ================= SORT ================= */
  let orderBy: Prisma.ClassOrderByWithRelationInput = {
    createdAt: "desc",
  };

  if (sortBy) {
    switch (sortBy) {
      case "name":
        orderBy = { name: order };
        break;
      case "capacity":
        orderBy = { capacity: order };
        break;
      case "date":
        orderBy = { createdAt: order };
        break;
    }
  }

  /* ================= DATA FETCH ================= */
  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where,
      include: { supervisor: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where }),
  ]);

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);

  /* ================= SUPERVISORS ================= */
  const supervisors = isAdmin
    ? await prisma.teacher.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, surname: true },
      })
    : [];

  /* ================= CLASSES ================= */
  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  /* ================= FILTER CONFIG ================= */
  const classFilterConfig = {
    supervisorId: {
      label: "Supervisor",
      icon: "👨‍💼",
      options: [
        { label: "All Supervisors", value: "ALL" }, // ✅ ADD THIS
        ...supervisors.map((t) => ({
          label: `${t.name} ${t.surname}`,
          value: t.id,
        })),
      ],
    },
    classId: {
      label: "Class",
      icon: "🏫",
      options: [
        { label: "All Classes", value: "ALL" }, // ✅ THIS FIXES YOUR ISSUE
        ...classes.map((c) => ({
          label: c.name,
          value: String(c.id),
        })),
      ],
    },
  };

  /* ================= TABLE CONFIG ================= */
  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Capacity", accessor: "capacity" },
    { header: "Supervisor", accessor: "supervisor" },
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

  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
    >
      <td className="px-2 py-1.5 md:px-3 md:py-2">{item.name}</td>

      <td className="px-2 py-1.5 md:px-3 md:py-2">{item.capacity}</td>

      <td className="px-2 py-1.5 md:px-3 md:py-2">
        {item.supervisor
          ? `${item.supervisor.name} ${item.supervisor.surname}`
          : "No Supervisor"}
      </td>

      {isAdmin && (
        <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <Tooltip content="Edit Class">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="class"
                  type="update"
                  data={item}
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>

            <Tooltip content="Delete Class">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="class"
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

  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 lg:p-6">
      {/* ===== HEADER ===== */}
      <div className="flex items-start justify-between gap-3 w-full flex-wrap">
        {/* LEFT */}
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex items-center justify-center w-7 h-7 rounded-md bg-purple-100 text-purple-600">
              <School size={16} />
            </span>
            Classes
          </h1>

          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span> classes
              <span className="ml-2 text-gray-400">
                • Page <span className="font-medium text-gray-700">{p}</span> of{" "}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </span>
            </p>
          )}
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-[180px] sm:w-[220px]">
            <TableSearch />
          </div>

          {isAdmin && (
            <ClassFilters supervisors={supervisors} classes={classes} />
          )}
          <ClassSort />

          {isAdmin && (
            <FormContainer table="class" type="create" query={queryString} />
          )}
        </div>
      </div>

      {/* ===== ACTIVE FILTERS ===== */}
      <div className="mt-3">
        <AdvancedFilterBar config={classFilterConfig} />
      </div>

      {/* ===== CONTENT ===== */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-sm">No classes found</p>
        </div>
      ) : (
        <>
          {/* DESKTOP */}
          <div className="hidden md:block mt-4">
            <Table columns={columns} renderRow={renderRow} data={data} />
          </div>

          {/* MOBILE */}
          <div className="md:hidden mt-4 space-y-3">
            {data.map((item) => {
              const isTarget = action && id === String(item.id);

              return (
                <ClassCard
                  key={item.id}
                  item={item}
                  role={role}
                  action={isTarget ? (action as "edit" | "delete") : undefined}
                />
              );
            })}
          </div>

          {/* PAGINATION */}
          <div className="mt-4">
            <Pagination page={p} count={count} />
          </div>
        </>
      )}
    </div>
  );
};

export default ClassListPage;
