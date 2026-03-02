import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import type { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import AnnouncementFilters from "@/components/filters/AnnouncementFilters";
import AnnouncementSort from "@/components/filters/AnnouncementSort";
import FormContainer from "@/components/FormContainer";
import AnnouncementTableClient from "./AnnouncementTableClient";

/* ---------------- TYPES ---------------- */

type AnnouncementList = Prisma.AnnouncementGetPayload<{
  include: {
    class: true;
    reads: {
      select: { id: true };
    };
  };
}>;

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

  /* ---------------- FETCH CLASSES ---------------- */

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
  });

  /* ---------------- ROLE FILTERING ---------------- */

  let roleWhere: Prisma.AnnouncementWhereInput = {};

  if (role === "teacher" && userId) {
    const teacherClasses = await prisma.class.findMany({
      where: { supervisorId: userId },
      select: { id: true },
    });

    roleWhere = {
      OR: [
        { classId: null },
        { classId: { in: teacherClasses.map((c) => c.id) } },
      ],
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

    roleWhere = {
      OR: [
        { classId: null },
        { classId: { in: parent?.students.map((s) => s.classId) ?? [] } },
      ],
    };
  }

  /* ---------------- FILTERS ---------------- */

  const filterWhere: Prisma.AnnouncementWhereInput = {};

  if (filters.search) {
    filterWhere.title = {
      contains: filters.search,
      mode: "insensitive",
    };
  }

  if (filters.classId) {
    filterWhere.classId = Number(filters.classId);
  }

  const where: Prisma.AnnouncementWhereInput = {
    AND: [roleWhere, filterWhere],
  };

  /* ---------------- SORT ---------------- */

  const sort: Prisma.SortOrder =
    sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc";

  const orderBy: Prisma.AnnouncementOrderByWithRelationInput =
    sortBy === "title"
      ? { title: sort }
      : sortBy === "class"
        ? { class: { name: sort } }
        : sortBy === "date"
          ? { date: sort }
          : { date: "desc" };

  /* ---------------- FETCH DATA ---------------- */

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where,
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),

      // ✅ Explicitly select everything you need
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        classId: true,

        // ✅ REQUIRED for "Last Sent"
        whatsappSent: true,
        whatsappSentAt: true,

        // relations
        class: true,
        reads: {
          where: { userId: userId ?? undefined },
          select: { id: true },
        },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-base md:text-lg font-semibold">Announcements</h1>

        <div className="flex items-center gap-2">
          <TableSearch />
          <AnnouncementFilters classes={classes} />
          <AnnouncementSort />
          {role === "admin" && (
            <FormContainer table="announcement" type="create" />
          )}
        </div>
      </div>

      {/* TABLE */}
      <AnnouncementTableClient data={data} role={role} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}
