import prisma from "@/lib/prisma";
import Image from "next/image";
import UserCardActions from "@/components/UserCardActions";

/* ================= HELPERS ================= */

function getAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const startYear = month >= 6 ? year : year - 1;
  const endYear = startYear + 1;

  return `${startYear}/${String(endYear).slice(-2)}`;
}

const ROLE_STYLES: Record<
  "admin" | "teacher" | "student" | "parent",
  {
    bg: string;
    badge: string;
  }
> = {
  admin: {
    bg: "bg-rose-100",
    badge: "text-rose-600",
  },
  teacher: {
    bg: "bg-purple-100",
    badge: "text-purple-600",
  },
  student: {
    bg: "bg-blue-100",
    badge: "text-blue-600",
  },
  parent: {
    bg: "bg-emerald-100",
    badge: "text-emerald-600",
  },
};

/* ================= COMPONENT ================= */

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const data = await modelMap[type].count();
  const academicYear = getAcademicYear();
  const styles = ROLE_STYLES[type];

  return (
    <div
      className={`
        ${styles.bg}
        rounded-2xl
        p-2 sm:p-4
        flex-1
        min-w-[120px] sm:min-w-[140px]
        transition-all duration-300
        md:hover:-translate-y-1
        md:hover:shadow-lg
      `}
    >
      {/* ===== HEADER ===== */}
      <div className="flex justify-between items-center">
        <span
          className={`
            bg-white/70 backdrop-blur-sm shadow-sm
            px-2 py-0.5
            rounded-full
            text-[9px] sm:text-[10px]
            font-medium
            ${styles.badge}
          `}
        >
          {academicYear}
        </span>

        <UserCardActions role={type} />

      </div>

      {/* ===== COUNT ===== */}
      <h1
        className="
          text-lg sm:text-2xl
          font-semibold
          mt-3 mb-1
          animate-countIn
          text-gray-900
        "
      >
        {data}
      </h1>

      {/* ===== LABEL ===== */}
      <h2
        className="
          capitalize
          text-xs sm:text-sm
          font-medium
          text-gray-600
        "
      >
        {type}s
      </h2>
    </div>
  );
};

export default UserCard;
