import FormContainer from "@/components/FormContainer";
import { Class, Exam, Subject, Teacher } from "@prisma/client";

type ExamCardProps = {
  item: Exam & {
    lesson: {
      subject: Subject;
      class: Class;
      teacher: Teacher;
    };
  };
  role?: string;
};

export default function ExamCard({ item, role }: ExamCardProps) {
  return (
    <div className="bg-white border rounded-xl p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="font-semibold text-sm truncate">
            {item.lesson.subject.name}
          </p>

          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 shrink-0">
            {item.lesson.class.name}
          </span>
        </div>

        {role === "admin" && (
          <div className="flex gap-1 shrink-0">
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        <p className="text-[11px] text-gray-600 truncate">
          {item.lesson.teacher.name} {item.lesson.teacher.surname}
        </p>

        <span className="text-xs px-2 py-0.5 rounded-full text-gray-700 shrink-0">
          {new Intl.DateTimeFormat("en-US").format(item.startTime)}
        </span>
      </div>
    </div>
  );
}
