import prisma from "@/lib/prisma";

// ✅ IST TIME
export function getISTTime() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    })
  );
}

// ✅ UTC TODAY
export function getTodayUTCDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0, 0, 0, 0
  ));
}

// ✅ SAME DAY CHECK
function isSameDayUTC(d1: Date, d2: Date) {
  return d1.toISOString().slice(0, 10) === d2.toISOString().slice(0, 10);
}

// ✅ MAIN LOCK LOGIC
export async function isAttendanceLocked({
  date,
  isAdmin = false,
}: {
  date: Date;
  isAdmin?: boolean;
}) {
  const today = getTodayUTCDateOnly();

  // 👑 ADMIN OVERRIDE
  if (isAdmin) return false;

  // ❌ PREVIOUS DAYS LOCKED
  if (!isSameDayUTC(date, today)) return true;

  const ist = getISTTime();
  const hour = ist.getHours();

  // ✅ BEFORE 4 PM → editable
  if (hour < 16) return false;

  // 🔓 CHECK REOPEN FLAG
  const control = await prisma.attendanceControl.findUnique({
    where: { date: today },
  });

  if (control?.isOpen) return false;

  // ❌ LOCKED
  return true;
}