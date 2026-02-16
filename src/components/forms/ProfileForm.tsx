"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateAdminProfile,
  updateTeacherProfile,
} from "@/lib/actions";

export default function ProfileForm({
  relatedData,
  setOpen,
}: {
  relatedData: any;
  setOpen: (v: boolean) => void;
}) {
  const profile = relatedData.profile;

  const isAdmin = "username" in profile && !("name" in profile);
  const isTeacher = "name" in profile;

  const action = isAdmin
    ? updateAdminProfile
    : updateTeacherProfile;

  const closedRef = useRef(false);

  const [state, formAction] = useActionState(action, {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success && !closedRef.current) {
      closedRef.current = true;
      setOpen(false);
    }
  }, [state.success, setOpen]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Edit Profile</h2>

      <input type="hidden" name="id" value={profile.id} />

      {isAdmin && (
        <input
          name="username"
          defaultValue={profile.username}
          className="border p-2 rounded-md"
          placeholder="Username"
        />
      )}

      {isTeacher && (
        <>
          <input name="name" defaultValue={profile.name} className="border p-2 rounded-md" />
          <input name="surname" defaultValue={profile.surname} className="border p-2 rounded-md" />
          <input name="phone" defaultValue={profile.phone ?? ""} className="border p-2 rounded-md" />
        </>
      )}

      <button className="bg-blue-600 text-white py-2 rounded-md">
        Save Changes
      </button>
    </form>
  );
}
