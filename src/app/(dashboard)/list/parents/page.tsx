import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

import ParentFilters from "@/components/filters/ParentFilters";
import ParentSort from "@/components/filters/ParentSort";
import ParentCard from "@/components/mobile/ParentCard";

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

  /* ================= TABLE STRUCTURE (DESKTOP) ================= */
  const columns = [
    { header: "Info", accessor: "info" },
    {
      header: "Student Names",
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
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: ParentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Info */}
      <td className="p-4">
        <div className="flex flex-col truncate">
          <h3 className="font-semibold truncate">{item.name}</h3>
          <p className="text-xs text-gray-500 truncate">
            {item.email}
          </p>
        </div>
      </td>

      {/* Students */}
      <td className="p-4 hidden md:table-cell truncate">
        {item.students.map((s) => s.name).join(", ")}
      </td>

      {/* Phone */}
      <td className="p-4 hidden md:table-cell truncate">
        {item.phone}
      </td>

      {/* Address */}
      <td className="p-4 hidden lg:table-cell truncate">
        {item.address}
      </td>

      {/* Actions */}
      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer table="parent" type="update" data={item} />
            <FormContainer table="parent" type="delete" id={item.id} />
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
        query.name = { contains: value, mode: "insensitive" };
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
      address: { address: order },
    };

  const orderBy =
    (sortBy && sortableFields[sortBy]) || { createdAt: order };

  /* ================= FILTER DATA ================= */
  const allStudents = await prisma.student.findMany({
    orderBy: { name: "asc" },
  });

  /* ================= DATA ================= */
  const [data, count] = (await prisma.$transaction([
    prisma.parent.findMany({
      where: query,
      include: { students: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ])) as [ParentList[], number];

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <h1 className="text-base md:text-lg font-semibold text-gray-900">
          Parents
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-1 sm:gap-2">
            <ParentFilters students={allStudents} />
            <ParentSort />
            {role === "admin" && (
              <FormContainer table="parent" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE CARDS ===== */}
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
