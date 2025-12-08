import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";

import TeacherFilters from "@/components/filters/TeacherFilters";
import TeacherSort from "@/components/filters/TeacherSort";

type TeacherList = Teacher & {
  subjects: Subject[];
  classes: Class[];
};

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;

  const { page, sortBy, sortOrder, ...queryParams } = params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // ------------------------------
  // TABLE COLUMNS
  // ------------------------------
  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Teacher ID", accessor: "teacherId", className: "hidden md:table-cell", sortable: true },
    { header: "Subjects", accessor: "subjects", className: "hidden md:table-cell" },
    { header: "Classes", accessor: "classes", className: "hidden md:table-cell" },
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell", sortable: true },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell", sortable: true },
    ...(role === "admin"
    ? [{ header: "Actions", accessor: "action", className: "text-center" }]
    : []),
  ];

  // ------------------------------
  // ROW RENDERER
  // ------------------------------
  const renderRow = (item: TeacherList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* Info */}
      <td className="p-4">
        <div className="flex items-center gap-4">
          <Image
            src={item.img || "/noAvatar.png"}
            alt=""
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="truncate">
            <h3 className="font-semibold truncate">{item.name}</h3>
            <p className="text-xs text-gray-500 truncate">{item.email}</p>
          </div>
        </div>
      </td>

      {/* Teacher ID */}
      <td className="p-4 hidden md:table-cell truncate">
        {item.username}
      </td>

      {/* Subjects */}
      <td className="p-4 hidden md:table-cell truncate">
        {item.subjects.map((s) => s.name).join(", ")}
      </td>

      {/* Classes */}
      <td className="p-4 hidden md:table-cell truncate">
        {item.classes.map((c) => c.name).join(", ")}
      </td>

      {/* Phone */}
      <td className="p-4 hidden lg:table-cell truncate">
        {item.phone}
      </td>

      {/* Address */}
      <td className="p-4 hidden lg:table-cell truncate">
        {item.address}
      </td>

      {/* Actions */}
      <td className="p-4 text-center">
        <div className="flex justify-center gap-2">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/eye.png" alt="" width={16} height={16} />
            </button>
          </Link>

          {role === "admin" && (
            <FormContainer table="teacher" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const p = page ? parseInt(page) : 1;

  // ------------------------------
  // FILTER QUERY CONDITIONS
  // ------------------------------
  const query: Prisma.TeacherWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "search":
        query.name = { contains: value, mode: "insensitive" };
        break;

      case "classId":
        query.classes = { some: { id: Number(value) } };
        break;

      case "subjectId":
        query.subjects = { some: { id: Number(value) } };
        break;

      default:
        break;
    }
  }

  // ------------------------------
  // SORTING LOGIC
  // ------------------------------
  const sortField = sortBy || "createdAt";
  const order: "asc" | "desc" = (sortOrder as any) || "desc";

  const sortableFields: Record<string, any> = {
    teacherId: { username: order },
    phone: { phone: order },
    address: { address: order },
  };

  const orderBy = sortableFields[sortField] || { createdAt: order };

  // ------------------------------
  // FETCH SUBJECTS & CLASSES FOR FILTERS
  // ------------------------------
  const [allSubjects, allClasses] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  // ------------------------------
  // MAIN DATA FETCH
  // ------------------------------
  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        subjects: true,
        classes: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),

    prisma.teacher.count({ where: query }),
  ]);

  // ------------------------------
  // RETURN UI
  // ------------------------------
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Teachers</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <TeacherFilters subjects={allSubjects} classes={allClasses} />
            <TeacherSort />

            {role === "admin" && (
              <FormContainer table="teacher" type="create" />
            )}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />

      <Pagination page={p} count={count} />
    </div>
  );
};

export default TeacherListPage;
