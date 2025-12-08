import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import AnnouncementFilters from "@/components/filters/AnnouncementFilters";
import AnnouncementSort from "@/components/filters/AnnouncementSort";

/* --------------------------------
   TYPES
--------------------------------- */
type AnnouncementList = Announcement & {
  class: Class | null;
  reads: { id: number }[];
};

/* --------------------------------
   PAGE
--------------------------------- */
export default async function AnnouncementListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...filters } = params;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* --------------------------------
     FETCH CLASSES (FILTER DROPDOWN)
  --------------------------------- */
  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
  });

  /* --------------------------------
     TABLE COLUMNS
  --------------------------------- */
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  /* --------------------------------
     BASE ROLE FILTERING
  --------------------------------- */
  let roleWhere: Prisma.AnnouncementWhereInput = {};

  if (role === "teacher" && userId) {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
      select: { classes: { select: { id: true } } },
    });

    const classIds = teacher?.classes.map((c) => c.id) ?? [];

    roleWhere = {
      OR: [{ classId: null }, { classId: { in: classIds } }],
    };
  }

  if (role === "student" && userId) {
    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: { classId: true },
    });

    roleWhere = {
      OR: [{ classId: null }, { classId: student?.classId }],
    };
  }

  if (role === "parent" && userId) {
    const parent = await prisma.parent.findUnique({
      where: { id: userId },
      select: { students: { select: { classId: true } } },
    });

    const classIds = parent?.students.map((s) => s.classId) ?? [];

    roleWhere = {
      OR: [{ classId: null }, { classId: { in: classIds } }],
    };
  }

  /* --------------------------------
     FILTERING (SEARCH + CLASS)
  --------------------------------- */
  const filterWhere: Prisma.AnnouncementWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    switch (key) {
      case "classId":
        filterWhere.classId = Number(value);
        break;

      case "search":
        filterWhere.title = { contains: value, mode: "insensitive" };
        break;
    }
  }

  /* --------------------------------
     FINAL WHERE CLAUSE
  --------------------------------- */
  const where: Prisma.AnnouncementWhereInput = {
    AND: [roleWhere, filterWhere],
  };

  /* --------------------------------
     SORTING
  --------------------------------- */
  const sort: Prisma.SortOrder =
    sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc";

  let orderBy: Prisma.AnnouncementOrderByWithRelationInput;

  switch (sortBy) {
    case "title":
      orderBy = { title: sort };
      break;
    case "class":
      orderBy = { class: { name: sort } };
      break;
    case "date":
      orderBy = { date: sort };
      break;
    default:
      orderBy = { date: "desc" };
  }

  /* --------------------------------
     FETCH DATA (WITH READ STATUS)
  --------------------------------- */
  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where,
      include: {
        class: true,
        reads: {
          where: { userId: userId ?? undefined },
          select: { id: true },
        },
      },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where }),
  ]);

  /* --------------------------------
     MARK AS READ (SAFE)
  --------------------------------- */
  if (userId && data.length > 0) {
    await prisma.announcementRead.createMany({
      data: data.map((a) => ({
        userId,
        announcementId: a.id,
      })),
      skipDuplicates: true,
    });
  }

  /* --------------------------------
     ROW RENDER
  --------------------------------- */
  const renderRow = (item: AnnouncementList) => {
    const isUnread = item.reads.length === 0;

    const isUrgent =
      item.title.startsWith("URGENT") ||
      item.title.startsWith("IMPORTANT") ||
      new Date(item.date).getTime() >
        Date.now() - 24 * 60 * 60 * 1000;

    return (
      <tr
        key={item.id}
        className={`border-b text-sm hover:bg-gray-50 ${
          isUrgent ? "border-l-4 border-red-500" : ""
        }`}
      >
        {/* ✅ TITLE */}
        <td className="p-4 flex items-center gap-2">
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}

          <span
            className={`font-medium ${
              isUnread ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {item.title}
          </span>

          {isUrgent && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
              Urgent
            </span>
          )}
        </td>

        {/* ✅ CLASS */}
        <td className="p-4">
          {item.class?.name || "All Classes"}
        </td>

        {/* ✅ DATE */}
        <td className="p-4 hidden md:table-cell text-gray-500">
          {new Date(item.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </td>

        {/* ✅ ACTIONS */}
        {role === "admin" && (
          <td className="p-4 text-center">
            <div className="flex justify-center gap-2">
              <FormContainer table="announcement" type="update" data={item} />
              <FormContainer table="announcement" type="delete" id={item.id} />
            </div>
          </td>
        )}
      </tr>
    );
  };

  /* --------------------------------
     UI
  --------------------------------- */
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 m-4 mt-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Announcements</h1>
          <p className="text-sm text-gray-500">
            School-wide and class-specific updates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <TableSearch />
          <div className="h-6 w-px bg-gray-200" />
          <AnnouncementFilters classes={classes} />
          <AnnouncementSort />
          {role === "admin" && (
            <FormContainer table="announcement" type="create" />
          )}
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
}
