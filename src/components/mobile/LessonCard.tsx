"use client";

import { Class, Lesson, Subject, Teacher } from "@prisma/client";

type LessonList = Lesson & {
  subject: Subject;
  class: Class;
  teacher: Teacher;
};

export default function LessonCard({
  item,
  actions,
}: {
  item: LessonList;
  actions?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white px-4 py-3 shadow-sm">
      {/* ROW 1: NAME + CLASS + ACTIONS */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-semibold text-sm truncate">{item.name}</p>

          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 shrink-0">
            {item.class.name}
          </span>
        </div>

        <div className="flex gap-1 shrink-0">
          {actions}
        </div>
      </div>

      {/* ROW 2: TEACHER + SUBJECT */}
      <div className="mt-1 text-xs text-gray-600 truncate">
        <span className="font-medium text-gray-900">
         Class Teacher:- {item.teacher.name}
        </span>
        {" — "}
        {item.subject.name}
      </div>
    </div>
  );
}
