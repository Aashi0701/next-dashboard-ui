import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";

import EventFilters from "@/components/filters/EventFilters";
import EventSort from "@/components/filters/EventSort";

export default async function EventListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const { page, sortBy, sortOrder, ...filters } = params;

  const p = page ? parseInt(page) : 1;

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // LOAD CLASSES FOR FILTER SIDEBAR
  const classes = await prisma.class.findMany({ orderBy: { name: "asc" } });

  // TABLE COLUMNS
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    { header: "Start Time", accessor: "startTime", className: "hidden md:table-cell" },
    { header: "End Time", accessor: "endTime", className: "hidden md:table-cell" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* ✅ TITLE */}
      <td className="p-4 font-medium">
        {item.title}
      </td>

      {/* ✅ CLASS */}
      <td className="p-4">
        {item.class?.name || "-"}
      </td>

      {/* ✅ DATE */}
      <td className="p-4 hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>

      {/* ✅ START TIME */}
      <td className="p-4 hidden md:table-cell">
        {item.startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>

      {/* ✅ END TIME */}
      <td className="p-4 hidden md:table-cell">
        {item.endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>

      {/* ✅ ACTIONS */}
      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer table="event" type="update" data={item} />
            <FormContainer table="event" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  // ----------------------------------------------------
  // BUILD FILTER QUERY
  // ----------------------------------------------------

  const query: Prisma.EventWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    switch (key) {
      case "classId":
        query.classId = value === "null" ? null : Number(value);
        break;

      case "dateFrom":
        query.startTime = {
          ...(typeof query.startTime === "object" && query.startTime !== null
            ? query.startTime
            : {}),
          gte: new Date(value),
        };
        break;

      case "dateTo":
        query.startTime = {
          ...(typeof query.startTime === "object" && query.startTime !== null
            ? query.startTime
            : {}),
          lte: new Date(value),
        };
        break;

      case "search":
        query.title = { contains: value, mode: "insensitive" };
        break;

      case "type":
        if (value === "global") query.classId = null;
        if (value === "class") query.classId = { not: null };
        break;
    }
  }

  // ----------------------------------------------------
  // ROLE CONDITIONS
  // ----------------------------------------------------
  if (role !== "admin") {
    query.OR = [
      { classId: null },
      {
        class: {
          students: { some: { id: currentUserId! } },
        },
      },
      {
        class: {
          students: { some: { parentId: currentUserId! } },
        },
      },
      {
        class: {
          lessons: { some: { teacherId: currentUserId! } },
        },
      },
    ];
  }

  // ----------------------------------------------------
  // SORTING
  // ----------------------------------------------------
  const order = sortOrder === "desc" ? "desc" : "asc";

  let orderBy: any = {};

  switch (sortBy) {
    case "title":
      orderBy = { title: order };
      break;
    case "class":
      orderBy = { class: { name: order } };
      break;
    case "date":
      orderBy = { startTime: order };
      break;
    case "startTime":
      orderBy = { startTime: order };
      break;
    case "endTime":
      orderBy = { endTime: order };
      break;
    default:
      orderBy = { id: "desc" };
  }

  // ----------------------------------------------------
  // FETCH
  // ----------------------------------------------------
  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: { class: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where: query }),
  ]);

  // ----------------------------------------------------
  // RENDER PAGE
  // ----------------------------------------------------
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">

      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <EventFilters classes={classes} />
            <EventSort />
            {role === "admin" && <FormContainer table="event" type="create" />}
          </div>
        </div>
      </div>

      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={p} count={count} />
    </div>
  );
}
