import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

import ClassFilters from "@/components/filters/ClassFilters";
import ClassSort from "@/components/filters/ClassSort";

type ClassList = Class & { supervisor: Teacher };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...queryParams } = params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    { header: "Class Name", accessor: "name" },
    { header: "Capacity", accessor: "capacity" },
    { header: "Grade", accessor: "grade" },
    { header: "Supervisor", accessor: "supervisor" },
    ...(role === "admin" ? [{ header: "Actions", accessor: "action", className: "text-center" }] : []),
  ];

  const renderRow = (item: ClassList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Class Name */}
      <td className="p-4 truncate">{item.name}</td>

      {/* Capacity */}
      <td className="p-4">{item.capacity}</td>

      {/* Grade */}
      <td className="p-4">{item.name[0]}</td>

      {/* Supervisor */}
      <td className="p-4 truncate">
        {item.supervisor
          ? `${item.supervisor.name} ${item.supervisor.surname}`
          : "No Supervisor"}
      </td>

      {/* Actions */}
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

  const p = page ? parseInt(page) : 1;

  // BUILD QUERY
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

  // SORT LOGIC
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
      case "grade":
        orderBy = { name: order }; // grade = first letter
        break;
      case "date":
        orderBy = { createdAt: order };
        break;
    }
  }

  // FETCH
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

  // LOAD SUPERVISORS FOR FILTERS
  const supervisors = await prisma.teacher.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Classes</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <ClassFilters supervisors={supervisors} />
            <ClassSort />
            {role === "admin" && <FormContainer table="class" type="create" />}
          </div>
        </div>
      </div>

      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default ClassListPage;
