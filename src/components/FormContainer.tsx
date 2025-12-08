import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

type FormType = "create" | "update" | "delete" | "assign";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "fee"
    | "payment" ;
  type: FormType;
  data?: any;
  id?: number | string;
  relatedData?: any;
  trigger?: React.ReactNode; // ✅ ADD THIS
};

const FormContainer = async ({ table, type, data, id, trigger }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        relatedData = {
          teachers: await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          }),
        };
        break;

      case "class":
        relatedData = {
          teachers: await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          }),
          grades: await prisma.grade.findMany({
            select: { id: true, level: true },
          }),
        };
        break;

      case "teacher":
        relatedData = {
          subjects: await prisma.subject.findMany({
            select: { id: true, name: true },
          }),
        };
        break;

      case "student":
        relatedData = {
          classes: await prisma.class.findMany({
            include: { _count: { select: { students: true } } },
          }),
          grades: await prisma.grade.findMany({
            select: { id: true, level: true },
          }),
          parents: await prisma.parent.findMany({
            select: { id: true, name: true, surname: true, phone: true },
          }),
        };
        break;

      case "exam":
        relatedData = {
          lessons: await prisma.lesson.findMany({
            where: role === "teacher" ? { teacherId: currentUserId! } : {},
            select: { id: true, name: true },
          }),
        };
        break;

      case "lesson":
        relatedData = {
          subjects: await prisma.subject.findMany({
            select: { id: true, name: true },
          }),
          classes: await prisma.class.findMany({
            select: { id: true, name: true },
          }),
          teachers: await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
          }),
        };
        break;

      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: role === "teacher" ? { teacherId: currentUserId! } : {},
          select: { id: true, name: true },
        });
        relatedData = { lessons: assignmentLessons };
        break;

      case "result":
        relatedData = {
          students: await prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          }),
          exams: await prisma.exam.findMany({
            select: { id: true, title: true },
          }),
          assignments: await prisma.assignment.findMany({
            select: { id: true, title: true },
          }),
        };
        break;

      case "event":
        relatedData = {
          classes: await prisma.class.findMany({
            select: { id: true, name: true },
          }),
        };
        break;

      case "announcement":
        relatedData = {
          classes: await prisma.class.findMany({
            select: { id: true, name: true },
          }),
        };
        break;
      
      case "attendance":
        relatedData = {
          students: await prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          }),
          lessons: await prisma.lesson.findMany({
            select: {
              id: true,
              subject: { select: { name: true } },
              class: { select: { name: true } },
            },
            orderBy: { id: "asc" },
          }),
        };
        break;

      case "parent":
        relatedData = {};
        break;

      case "fee":
        relatedData = {
          classes: await prisma.class.findMany({
            select: { id: true, name: true },
            orderBy: { name: "asc" },
          }),
          students: await prisma.student.findMany({
            select: { id: true, name: true },
          }),
          feeStructures: await prisma.feeStructure.findMany({
            where: { isActive: true },
            select: { id: true, title: true },
          }),
        };
        break;

      case "payment":
        relatedData = {
          students: await prisma.student.findMany({
            select: { id: true, name: true, surname: true },
          }),
        };
        break;

      default:
        break;
    }
  }

  return (
  <>
    {trigger && (
      <div className="inline-block">
        <FormModal
          table={table}
          type={type}
          data={data}
          id={id}
          relatedData={relatedData}
          trigger={trigger}
        />
      </div>
    )}

    {!trigger && (
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    )}
  </>
);
};

export default FormContainer;
