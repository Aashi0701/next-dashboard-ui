import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import EventFilters from "@/components/filters/EventFilters";
import EventSort from "@/components/filters/EventSort";
import EventCard from "@/components/mobile/EventCard";

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

  /* ================= FILTER DATA ================= */
  const classes = await prisma.class.findMany({ orderBy: { name: "asc" } });

  /* ================= COLUMNS (DESKTOP) ================= */
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Class", accessor: "class" },
    { header: "Date", accessor: "date", className: "hidden md:table-cell" },
    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell",
    },
    {
      header: "End Time",
      accessor: "endTime",
      className: "hidden md:table-cell",
    },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 font-medium truncate">{item.title}</td>
      <td className="p-4 truncate">{item.class?.name ?? "-"}</td>
      <td className="p-4 hidden md:table-cell">
        {new Intl.DateTimeFormat("en-US").format(item.startTime)}
      </td>
      <td className="p-4 hidden md:table-cell">
        {item.startTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>
      <td className="p-4 hidden md:table-cell">
        {item.endTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </td>

      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer
              table="event"
              type="update"
              data={item}
              id={item.id}
            />
            <FormContainer table="event" type="delete" id={item.id} />
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= FILTER QUERY ================= */
  const query: Prisma.EventWhereInput = {};

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    switch (key) {
      case "classId":
        query.classId = value === "null" ? null : Number(value);
        break;
      case "search":
        query.title = { contains: value, mode: "insensitive" };
        break;
    }
  }

  /* ================= SORT ================= */
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
    default:
      orderBy = { id: "desc" };
  }

  /* ================= DATA ================= */
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

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <h1 className="text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
          Events
        </h1>

        <div className="flex items-center gap-2 flex-nowrap mb-4 mt-4">
          {/* Search */}
          <div className="flex-1 min-w-0 max-w-[160px] sm:max-w-[200px] md:max-w-none">
            <TableSearch />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <EventFilters classes={classes} />
            <EventSort />
            {role === "admin" && <FormContainer table="event" type="create" />}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* ===== MOBILE LIST ===== */}
      <div className="md:hidden mt-3 space-y-3">
        {data.map((item) => (
          <EventCard key={item.id} item={item} role={role} />
        ))}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
}
