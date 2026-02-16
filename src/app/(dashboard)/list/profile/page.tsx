import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import AdminProfile from "@/components/profile/AdminProfile";
import TeacherProfile from "@/components/profile/TeacherProfile";
import { ensureAdminExists } from "@/lib/ensureAdmin";

export default async function ProfilePage() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId || !role) return null;

  if (role === "admin") {
    const admin = await ensureAdminExists(userId);
    return <AdminProfile admin={admin} />;
  }

  if (role === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { id: userId },
    });

    if (!teacher) return null;
    return <TeacherProfile teacher={teacher} />;
  }

  return null;
}
