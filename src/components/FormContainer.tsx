import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";
import React from "react";

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
    | "holiday"
    | "fee"
    | "payment"
    | "profile";
  type: FormType;
  data?: any;
  id?: number | string;
  relatedData?: {
    subjects?: { id: number; name: string }[];
    classes?: { id: number; name: string }[];
  };
  trigger?: React.ReactNode;
  tooltip?: string;
};

/* ---------------------------------------------------------------
   MAIN COMPONENT
---------------------------------------------------------------- */
const FormContainer = async ({
  table,
  type,
  data,
  id,
  trigger,
  tooltip,
}: FormContainerProps) => {
  let relatedData: any = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  /* ---------------------------------------------------------------
     BUILD RELATED DATA BASED ON TABLE
  ---------------------------------------------------------------- */
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
        relatedData = {
          lessons: await prisma.lesson.findMany({
            where: role === "teacher" ? { teacherId: currentUserId! } : {},
            select: { id: true, name: true },
          }),
        };
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
      case "announcement":
        relatedData = {
          classes: await prisma.class.findMany({
            select: { id: true, name: true },
          }),
        };
        break;

      case "holiday":
        relatedData = {};
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

      case "profile":
        if (!currentUserId || !role) break;

        if (role === "admin") {
          relatedData = {
            profile: await prisma.admin.findUnique({
              where: { id: currentUserId },
            }),
          };
        }

        if (role === "teacher") {
          relatedData = {
            profile: await prisma.teacher.findUnique({
              where: { id: currentUserId },
            }),
          };
        }

        if (role === "student") {
          relatedData = {
            profile: await prisma.student.findUnique({
              where: { id: currentUserId },
              include: {
                class: { select: { name: true } },
              },
            }),
          };
        }

        if (role === "parent") {
          relatedData = {
            profile: await prisma.parent.findUnique({
              where: { id: currentUserId },
              include: {
                students: { select: { name: true, surname: true } },
              },
            }),
          };
        }
        break;

      default:
        break;
    }
  }

  const content = (
  <FormModal
    table={table}
    type={type}
    data={data}
    id={id}
    relatedData={relatedData}
    trigger={trigger} 
  />
);

  return tooltip ? (
    <div className="relative inline-block group">
      {/* Tooltip bubble (desktop hover only) */}
      <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 hidden whitespace-nowrap rounded-md bg-black px-2 py-1 text-[10px] text-white group-hover:block">
        {tooltip}
      </span>

      {content}
    </div>
  ) : (
    <>{content}</>
  );
};

export default FormContainer;
