import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import FeeFilters from "@/components/filters/FeeFilters";
import FeeSort from "@/components/filters/FeeSort";
import FeeCard from "@/components/mobile/FeeCard";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import {
  FeeTypeChip,
  FeeStatusBadge,
} from "@/components/ui/FeeBadges";

/* ================= TYPES ================= */

type FeeRow = {
  id: number;
  title: string;
  amount: number;
  className: string;
  type: string;
  isActive: boolean;
};

/* ================= PAGE ================= */

const FeesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const params = await searchParams;
  const { page, search, classId, sortBy, sortOrder } = params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const p = page ? Number(page) : 1;

  /* ================= FILTER ================= */
  const where: Prisma.FeeStructureWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (classId) {
    where.classId = Number(classId);
  }

  /* ================= SORT ================= */
  let orderBy: Prisma.FeeStructureOrderByWithRelationInput = {
    createdAt: "desc",
  };

  if (sortBy) {
    orderBy = {
      [sortBy]: sortOrder === "desc" ? "desc" : "asc",
    };
  }

  /* ================= FILTER DATA ================= */
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  /* ================= FETCH ================= */
  const [rows, count] = await prisma.$transaction([
    prisma.feeStructure.findMany({
      where,
      include: { class: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.feeStructure.count({ where }),
  ]);

  const data: FeeRow[] = rows.map((f) => ({
    id: f.id,
    title: f.title,
    amount: f.amount,
    className: f.class?.name ?? "-",
    type: f.type,
    isActive: f.isActive,
  }));

  /* ================= TABLE ================= */
  const columns = [
    { header: "Title", accessor: "title" },
    { header: "Amount", accessor: "amount" },
    { header: "Class", accessor: "class" },
    { header: "Type", accessor: "type" },
    { header: "Status", accessor: "status" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  const renderRow = (item: FeeRow) => (
    <tr key={item.id} className="border-b text-sm">
      <td className="p-4 font-medium">{item.title}</td>

      <td className="p-4 font-semibold">
        ₹{item.amount.toLocaleString()}
      </td>

      <td className="p-4">{item.className}</td>

      <td className="p-4">
        <FeeTypeChip type={item.type} />
      </td>

      <td className="p-4">
        <FeeStatusBadge active={item.isActive} />
      </td>

      {role === "admin" && (
        <td className="p-4 text-center">
          <div className="flex justify-center gap-2">
            <FormContainer table="fee" type="update" data={item} />
            <FormContainer table="fee" type="delete" id={item.id} />
            <FormContainer table="fee" type="assign" data={item} />
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-base md:text-lg font-semibold">
          Fee Structures
        </h1>

        <div className="flex flex-wrap items-center gap-3 sm:gap-2 w-full md:w-auto">
          <TableSearch />
          <FeeFilters classes={classes} />
          <FeeSort />
          {role === "admin" && (
            <FormContainer table="fee" type="create" />
          )}
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block mt-4">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden mt-4 space-y-2">
        {data.map((item) => (
          <FeeCard
            key={item.id}
            item={item}
            actions={
              role === "admin" && (
                <div className="flex gap-2">
                  <FormContainer table="fee" type="update" data={item} />
                  <FormContainer table="fee" type="delete" id={item.id} />
                  <FormContainer table="fee" type="assign" data={item} />
                </div>
              )
            }
          />
        ))}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default FeesPage;
