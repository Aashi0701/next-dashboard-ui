import FormContainer from "@/components/FormContainer";
import { Class, Teacher } from "@prisma/client";

type ClassList = Class & { supervisor: Teacher | null };

export default function ClassCard({
  item,
  role,
}: {
  item: ClassList;
  role?: string;
}) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">
            {item.name}
          </h2>

          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[11px] rounded-full bg-blue-50 text-blue-700 font-medium">
            Cap {item.capacity}
          </span>
        </div>

        {role === "admin" && (
          <div className="flex items-center gap-2">
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-3 h-px bg-gray-100" />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-500">Supervisor:</span>
          <span className="truncate max-w-[180px]">
            {item.supervisor
              ? `${item.supervisor.name} ${item.supervisor.surname}`
              : "Not assigned"}
          </span>
        </div>
      </div>
    </div>
  );
}
