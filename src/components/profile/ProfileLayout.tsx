import AvatarUploader from "@/components/AvatarUploader";
import ProfileActivityTracker from "@/components/ProfileActivityTracker";
import LastActive from "@/components/LastActive";
import ConfirmLogout from "@/components/ConfirmLogout";

export default function ProfileLayout({
  userId,
  img,
  initials,
  name,
  roleLabel,
  lastActiveAt,
  children,
}: {
  userId: string;
  img?: string | null;
  initials: string;
  name: string;
  roleLabel: string;
  lastActiveAt?: Date | null;
  children: React.ReactNode;
}) {
  return (
    <div className="p-2 max-w-6xl mx-auto space-y-8">
      {/* Track real-time activity */}
      <ProfileActivityTracker userId={userId} />

      <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= LEFT PROFILE CARD ================= */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center gap-4 self-start">
          <AvatarUploader userId={userId} img={img} initials={initials} />

          {/* Name + role + activity */}
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-semibold text-gray-900">{name}</p>

            <span
              className="inline-flex items-center rounded-full
               bg-blue-50 text-blue-700
               px-3 py-1 text-xs font-medium
               border border-blue-100"
            >
              {roleLabel}
            </span>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-600" />
              Active now
            </div>
          </div>
        </div>

        {/* ================= RIGHT CONTENT ================= */}
        <div className="lg:col-span-2 space-y-4">
          {children}

          {/* ================= SECURITY ================= */}
          <section className="bg-white rounded-2xl border p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Quick Security Actions</h2>

            <SecurityItem title="Password" description="Update your password.">
              <a
                href="/user/account"
                className="inline-flex items-center justify-center
                           rounded-lg px-4 py-2 text-sm font-medium
                           border border-gray-300 text-gray-700 bg-white
                           hover:bg-gray-50 hover:border-gray-400
                           transition"
              >
                Change Password
              </a>
            </SecurityItem>

            <SecurityItem
              title="Sign out"
              description="Sign out from this device."
            >
              <ConfirmLogout />
            </SecurityItem>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE UI ================= */

function SecurityItem({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row
                 sm:items-center sm:justify-between
                 gap-4 rounded-xl border border-gray-200 p-4
                 hover:border-gray-300 transition"
    >
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {children}
    </div>
  );
}
