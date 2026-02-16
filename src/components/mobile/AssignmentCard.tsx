import FormContainer from "@/components/FormContainer";
import { Assignment, Class, Subject, Teacher } from "@prisma/client";

type Props = {
  item: Assignment & {
    lesson: {
      subject: Subject;
      class: Class;
      teacher: Teacher;
    };
  };
  role?: string;
};

export default function AssignmentCard({ item, role }: Props) {
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
            Due: {new Intl.DateTimeFormat("en-US").format(item.dueDate)}
          </p>
        </div>

        {/* ACTIONS */}
        {(role === "admin" || role === "teacher") && (
          <div className="flex items-center gap-2">
            <FormContainer table="assignment" type="update" data={item} />
            <FormContainer table="assignment" type="delete" id={item.id} />
          </div>
        )}
      </div>
    </div>
  );
}
