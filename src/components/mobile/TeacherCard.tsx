import Image from "next/image";
import Link from "next/link";
import FormContainer from "@/components/FormContainer";
import { Teacher } from "@prisma/client";

type TeacherCardProps = {
  item: Teacher;
  role?: string;
};

export default function TeacherCard({ item, role }: TeacherCardProps) {
  return (
    <div className="bg-white border rounded-xl px-2 sm:px-4 py-3 shadow-sm w-full overflow-hidden">

      {/* IMPORTANT: max-w-full + overflow-hidden */}
      <div className="flex items-center gap-1 w-full max-w-full">
        
        {/* Avatar (fixed size, no shrink) */}
        <div className="shrink-0">
          <Image
            src={item.img || "/noAvatar.png"}
            alt={item.name}
            width={44}
            height={44}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>

        {/* Name & Email (allowed to shrink) */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {item.name}
          </h3>
          <p className="text-[11px] text-gray-500 truncate">
            {item.email}
          </p>
        </div>

        {/* Actions (never grow, never push layout) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/list/teachers/${item.id}`}>
            <button className="w-6 h-6 flex items-center justify-center rounded-full bg-lamaSky">
              <Image src="/eye.png" alt="View" width={14} height={14} />
            </button>
          </Link>

          {role === "admin" && (
            <div className="shrink-0">
              <FormContainer
                table="teacher"
                type="delete"
                id={item.id}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
