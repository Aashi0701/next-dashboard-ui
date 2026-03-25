import prisma from "@/lib/prisma";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import HolidayCard from "@/components/mobile/HolidayCard";
import { auth } from "@clerk/nextjs/server";
import TableSearch from "@/components/TableSearch";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { CalendarOff } from "lucide-react";

export default async function HolidayListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const p = params.page ? Number(params.page) : 1;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "admin") {
    return <div className="p-6">Unauthorized</div>;
  }

  /* ================= FETCH WITH PAGINATION ================= */
  const [holidays, count] = await prisma.$transaction([
    prisma.holiday.findMany({
      orderBy: { date: "asc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.holiday.count(),
  ]);

  /* ================= TABLE COLUMNS ================= */
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Date", accessor: "date" },
    { header: "Type", accessor: "type" },
    { header: "Actions", accessor: "action", className: "text-center" },
  ];

  const renderRow = (h: any) => (
    <tr
      key={h.id}
      className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
    >
      <td className="px-2 py-1.5 md:px-3 md:py-2 font-medium truncate">
        {h.title}
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2">
        {new Date(h.date).toLocaleDateString("en-IN")}
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2">
        {h.isFullDay ? "Full Day" : "Half Day"}
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
        <div className="flex justify-center gap-2">
          <FormContainer table="holiday" type="update" data={h} id={h.id} />
          <FormContainer table="holiday" type="delete" id={h.id} />
        </div>
      </td>
    </tr>
  );

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = holidays.length === 0;

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <CalendarOff size={14} />
            </span>
            School Holidays
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span>{" "}
              teachers
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
          <FormContainer table="holiday" type="create" />
        </div>
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={holidays} />
      </div>

      {/* ===== MOBILE LIST ===== */}
      <div className="md:hidden mt-3 space-y-3">
        {holidays.map((h) => (
          <HolidayCard key={h.id} item={h} role={role} />
        ))}
      </div>

      {/* ===== PAGINATION ===== */}
      <Pagination page={p} count={count} />
    </div>
  );
}
