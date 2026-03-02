"use client";

import ActionMenuClient, { ActionType } from "@/components/ui/ActionMenuClient";
import { Assignment, Class, Subject, Teacher } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";

type AssignmentWithLesson = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

export default function AssignmentCardClient({
  item,
  role,
}: {
  item: AssignmentWithLesson;
  role?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const onAction = (action: ActionType) => {
    const q = new URLSearchParams(params.toString());
    q.set("action", action);
    q.set("id", String(item.id));

    // force RSC refresh
    router.push(`?${q.toString()}`);
  };

  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm">
      <div className="flex items-start gap-3">
        {/* INFO */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">
            {item.lesson.subject.name}
          </h3>

          <p className="text-[11px] text-gray-500 truncate">
            {item.lesson.class.name} •{" "}
            {item.lesson.teacher.name} {item.lesson.teacher.surname}
          </p>

          <p className="text-[11px] text-gray-600 mt-1">
            Due:{" "}
            {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
          </p>
        </div>

        {/* ACTION MENU */}
        {(role === "admin" || role === "teacher") && (
          <div className="shrink-0">
            <ActionMenuClient
              actions={["edit", "delete"]}
              onAction={onAction}
            />
          </div>
        )}
      </div>
    </div>
  );
}