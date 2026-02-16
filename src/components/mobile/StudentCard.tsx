import Image from "next/image";
import Link from "next/link";
import FormContainer from "@/components/FormContainer";
import { Class, Student } from "@prisma/client";

type StudentCardProps = {
  item: Student & {
    class: Class;
    studentFees?: {
      totalAmount: number;
      paidAmount: number;
    }[];
    _count: {
      studentFees: number;
    };
  };
  role?: string;
};

export default function StudentCard({ item, role }: StudentCardProps) {
  /* ================= FEE CALC ================= */

  const totalFee =
    item.studentFees?.reduce((s, f) => s + f.totalAmount, 0) ?? 0;

  const totalPaid =
    item.studentFees?.reduce((s, f) => s + (f.paidAmount ?? 0), 0) ?? 0;

  let feeStatus: "NOT_ASSIGNED" | "PENDING" | "PAID";

  if (!item.studentFees || item.studentFees.length === 0) {
    feeStatus = "NOT_ASSIGNED";
  } else if (totalPaid >= totalFee) {
    feeStatus = "PAID";
  } else {
    feeStatus = "PENDING";
  }

  const progress =
    totalFee > 0 ? Math.min((totalPaid / totalFee) * 100, 100) : 0;

  /* ================= UI ================= */

  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm space-y-2">
      {/* ================= ROW 1: AVATAR + NAME + CLASS + ACTIONS ================= */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Image
          src={item.img || "/noAvatar.png"}
          alt={item.name}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover"
        />

        {/* Name + Class (INLINE) */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 truncate">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {item.name}
            </h3>
            <span className="text-[11px] text-gray-500 truncate">
              • {item.class.name}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/list/students/${item.id}`}>
            <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/eye.png" alt="View" width={14} height={14} />
            </button>
          </Link>

          {role === "admin" && (
            <FormContainer table="student" type="delete" id={item.id} />
          )}
        </div>
      </div>

      {/* ================= ROW 2: FEE BADGE ================= */}
      {role === "admin" && (
        <div className="text-[11px]">
          {feeStatus === "NOT_ASSIGNED" && (
            <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-gray-500">
              Fee: Not Assigned
            </span>
          )}

          {feeStatus === "PAID" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700">
              Paid ₹{totalPaid.toLocaleString()} / ₹{totalFee.toLocaleString()}
            </span>
          )}

          {feeStatus === "PENDING" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              Pending ₹{totalPaid.toLocaleString()} / ₹{totalFee.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* ================= ROW 3: PROGRESS BAR ================= */}
      {role === "admin" && feeStatus !== "NOT_ASSIGNED" && (
        <div className="w-full">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                feeStatus === "PAID" ? "bg-green-500" : "bg-yellow-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
