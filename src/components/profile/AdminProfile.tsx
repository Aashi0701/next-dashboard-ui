"use client";

import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useClerk } from "@clerk/nextjs";

type AdminProfileProps = {
  admin: {
    id: string;
    username: string;
    img: string | null;
    lastActiveAt: Date | null;
  };
};

export default function AdminProfile({ admin }: AdminProfileProps) {
  const initials = admin.username.slice(0, 2).toUpperCase();
  const { signOut } = useClerk();

  return (
    <div className="w-full px-3 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-xl sm:text-2xl font-semibold mb-6">My Profile</h1>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: PROFILE CARD */}
          <div className="bg-white rounded-xl border p-6 flex flex-col items-center text-center">
            {admin.img ? (
              <Image
                src={admin.img}
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full mb-4 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mb-4 bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-700">
                {initials}
              </div>
            )}

            <p className="text-lg font-medium">{admin.username}</p>

            <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
              System Administrator
            </span>

            {admin.lastActiveAt ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Last active{" "}
                {formatDistanceToNow(admin.lastActiveAt, {
                  addSuffix: true,
                })}
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Active now
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS */}
          <div className="lg:col-span-2 space-y-6">
            {/* ACCOUNT INFO */}
            <div className="bg-white rounded-xl border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Account Information</h2>
                <button className="text-sm px-3 py-1 rounded-md border hover:bg-gray-50">
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-medium">Admin</p>
                </div>

                <div>
                  <p className="text-gray-500">Username</p>
                  <p className="font-medium">{admin.username}</p>
                </div>

                <div>
                  <p className="text-gray-500">User ID</p>
                  <p className="font-medium break-all">{admin.id}</p>
                </div>

                <div>
                  <p className="text-gray-500">Access</p>
                  <p className="font-medium">Full System Access</p>
                </div>
              </div>
            </div>

            {/* PRIVILEGES */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-medium mb-4">Administrative Privileges</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  "Manage Teachers & Students",
                  "Publish Announcements",
                  "View Reports",
                  "Configure Classes & Subjects",
                  "Manage Fees",
                  "System Configuration",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* SECURITY */}
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-medium mb-4">Quick Security Actions</h2>

              <div className="space-y-3">
                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-sm">Password</p>
                    <p className="text-xs text-gray-500">
                      Update your password
                    </p>
                  </div>
                  <button className="border rounded-md px-3 py-1 text-sm">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between border rounded-lg p-4">
                  <div>
                    <p className="font-medium text-sm">Sign out</p>
                    <p className="text-xs text-gray-500">
                      Sign out from this device
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="border border-red-400 text-red-600 rounded-md px-3 py-1 text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
