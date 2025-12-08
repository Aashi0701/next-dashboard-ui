import prisma from "@/lib/prisma";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";
import { PaymentStatusBadge } from "@/components/ui/FeeBadges";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";

/* =========================
   PAGE
========================= */

const PaymentsPage = async ({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) => {
  const { page, search } = searchParams;
  const p = page ? Number(page) : 1;

  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  /* -----------------------------
     QUERY STUDENT FEES
  ----------------------------- */
  const where: Prisma.StudentFeeWhereInput | undefined = search
  ? {
      student: {
        is: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { surname: { contains: search, mode: "insensitive" } },
          ],
        },
      },
    }
  : undefined;


  const [data, count] = await prisma.$transaction([
  prisma.studentFee.findMany({
    where,
    include: {
      student: {
        include: {
          class: true,
        },
      },
      feeStructure: true,
      payments: true,
    },
    orderBy: {
      assignedAt: "desc",
    },
    take: ITEM_PER_PAGE,
    skip: ITEM_PER_PAGE * (p - 1),
  }),
  prisma.studentFee.count({ where }),
]);

  /* -----------------------------
     TABLE CONFIG
  ----------------------------- */
  const columns = [
    { header: "Student", accessor: "student" },
    { header: "Class", accessor: "class" },
    { header: "Fee", accessor: "fee" },
    { header: "Total", accessor: "total" },
    { header: "Paid", accessor: "paid" },
    { header: "Due", accessor: "due" },
    { header: "Status", accessor: "status" },
    ...(role === "admin"
      ? [{ header: "Actions", accessor: "action", className: "text-center" }]
      : []),
  ];

  /* -----------------------------
     ROW RENDERER
  ----------------------------- */
  const renderRow = (item: any) => {
    const total = item.feeStructure.amount;
    const paid = item.payments.reduce(
      (sum: number, p: any) => sum + p.amount,
      0
    );
    const due = total - paid;

    const status =
      paid === 0 ? "PENDING" : paid < total ? "PARTIAL" : "PAID";

    return (
      <tr key={item.id} className="border-b text-sm">
        <td className="p-4">
          {item.student.name} {item.student.surname}
        </td>

        <td className="p-4">{item.student.class?.name}</td>

        <td className="p-4">{item.feeStructure.title}</td>

        <td className="p-4 font-semibold">₹{total.toLocaleString()}</td>

        <td className="p-4 text-green-700">
          ₹{paid.toLocaleString()}
        </td>

        <td className="p-4 text-red-600">
          ₹{due.toLocaleString()}
        </td>

        <td className="p-4">
          <PaymentStatusBadge status={status} />
        </td>

        {role === "admin" && (
          <td className="p-4 text-center">
            {status !== "PAID" && (
              <FormContainer
                table="payment"
                type="create"
                data={{
                  studentFeeId: item.id,
                  dueAmount: due,
                }}
              />
            )}
          </td>
        )}
      </tr>
    );
  };

  /* -----------------------------
     UI
  ----------------------------- */
  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Payments</h1>
        <TableSearch />
      </div>

      <Table
        columns={columns}
        renderRow={renderRow}
        data={data}
      />

      <Pagination page={p} count={count} />
    </div>
  );
};

export default PaymentsPage;
