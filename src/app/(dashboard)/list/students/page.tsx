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
import StudentCard from "@/components/mobile/StudentCard";

/* ================= TYPES ================= */

type StudentList = Student & {
  class: Class;
  studentFees: {
    totalAmount: number;
    paidAmount: number;
  }[];
  _count: {
    studentFees: number;
  };
};

/* ================= PAGE ================= */

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { page, sort, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;

  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  /* ================= TABLE STRUCTURE ================= */

  const columns = [
    { header: "Info", accessor: "info" },
    {
      header: "Student ID",
      accessor: "studentId",
      className: "hidden md:table-cell",
    },
    {
      header: "Class",
      accessor: "class",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [
          {
            header: "Fee Status",
            accessor: "fees",
            className: "hidden md:table-cell",
          },
        ]
      : []),
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
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

  /* ================= ROW RENDER ================= */

  const renderRow = (item: StudentList) => {
    const totalFee = item.studentFees.reduce(
      (sum, f) => sum + f.totalAmount,
      0,
    );

    const totalPaid = item.studentFees.reduce(
      (sum, f) => sum + (f.paidAmount ?? 0),
      0,
    );

    let feeStatus: "NOT_ASSIGNED" | "PENDING" | "PAID";

    if (item.studentFees.length === 0) {
      feeStatus = "NOT_ASSIGNED";
    } else if (totalPaid >= totalFee) {
      feeStatus = "PAID";
    } else {
      feeStatus = "PENDING";
    }

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        {/* INFO */}
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

        {/* STUDENT ID */}
        <td className="p-4 hidden md:table-cell truncate">
          {item.username}
        </td>

        {/* CLASS */}
        <td className="p-4 hidden md:table-cell">
          {item.class.name}
        </td>

        {/* FEE STATUS */}
        {role === "admin" && (
          <td className="p-4 hidden md:table-cell">
            {feeStatus === "NOT_ASSIGNED" && (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs">
                Not Assigned
              </span>
            )}

            {feeStatus !== "NOT_ASSIGNED" && (
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  feeStatus === "PAID"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
                title={`₹${totalPaid} / ₹${totalFee}`}
              >
                {feeStatus === "PAID" ? "Paid" : "Pending"}
              </span>
            )}
          </td>
        )}

        {/* PHONE */}
        <td className="p-4 hidden lg:table-cell truncate">
          {item.phone}
        </td>

        {/* ADDRESS */}
        <td className="p-4 hidden lg:table-cell truncate">
          {item.address}
        </td>

        {/* ACTIONS */}
        {role === "admin" && (
          <td className="p-4 text-center">
            <div className="flex justify-center gap-2">
              <Link href={`/list/students/${item.id}`}>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                  <Image src="/eye.png" alt="" width={16} height={16} />
                </button>
              </Link>

              <FormContainer table="student" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  /* ================= QUERY ================= */

  const query: Prisma.StudentWhereInput = {};

  /* 🔐 ROLE-BASED SCOPE */
  if (role === "teacher") {
    query.class = {
      lessons: {
        some: {
          teacherId: userId,
        },
      },
    };
  }

  /* 🔍 QUERY PARAMS */
  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "search":
        query.name = {
          contains: value,
          mode: "insensitive",
        };
        break;

      case "classId":
        if (role === "teacher") {
          query.class = {
            AND: [
              { id: Number(value) },
              {
                lessons: {
                  some: { teacherId: userId },
                },
              },
            ],
          };
        } else {
          query.classId = Number(value);
        }
        break;

      case "teacherId":
        if (role === "admin") {
          query.class = {
            lessons: {
              some: { teacherId: value },
            },
          };
        }
        break;
    }
  }

  /* ================= SORT ================= */

  let orderBy: Prisma.StudentOrderByWithRelationInput;

  switch (sort) {
    case "name":
      orderBy = { name: "asc" };
      break;
    case "date":
    default:
      orderBy = { createdAt: "desc" };
  }

  /* ================= FILTER DATA ================= */

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
  });

  /* ================= DATA ================= */

  const [data, count] = await prisma.$transaction([
    prisma.student.findMany({
      where: query,
      include: {
        class: true,
        _count: {
          select: { studentFees: true },
        },
        studentFees: {
          select: {
            totalAmount: true,
            paidAmount: true,
          },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.student.count({ where: query }),
  ]);

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-base md:text-lg font-semibold text-gray-900">
          Students
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />
          <StudentFilters classes={classes} />
          <StudentSort />
          {role === "admin" && <FormContainer table="student" type="create" />}
        </div>
      </div>

      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="md:hidden mt-4 space-y-3">
        {data.map((item) => (
          <StudentCard key={item.id} item={item} role={role} />
        ))}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default StudentListPage;