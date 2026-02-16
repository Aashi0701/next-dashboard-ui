import FormContainer from "@/components/FormContainer";
import { Subject, Teacher } from "@prisma/client";

type SubjectList = Subject & { teachers: Teacher[] };

export default function SubjectCard({
  item,
  role,
}: {
  item: SubjectList;
  role?: string;
}) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      {/* ROW 1: SUBJECT + ACTIONS */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {item.name}
        </p>

        {role === "admin" && (
          <div className="flex gap-1 shrink-0">
            <FormContainer table="subject" type="update" data={item} />
            <FormContainer table="subject" type="delete" id={item.id} />
          </div>
        )}
      </div>

      {/* ROW 2: TEACHERS */}
      {item.teachers.length > 0 ? (
        <p className="mt-1 text-xs text-gray-600 truncate">
          <span className="font-medium text-gray-900">
            {item.teachers.map((t) => t.name).join(", ")}
          </span>
        </p>
      ) : (
        <p className="mt-1 text-xs italic text-gray-400">
          No teacher assigned
        </p>
      )}
    </div>
  );
}
