import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma, Subject, Teacher } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import SubjectFilters from "@/components/filters/SubjectFilters";
import SubjectSort from "@/components/filters/SubjectSort";
import SubjectCard from "@/components/mobile/SubjectCard";

type SubjectList = Subject & { teachers: Teacher[] };

const SubjectListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const params = await searchParams;
  const { page, sortBy, sortOrder, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;

  /* ================= FILTER DATA ================= */
  const teachers = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  /* ================= TABLE STRUCTURE (DESKTOP) ================= */
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
      <td className="p-4 font-medium truncate">{item.name}</td>

      <td className="p-4 truncate hidden md:table-cell">
        {item.teachers.map((t) => t.name).join(", ")}
      </td>

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

  /* ================= QUERY ================= */
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
    prisma.subject.count({ where: query }),
  ]);

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        {/* ===== TITLE ===== */}
        <h1 className="text-base md:text-lg font-semibold text-gray-900">
          Subjects
        </h1>

        {/* ===== SEARCH + ACTIONS ===== */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-1 sm:gap-2">
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
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE CARDS ===== */}
      <div className="md:hidden mt-4 space-y-4">
        {data.map((item) => (
          <SubjectCard key={item.id} item={item} role={role} />
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default SubjectListPage;
