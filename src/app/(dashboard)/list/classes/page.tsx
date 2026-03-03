import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import Tooltip from "@/components/ui/Tooltip";
import ClassFilters from "@/components/filters/ClassFilters";
import ClassSort from "@/components/filters/ClassSort";
import ClassCard from "@/components/mobile/ClassCard";

type ClassList = Class & { supervisor: Teacher | null };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const {
    page,
    sortBy,
    sortOrder,
    action, // ✅ read action
    id, // ✅ read id
    ...queryParams
  } = params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* ================= COLUMNS ================= */
  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Capacity", accessor: "capacity" },
    { header: "Supervisor", accessor: "supervisor" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 truncate">{item.name}</td>
      <td className="p-4">{item.capacity}</td>
      <td className="p-4 truncate">
        {item.supervisor
          ? `${item.supervisor.name} ${item.supervisor.surname}`
          : "No Supervisor"}
      </td>

      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <Tooltip content="Edit Class">
              <span className="inline-flex">
                <FormContainer
                  table="class"
                  type="update"
                  data={item}
                  id={item.id}
                />
              </span>
            </Tooltip>

            <Tooltip content="Delete Class">
              <span className="inline-flex">
                <FormContainer table="class" type="delete" id={item.id} />
              </span>
            </Tooltip>
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

  let orderBy: any = {};
  const order = sortOrder === "desc" ? "desc" : "asc";

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

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: { supervisor: true },
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
      <div className="flex items-center justify-between gap-3 w-full">
        {/* Title */}
        <h1 className="text-base md:text-lg font-semibold whitespace-nowrap">
          Classes
        </h1>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ClassFilters supervisors={supervisors} />
            <ClassSort />
            {role === "admin" && <FormContainer table="class" type="create" />}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden mt-3 space-y-3">
        {data.map((item) => {
          const isTarget = params.action && params.id === String(item.id);

          return (
            <ClassCard
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
};

export default ClassListPage;
