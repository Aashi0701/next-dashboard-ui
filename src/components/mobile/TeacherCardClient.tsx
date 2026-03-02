"use client";

import Image from "next/image";
import Link from "next/link";
import { Teacher } from "@prisma/client";
import ActionMenuClient, { ActionType } from "@/components/ui/ActionMenuClient";
import { useRouter, useSearchParams } from "next/navigation";

export default function TeacherCardClient({
  item,
  role,
}: {
  item: Teacher;
  role?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const onAction = (action: ActionType) => {
    const q = new URLSearchParams(params.toString());
    q.set("action", action);
    q.set("id", String(item.id));
    router.push(`?${q.toString()}`);
  };

  return (
    <div className="bg-white border rounded-xl px-3 py-3 shadow-sm w-full">
      <div className="flex items-center gap-2 min-w-0">
        {/* Avatar */}
        <div className="shrink-0">
          <Image
            src={item.img || "/noAvatar.png"}
            alt={item.name}
            width={36}
            height={36}
            className="w-9 h-9 rounded-full object-cover"
          />
        </div>

        {/* Name & Email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {item.name}
          </p>
          <p className="text-[11px] text-gray-500 truncate">
            {item.email}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* View */}
          <Link href={`/list/teachers/${item.id}`}>
            <button
              type="button"
              aria-label="View teacher"
              className="
                h-7 w-7
                flex items-center justify-center
                rounded-full
                bg-lamaSky
                hover:opacity-90
              "
            >
              <Image src="/eye.png" alt="" width={14} height={14} />
            </button>
          </Link>

          {/* Menu */}
          {role === "admin" && (
            <ActionMenuClient onAction={onAction} />
          )}
        </div>
      </div>
    </div>
  );
}