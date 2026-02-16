import prisma from "@/lib/prisma";
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import HolidayCard from "@/components/mobile/HolidayCard";
import { auth } from "@clerk/nextjs/server";

export default async function HolidayListPage() {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (role !== "admin") {
    return <div className="p-6">Unauthorized</div>;
  }

  const holidays = await prisma.holiday.findMany({
    orderBy: { date: "asc" },
  });

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
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="p-4 font-medium truncate">{h.title}</td>

      <td className="p-4">
        {new Date(h.date).toLocaleDateString("en-IN")}
      </td>

      <td className="p-4">
        {h.isFullDay ? "Full Day" : "Half Day"}
      </td>

      <td className="p-4 text-center">
        <div className="flex justify-center gap-2">
          <FormContainer table="holiday" type="update" data={h} />
          <FormContainer table="holiday" type="delete" id={h.id} />
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* ===== TOP BAR ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-base md:text-lg font-semibold">
          School Holidays
        </h1>

        <FormContainer table="holiday" type="create" />
      </div>

      {/* ===== DESKTOP TABLE ===== */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={holidays} />
      </div>

      {/* ===== MOBILE LIST ===== */}
      <div className="md:hidden mt-3 space-y-3">
        {holidays.map((h) => (
          <HolidayCard key={h.id} item={h} />
        ))}
      </div>
    </div>
  );
}
