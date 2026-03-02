"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateAdminProfile, updateTeacherProfile } from "@/lib/actions";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

type Profile =
  | {
      id: string;
      username: string;
    }
  | {
      id: string;
      name: string;
      surname: string;
      phone?: string | null;
    };

export default function ProfileForm({
  profile,
  onClose,
}: {
  profile: Profile;
  onClose: () => void;
}) {
  const isAdmin = "username" in profile;
  const isTeacher = "name" in profile;

  const action = isAdmin ? updateAdminProfile : updateTeacherProfile;

  const closedRef = useRef(false);

  const [state, formAction] = useActionState(action, {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success && !closedRef.current) {
      closedRef.current = true;
      onClose();
    }
  }, [state.success, onClose]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="relative">
        <ModalCloseButton onClose={onClose} />
        <h2 className="text-lg font-semibold">Edit Profile</h2>
      </div>

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
          <input
            name="name"
            defaultValue={profile.name}
            className="border p-2 rounded-md"
            placeholder="First name"
          />
          <input
            name="surname"
            defaultValue={profile.surname}
            className="border p-2 rounded-md"
            placeholder="Surname"
          />
          <input
            name="phone"
            defaultValue={profile.phone ?? ""}
            className="border p-2 rounded-md"
            placeholder="Phone"
          />
        </>
      )}

      <button className="bg-blue-600 text-white py-2 rounded-md">
        Save Changes
      </button>
    </form>
  );
}