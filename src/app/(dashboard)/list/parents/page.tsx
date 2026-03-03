import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import ParentFilters from "@/components/filters/ParentFilters";
import ParentSort from "@/components/filters/ParentSort";
import ParentCard from "@/components/mobile/ParentCard";
import Tooltip from "@/components/ui/Tooltip";

type ParentList = Parent & {
  students: Student[];
};

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* ================= TABLE COLUMNS (ADMIN READY) ================= */
  const columns = [
    { header: "Parent", accessor: "parent" },
    {
      header: "Students",
      accessor: "students",
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

  /* ================= ROW RENDER ================= */
  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Parent Info */}
      <td className="p-4">
        <div className="flex flex-col max-w-[220px]">
          <span className="font-semibold truncate">
            {item.name} {item.surname}
          </span>
          {/* <span className="text-xs text-gray-500 truncate">
            @{item.username}
          </span> */}
          {item.email && (
            <span className="text-xs text-gray-400 truncate">{item.email}</span>
          )}
        </div>
      </td>

      {/* Students */}
      <td className="p-4 hidden md:table-cell truncate max-w-[200px]">
        {item.students.length > 0
          ? item.students.map((s) => s.name).join(", ")
          : "—"}
      </td>

      {/* Phone */}
      <td className="p-4 hidden md:table-cell truncate">{item.phone}</td>

      {/* Address */}
      <td className="p-4 hidden lg:table-cell">
        <div className="max-w-[200px] truncate">
          <Tooltip content={item.address}>
            <span
              tabIndex={0}
              className="block truncate cursor-help focus:outline-none focus:ring-2 focus:ring-purple-400 rounded"
            >
              {item.address}
            </span>
          </Tooltip>
        </div>
      </td>

      {/* Created At */}
      <td className="p-4 hidden lg:table-cell">
        {new Date(item.createdAt).toLocaleDateString()}
      </td>

      {/* Actions */}
      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <Tooltip content="Edit Parent">
              <span className="inline-flex">
                <FormContainer
                  table="parent"
                  type="update"
                  data={item}
                  id={item.id}
                />
              </span>
            </Tooltip>

            <Tooltip content="Delete Parent">
              <span className="inline-flex">
                <FormContainer table="parent" type="delete" id={item.id} />
              </span>
            </Tooltip>
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= QUERY ================= */
  const query: Prisma.ParentWhereInput = {};

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
        query.students = { some: { id: value } };
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

  /* ================= DATA ================= */
  const [data, count] = await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: { students: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between gap-3 w-full">
        <h1 className="text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
          Parents
        </h1>

        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ParentFilters students={allStudents} />
            <ParentSort />
            {role === "admin" && <FormContainer table="parent" type="create" />}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE VIEW ===== */}
      <div className="md:hidden mt-4 space-y-3">
        {data.map((item) => (
          <ParentCard key={item.id} parent={item} role={role} />
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ParentListPage;
