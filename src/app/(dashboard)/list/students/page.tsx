import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import StudentFilters from "@/components/filters/StudentFilters";
import StudentSort from "@/components/filters/StudentSort";

type StudentList = Student & {
  class: Class;
  _count: {
    studentFees: number;
  };
};

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { page, sort, ...queryParams } = params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // ----------------------
  // TABLE COLUMN STRUCTURE
  // ----------------------
  const columns = [
    { header: "Info", accessor: "info" },
    { header: "Student ID", accessor: "studentId", className: "hidden md:table-cell" },
    { header: "Grade", accessor: "grade", className: "hidden md:table-cell" },
    ...(role === "admin"
      ? [{ header: "Fee Status", accessor: "fees", className: "hidden md:table-cell" }]
      : []),
    { header: "Phone", accessor: "phone", className: "hidden lg:table-cell" },
    { header: "Address", accessor: "address", className: "hidden lg:table-cell" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  // ----------------------
  // ROW RENDER FUNCTION
  // ----------------------
  const renderRow = (item: StudentList) => (
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
            <p className="text-xs text-gray-500 truncate">
              {item.class.name}
            </p>
          </div>
        </div>
      </td>

      {/* Student ID */}
      <td className="p-4 hidden md:table-cell truncate">
        {item.username}
      </td>

      {/* Grade */}
      <td className="p-4 hidden md:table-cell">
        {item.class.name[0]}
      </td>

      {/* Fee Status */}
      {role === "admin" && (
        <td className="p-4 hidden md:table-cell">
          {item._count.studentFees === 0 ? (
            <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
              Not Assigned
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
              Fees Assigned
            </span>
          )}
        </td>
      )}

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
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/eye.png" alt="" width={16} height={16} />
            </button>
          </Link>

          {role === "admin" && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </td>
    </tr>
  );

  const p = page ? parseInt(page) : 1;

  // ----------------------
  // BUILD QUERY CONDITIONS
  // ----------------------
  const query: Prisma.StudentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (!value) continue;

      switch (key) {
        case "teacherId":
          query.class = {
            lessons: {
              some: { teacherId: value },
            },
          };
          break;

        case "search":
          query.name = { contains: value, mode: "insensitive" };
          break;

        case "grade":
          query.gradeId = Number(value);
          break;

        case "classId":
          query.classId = Number(value);
          break;

        default:
          break;
      }
    }
  }

  // ----------------------
  // ORDER BY LOGIC
  // ----------------------
  let orderBy: any = {};

  switch (sort) {
    case "name":
      orderBy = { name: "asc" };
      break;
    case "date":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  // ----------------------
  // FETCH FILTER DATA
  // ----------------------
  const [grades, classes] = await Promise.all([
    prisma.grade.findMany({ orderBy: { level: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  // ----------------------
  // FETCH STUDENTS
  // ----------------------
  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: true,
        _count: {
          select: {
            studentFees: true,
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  // ----------------------
  // RETURN UI
  // ----------------------
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Students</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <StudentFilters grades={grades} classes={classes} />
            <StudentSort />
            {role === "admin" && (
              <FormContainer table="student" type="create" />
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
};

export default StudentListPage;
