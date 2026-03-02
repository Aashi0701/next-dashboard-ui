import FormContainer from "@/components/FormContainer";
import AssignmentCardClient from "./AssignmentCardClient";
import { Assignment, Class, Subject, Teacher } from "@prisma/client";

type AssignmentWithLesson = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

export default function AssignmentCard({
  item,
  role,
  action,
}: {
  item: AssignmentWithLesson;
  role?: string;
  action?: "edit" | "delete";
}) {
  return (
    <>
      {/* CLIENT UI */}
      <AssignmentCardClient item={item} role={role} />

      {/* SERVER-SIDE MODALS */}
      {action === "edit" && (
        <FormContainer
          key={`edit-${item.id}`}
          table="assignment"
          type="update"
          data={item}
          id={item.id}
          trigger={null}
        />
      )}

      {action === "delete" && (
        <FormContainer
          key={`delete-${item.id}`}
          table="assignment"
          type="delete"
          id={item.id}
          trigger={null}
        />
      )}
    </>
  );
}