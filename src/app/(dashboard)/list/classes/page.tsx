import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher, AcademicYear } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import ClassFilters from "@/components/filters/ClassFilters";
import ClassSort from "@/components/filters/ClassSort";
import ClassCard from "@/components/mobile/ClassCard";

/* ================= TYPES ================= */
type ClassList = Class & {
  supervisor: Teacher | null;
  academicYear: AcademicYear;
};

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...queryParams } = params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* ================= COLUMNS ================= */
  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Capacity", accessor: "capacity" },
    { header: "Academic Year", accessor: "academicYear" },
    { header: "Supervisor", accessor: "supervisor" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  /* ================= ROW RENDER ================= */
  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 truncate">{item.name}</td>

      <td className="p-4">{item.capacity}</td>

      <td className="p-4">
        {item.academicYear?.label ?? "—"}
      </td>

      <td className="p-4 truncate">
        {item.supervisor
          ? `${item.supervisor.name} ${item.supervisor.surname}`
          : "No Supervisor"}
      </td>

      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= PAGINATION ================= */
  const p = page ? parseInt(page) : 1;

  /* ================= FILTER QUERY ================= */
  const query: Prisma.ClassWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "supervisorId":
        query.supervisorId = value;
        break;

      case "search":
        query.name = { contains: value, mode: "insensitive" };
        break;
    }
  }

  /* ================= SORT ================= */
  let orderBy: Prisma.ClassOrderByWithRelationInput = {};
  const order = sortOrder === "desc" ? "desc" : "asc";

  if (sortBy) {
    switch (sortBy) {
      case "name":
        orderBy = { name: order };
        break;
      case "capacity":
        orderBy = { capacity: order };
        break;
      case "academicYear":
        orderBy = { academicYear: { label: order } };
        break;
    }
  }

  /* ================= DATA ================= */
  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
        academicYear: true, // ✅ REQUIRED
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  const supervisors = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
        <h1 className="text-base md:text-lg font-semibold">Classes</h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />
          <ClassFilters supervisors={supervisors} />
          <ClassSort />
          {role === "admin" && <FormContainer table="class" type="create" />}
        </div>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden mt-3 space-y-3">
        {data.map((item) => (
          <ClassCard key={item.id} item={item} role={role} />
        ))}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default ClassListPage;