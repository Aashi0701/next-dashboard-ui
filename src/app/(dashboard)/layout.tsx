import DashboardShell from "./DashboardShell";
import { getNavbarData } from "@/components/NavbarServer";
import { getSessionUser } from "@/lib/getSessionUser";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  if (!session) {
    return null;
  }

  const navbarData = await getNavbarData(session);

  return (
    <DashboardShell
      navbarData={navbarData}
      role={session.role}   // ✅ PASS ROLE
    >
      {children}
    </DashboardShell>
  );
}
