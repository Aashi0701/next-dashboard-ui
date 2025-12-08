import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";

import FeeFilters from "@/components/filters/FeeFilters";
import FeeSort from "@/components/filters/FeeSort";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

import {
  FeeTypeChip,
  FeeStatusBadge,
  FeeTermBadge,
} from "@/components/ui/FeeBadges";
import { FaCheckCircle } from "react-icons/fa";

/* =========================
   TYPES
========================= */

type FeeWithRelations = Prisma.FeeStructureGetPayload<{
  include: { class: true };
}>;

/* =========================
   PAGE
========================= */

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

  /* -----------------------------
     BUILD FILTER QUERY
  ----------------------------- */
  const where: Prisma.FeeStructureWhereInput = {};

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (classId) {
    where.classId = Number(classId);
  }

  /* -----------------------------
     SORTING
  ----------------------------- */
  let orderBy: Prisma.FeeStructureOrderByWithRelationInput = {
    createdAt: "desc",
  };

  if (sortBy) {
    orderBy = {
      [sortBy]: sortOrder === "desc" ? "desc" : "asc",
    } as Prisma.FeeStructureOrderByWithRelationInput;
  }

  /* -----------------------------
     LOAD FILTER DATA
  ----------------------------- */
  const classes = await prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  /* -----------------------------
     FETCH FEES
  ----------------------------- */
  const [data, count] = await prisma.$transaction([
    prisma.feeStructure.findMany({
      where,
      include: { class: true },
      orderBy,
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.feeStructure.count({ where }),
  ]);

  /* -----------------------------
     TABLE CONFIG
  ----------------------------- */
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

  const renderRow = (item: FeeWithRelations) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      {/* TITLE */}
      <td className="p-4">
        <div className="flex flex-col gap-1">
          <span className="font-medium">{item.title}</span>
          {/* <FeeTermBadge term={item.term} /> */}
        </div>
      </td>

      {/* AMOUNT */}
      <td className="p-4 font-semibold">
        ₹{item.amount.toLocaleString()}
      </td>

      {/* CLASS */}
      <td className="p-4">
        {item.class ? item.class.name : "-"}
      </td>

      {/* TYPE */}
      <td className="p-4">
        <FeeTypeChip type={item.type} />
      </td>

      {/* STATUS */}
      <td className="p-4">
        <FeeStatusBadge active={item.isActive} />
      </td>

      {/* ACTIONS */}
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

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP BAR */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Fee Structures
        </h1>

        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />

          <div className="flex items-center gap-4 self-end">
            <FeeFilters classes={classes} />
            <FeeSort />
            {role === "admin" && (
              <FormContainer table="fee" type="create" />
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <Table columns={columns} renderRow={renderRow} data={data} />

      {/* PAGINATION */}
      <Pagination page={p} count={count} />
    </div>
  );
};

export default FeesPage;
