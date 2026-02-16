import FormContainer from "@/components/FormContainer";
import { Parent, Student } from "@prisma/client";

type ParentCardProps = {
  parent: Parent & {
    students: Student[];
  };
  role?: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ParentCard({ parent, role }: ParentCardProps) {
  const visibleChildren = parent.students.slice(0, 2);
  const extraCount = parent.students.length - visibleChildren.length;

  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-3">
        {/* ===== AVATAR (INITIALS) ===== */}
        <div className="
          w-10 h-10
          rounded-full
          bg-purple-100
          text-purple-700
          flex items-center justify-center
          text-sm font-semibold
          shrink-0
        ">
          {getInitials(parent.name)}
        </div>

        {/* ===== INFO ===== */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {parent.name}
          </h3>

          <p className="text-[11px] text-gray-500 truncate">
            {parent.email}
          </p>

          {parent.students.length > 0 && (
            <p className="text-[11px] text-gray-600 truncate">
              {visibleChildren.map((s) => s.name).join(", ")}
              {extraCount > 0 && (
                <span className="ml-1 text-gray-400">
                  +{extraCount} more
                </span>
              )}
            </p>
          )}
        </div>

        {/* ===== ACTIONS (INLINE RIGHT) ===== */}
        {role === "admin" && (
          <div className="flex items-center gap-2">
            <FormContainer
              table="parent"
              type="update"
              data={parent}
            />
            <FormContainer
              table="parent"
              type="delete"
              id={parent.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
