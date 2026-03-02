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
import TeacherCard from "@/components/mobile/TeacherCard";

type TeacherList = Teacher & {
  lessons: {
    subject: Subject;
  }[];
  supervisedClasses: Class[];
};

const TeacherListPage = async ({
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
      header: "Teacher ID",
      accessor: "teacherId",
      className: "hidden md:table-cell",
      sortable: true,
    },
    {
      header: "Subjects",
      accessor: "subjects",
      className: "hidden md:table-cell",
    },
    {
      header: "Classes",
      accessor: "classes",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      accessor: "phone",
      className: "hidden lg:table-cell",
      sortable: true,
    },
    {
      header: "Address",
      accessor: "address",
      className: "hidden lg:table-cell",
      sortable: true,
    },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

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

      <td className="p-4 hidden md:table-cell truncate">{item.username}</td>

      <td className="p-4 hidden md:table-cell truncate">
        {[...new Set(item.lessons.map((l) => l.subject.name))].join(", ")}
      </td>

      <td className="p-4 hidden md:table-cell truncate">
        {item.supervisedClasses.map((c) => c.name).join(", ")}
      </td>

      <td className="p-4 hidden lg:table-cell truncate">{item.phone}</td>

      <td className="p-4 hidden lg:table-cell truncate">{item.address}</td>

      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            {/* VIEW */}
            <Link href={`/list/teachers/${item.id}`}>
              <button
                type="button"
                className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky"
              >
                <Image src="/eye.png" alt="View" width={16} height={16} />
              </button>
            </Link>

            {/* EDIT */}
            <FormContainer
              table="teacher"
              type="update"
              id={item.id}
              data={item}
              relatedData={{ subjects, classes }}
            />

            {/* DELETE */}
            <FormContainer table="teacher" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= QUERY ================= */
  const query: Prisma.TeacherWhereInput = {};

  for (const [key, value] of Object.entries(queryParams)) {
    if (!value) continue;

    switch (key) {
      case "search":
        query.name = { contains: value, mode: "insensitive" };
        break;
      case "classId":
        query.supervisedClasses = {
          some: { id: Number(value) },
        };
        break;
      case "subjectId":
        query.lessons = {
          some: {
            subjectId: Number(value),
          },
        };
        break;
    }
  }

  /* ================= SORT ================= */
  const order: "asc" | "desc" = sortOrder === "asc" ? "asc" : "desc";

  const sortableFields: Record<string, any> = {
    teacherId: { username: order },
    phone: { phone: order },
    address: { address: order },
  };

  const orderBy = (sortBy && sortableFields[sortBy]) || { createdAt: order };

  /* ================= FILTER DATA ================= */
  const [subjects, classes] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  /* ================= DATA ================= */
  const [data, count] = await prisma.$transaction([
    prisma.teacher.findMany({
      where: query,
      include: {
        lessons: {
          include: {
            subject: true,
          },
        },
        supervisedClasses: true,
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.teacher.count({ where: query }),
  ]);

  return (
    <div className="bg-white rounded-md flex-1 w-full my-0 px-3 py-3 md:m-4 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <h1 className="text-base md:text-lg font-semibold text-gray-900">
          Teachers
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-1 sm:gap-2">
            <TeacherFilters subjects={subjects} classes={classes} />
            <TeacherSort />
            {role === "admin" && (
              <FormContainer
                table="teacher"
                type="create"
                relatedData={{ subjects, classes }}
              />
            )}
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
            <TeacherCard
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

      {/* ===== PAGINATION ===== */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default TeacherListPage;
