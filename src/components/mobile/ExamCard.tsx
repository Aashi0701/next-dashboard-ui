import { Class, Exam, Subject, Teacher } from "@prisma/client";
import ExamCardClient from "./ExamCardClient";
import FormContainer from "@/components/FormContainer";

type ExamWithLesson = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

export default function ExamCard({
  item,
  role,
  action,
}: {
  item: ExamWithLesson;
  role?: string;
  action?: "edit" | "delete";
}) {
  return (
    <>
      {/* CLIENT UI */}
      <ExamCardClient item={item} role={role} />

      {/* SERVER MODALS (URL-DRIVEN) */}
      {action === "edit" && (
        <FormContainer
          key={`edit-${item.id}`}
          table="exam"
          type="update"
          id={item.id}
          data={item}
          trigger={null}
        />
      )}

      {action === "delete" && (
        <FormContainer
          key={`delete-${item.id}`}
          table="exam"
          type="delete"
          id={item.id}
          trigger={null}
        />
      )}
    </>
  );
}