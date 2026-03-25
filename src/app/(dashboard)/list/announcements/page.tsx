import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import type { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { Megaphone } from "lucide-react";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import AnnouncementFilters from "@/components/filters/AnnouncementFilters";
import AnnouncementSort from "@/components/filters/AnnouncementSort";
import FormContainer from "@/components/FormContainer";
import AnnouncementTableClient from "./AnnouncementTableClient";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

/* ---------------- TYPES ---------------- */
export default async function AnnouncementListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...filters } = params;

  const p = page ? parseInt(page) : 1;
  const queryString = new URLSearchParams(params as any).toString();

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* ---------------- FETCH CLASSES ---------------- */

  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
  });

  /* ---------------- FILTER CONFIG ---------------- */

  const announcementFilterConfig = {
    classId: {
      label: "Class",
      icon: "🏫",
      options: classes.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    },

    // sortBy: {
    //   label: "Sort By",
    //   icon: "↕️",
    //   options: [
    //     { label: "Title", value: "title" },
    //     { label: "Class", value: "class" },
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
        whatsappSent: true,
        whatsappSentAt: true,
        class: true,
        reads: {
          where: { userId: userId ?? undefined },
          select: { id: true },
        },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <Megaphone size={14} />
            </span>
            Announcements
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span>{" "}
              announcements
              <span className="ml-2 text-gray-400">
                • Page <span className="font-medium text-gray-700">{p}</span> of{" "}
                <span className="font-medium text-gray-700">{totalPages}</span>
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          {/* Search */}
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <AnnouncementFilters classes={classes} />
            <AnnouncementSort />
            {role === "admin" && (
              <FormContainer
                table="announcement"
                type="create"
                query={queryString}
              />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <AdvancedFilterBar config={announcementFilterConfig} />
      <AnnouncementTableClient data={data} role={role} query={queryString} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
}
