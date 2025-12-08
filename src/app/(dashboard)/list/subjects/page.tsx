import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import SubjectFilters from "@/components/filters/SubjectFilters";
import SubjectSort from "@/components/filters/SubjectSort";

type SubjectList = Subject & { teachers: Teacher[] };

export default async function SubjectListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  // Read URL parameters
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...queryParams } = params;

  const p = page ? parseInt(page) : 1;

  // Auth check
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Table columns
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
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Subject Name */}
      <td className="p-4 truncate font-medium">
        {item.name}
      </td>

      {/* Teachers */}
      <td className="p-4 truncate hidden md:table-cell">
        {item.teachers.map((t) => t.name).join(", ")}
      </td>

      {/* Actions */}
      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer table="subject" type="update" data={item} />
            <FormContainer table="subject" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // Load teachers for filter dropdown
  const allTeachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  // Build Prisma WHERE query
  const query: Prisma.SubjectWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "search":
        query.name = { contains: value, mode: "insensitive" };
        break;

      case "teacherId":
        query.teachers = { some: { id: value } };
        break;

      default:
        break;
    }
  }

  // Sorting Logic
  let orderByPrisma: any = {};

  if (sortBy) {
    const order = sortOrder === "desc" ? "desc" : "asc";

    switch (sortBy) {
      case "name":
        orderByPrisma = { name: order };
        break;

      case "teacher":
        // Sort by number of teachers (closest possible alternative)
        orderByPrisma = { teachers: { _count: order } };
        break;

      case "date":
        orderByPrisma = { createdAt: order };
        break;
    }
  }

  // Fetch paginated subjects
  const [data, count] = await prisma.$transaction([
    prisma.subject.findMany({
      where: query,
      include: { teachers: true },
      orderBy: orderByPrisma,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.subject.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Subjects</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <SubjectFilters teachers={allTeachers} />
            <SubjectSort />

            {role === "admin" && (
              <FormContainer table="subject" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}
