import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import { Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import Tooltip from "@/components/ui/Tooltip";
import { auth } from "@clerk/nextjs/server";
import StudentFilters from "@/components/filters/StudentFilters";
import StudentSort from "@/components/filters/StudentSort";
import StudentCard from "@/components/mobile/StudentCard";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

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
  const { page, sort, action, id, ...queryParams } = params;
  const p = page ? parseInt(page) : 1;
  const queryString = new URLSearchParams(params as any).toString();
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  /* ================= TABLE STRUCTURE ================= */

  const columns = [
    { header: "Info", accessor: "info" },
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
        className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
      >
        {/* INFO */}
        <td className="px-2 py-1.5 md:px-3 md:py-2">
          <div className="flex items-center gap-3">
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

        {/* CLASS */}
        <td className="px-2 py-1.5 md:px-3 md:py-2 text-left hidden md:table-cell">
          {item.class.name}
        </td>

        {/* FEE STATUS */}
        {role === "admin" && (
          <td className="px-2 py-1.5 md:px-3 md:py-2 hidden md:table-cell">
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
        <td className="px-2 py-1.5 md:px-3 md:py-2 hidden lg:table-cell truncate">
          {item.phone}
        </td>

        {/* ADDRESS */}
        <td className="px-2 py-1.5 md:px-3 md:py-2 hidden lg:table-cell truncate">
          {item.address}
        </td>

        {/* ACTIONS */}
        {role === "admin" && (
          <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
            <div className="flex justify-center gap-2">
              {/* VIEW */}
              <Tooltip content="View Student">
                <span className="inline-flex">
                  <Link href={`/list/students/${item.id}`}>
                    <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                      <Image src="/eye.png" alt="View" width={16} height={16} />
                    </button>
                  </Link>
                </span>
              </Tooltip>

              {/* EDIT */}
              <Tooltip content="Edit Student">
                <span className="inline-flex shrink-0">
                  <FormContainer
                    table="student"
                    type="update"
                    data={item}
                    id={item.id}
                    query={queryString}
                  />
                </span>
              </Tooltip>

              {/* DELETE */}
              <Tooltip content="Delete Student">
                <span className="inline-flex shrink-0">
                  <FormContainer
                    table="student"
                    type="delete"
                    id={item.id}
                    query={queryString}
                  />
                </span>
              </Tooltip>
            </div>
          </td>
        )}
      </tr>
    );
  };

  /* ================= QUERY ================= */

  const query: Prisma.StudentWhereInput = {};

  /* 🔐 ROLE-BASED SCOPE */
  let teacherRecord: Teacher | null = null;

  if (role === "teacher") {
    teacherRecord = await prisma.teacher.findUnique({
      where: { userId: userId! },
    });

    if (!teacherRecord) {
      throw new Error("Teacher not mapped to system");
    }

    query.class = {
      lessons: {
        some: {
          teacherId: teacherRecord.id, // ✅ FIX
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
                  some: { teacherId: teacherRecord?.id },
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

  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.teacher.findMany({ orderBy: { name: "asc" } }),
  ]);

  /* ================= FILTER CONFIG ================= */

  const studentFilterConfig = {
    classId: {
      label: "Class",
      icon: "🏫",
      options: classes.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    },

    teacherId: {
      label: "Teacher",
      icon: "👨‍🏫",
      options: teachers.map((t) => ({
        label: `${t.name} ${t.surname}`,
        value: t.id,
      })),
    },

    // sortBy: {
    //   label: "Sort By",
    //   icon: "↕️",
    //   options: [
    //     { label: "Name", value: "name" },
    //     { label: "Date", value: "date" },
    //   ],
    // },

    // sortOrder: {
    //   label: "Order",
    //   icon: "🔽",
    //   options: [
    //     { label: "Ascending", value: "asc" },
    //     { label: "Descending", value: "desc" },
    //   ],
    // },
  };

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

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = data.length === 0;

  /* ================= UI ================= */

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      <div className="flex items-center justify-between gap-3 w-full">
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <Users size={14} />
            </span>
            Students
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span>{" "}
              students
              <span className="ml-2 text-gray-400">
                • Page <span className="font-medium text-gray-700">{p}</span> of{" "}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <StudentFilters classes={classes} />
            <StudentSort />
            {role === "admin" && (
              <FormContainer table="student" type="create" />
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block mt-4">
        <AdvancedFilterBar config={studentFilterConfig} />
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      <div className="md:hidden mt-4 space-y-3">
        {data.map((item) => {
          const isTarget = params.action && params.id === String(item.id);

          return (
            <StudentCard
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

export default StudentListPage;
