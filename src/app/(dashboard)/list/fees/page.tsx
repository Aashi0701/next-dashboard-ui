import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FeeFilters from "@/components/filters/FeeFilters";
import FeeSort from "@/components/filters/FeeSort";
import FeeCard from "@/components/mobile/FeeCard";
import { Wallet } from "lucide-react";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import Tooltip from "@/components/ui/Tooltip";
import { FeeTypeChip, FeeStatusBadge } from "@/components/ui/FeeBadges";
import AdvancedFilterBar from "@/components/filters/ActiveFilterChips";

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
  const { page, search, classId, type, sortBy, sortOrder } = params;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const p = page ? Number(page) : 1;
  const queryString = new URLSearchParams(params as any).toString();

  /* ================= FILTER ================= */
  const where: Prisma.FeeStructureWhereInput = {};

  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (classId) {
    where.classId = Number(classId);
  }

  if (type) {
    where.type = type as any;
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

  /* ================= FILTER CONFIG ================= */

  const feeFilterConfig = {
    classId: {
      label: "Class",
      icon: "🏫",
      options: classes.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    },

    type: {
      label: "Fee Type",
      icon: "💰",
      options: [
        { label: "Admission", value: "ADMISSION" },
        { label: "Term", value: "TERM" },
        { label: "Transport", value: "TRANSPORT" },
        { label: "Other", value: "OTHER" },
      ],
    },

    isActive: {
      label: "Status",
      icon: "📊",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },

    // sortBy: {
    //   label: "Sort By",
    //   icon: "↕️",
    //   options: [
    //     { label: "Title", value: "title" },
    //     { label: "Amount", value: "amount" },
    //     { label: "Created", value: "createdAt" },
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
    <tr
      key={item.id}
      className="border-b border-gray-100 even:bg-slate-50 text-xs hover:bg-purple-50"
    >
      <td className="px-2 py-1.5 md:px-3 md:py-2 font-medium">{item.title}</td>

      <td className="px-2 py-1.5 md:px-3 md:py-2 font-semibold">
        ₹{item.amount.toLocaleString()}
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2">{item.className}</td>

      <td className="px-2 py-1.5 md:px-3 md:py-2">
        <FeeTypeChip type={item.type} />
      </td>

      <td className="px-2 py-1.5 md:px-3 md:py-2">
        <FeeStatusBadge active={item.isActive} />
      </td>

      {role === "admin" && (
        <td className="px-2 py-1.5 md:px-3 md:py-2 text-center">
          <div className="flex justify-center gap-2">
            <Tooltip content="Edit Fee">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="fee"
                  type="update"
                  data={item}
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>
            <Tooltip content="Delete Fee">
              <span className="inline-flex shrink-0">
                <FormContainer
                  table="fee"
                  type="delete"
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>
            <Tooltip content="Assign Fee">
              <span className="inline-flex">
                <FormContainer
                  table="fee"
                  type="assign"
                  data={item}
                  id={item.id}
                  query={queryString}
                />
              </span>
            </Tooltip>
          </div>
        </td>
      )}
    </tr>
  );

  /* ================= PAGINATION ================= */
  const start = count === 0 ? 0 : (p - 1) * ITEM_PER_PAGE + 1;
  const end = Math.min(p * ITEM_PER_PAGE, count);
  const totalPages = Math.ceil(count / ITEM_PER_PAGE);
  const isEmpty = data.length === 0;

  /* ================= UI ================= */
  return (
    <div className="bg-white rounded-md flex-1 m-0 md:m-4 mt-0 p-3 md:p-6">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-3 w-full">
        {/* ===== TITLE ===== */}
        <div className="flex flex-col">
          <h1 className="flex items-center gap-2 text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-purple-100 text-purple-600">
              <Wallet size={14} />
            </span>
            Fee Structures
          </h1>
          {!isEmpty && (
            <p className="text-xs text-gray-500 mt-1">
              Showing <span className="font-medium text-gray-700">{start}</span>
              –<span className="font-medium text-gray-700">{end}</span> of{" "}
              <span className="font-medium text-gray-700">{count}</span> fees
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
            <FeeFilters classes={classes} />
            <FeeSort />
            {role === "admin" && <FormContainer table="fee" type="create" />}
          </div>
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block mt-4">
        <AdvancedFilterBar config={feeFilterConfig} />
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden mt-4 space-y-2">
        {data.map((item) => {
          const isTarget = params.action && params.id === String(item.id);

          return (
            <FeeCard
              key={item.id}
              item={item}
              role={role}
              action={
                isTarget
                  ? (params.action as "edit" | "delete" | "assign")
                  : undefined
              }
            />
          );
        })}
      </div>

      <Pagination page={p} count={count} />
    </div>
  );
};

export default FeesPage;
