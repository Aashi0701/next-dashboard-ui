"use client";

import {
  deleteAnnouncement,
  deleteAssignment,
  deleteAttendance,
  deleteClass,
  deleteExam,
  deleteLesson,
  deleteResult,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteEvent,
  deleteParent,
  deleteFee,
} from "@/lib/actions";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import AssignFeeForm from "./forms/AssignFeeForm";

type TableKey = FormContainerProps["table"];
type MutationType = "create" | "update";
type ServerAction = (prev: any, formData: FormData) => Promise<any>;

type FormFactory = (
  setOpen: Dispatch<SetStateAction<boolean>>,
  type: MutationType,
  data?: any,
  relatedData?: any
) => JSX.Element;

const deleteActionMap: Record<TableKey, ServerAction> = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  parent: deleteParent,
  exam: deleteExam,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  fee: deleteFee,
  payment: deleteFee,
};

const TeacherForm = dynamic(() => import("./forms/TeacherForm"));
const StudentForm = dynamic(() => import("./forms/StudentForm"));
const ParentForm = dynamic(() => import("./forms/ParentForm"));
const SubjectForm = dynamic(() => import("./forms/SubjectForm"));
const ClassForm = dynamic(() => import("./forms/ClassForm"));
const ExamForm = dynamic(() => import("./forms/ExamForm"));
const LessonForm = dynamic(() => import("./forms/LessonForm"));
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"));
const ResultForm = dynamic(() => import("./forms/ResultForm"));
const EventForm = dynamic(() => import("./forms/EventForm"));
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"));
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"));
const FeeForm = dynamic(() => import("./forms/FeeForm"));
const CollectPaymentForm = dynamic(() => import("./forms/CollectPaymentForm"));

const forms: Record<TableKey, FormFactory> = {
  subject: (s, t, d, r) => <SubjectForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  class: (s, t, d, r) => <ClassForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  teacher: (s, t, d, r) => <TeacherForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  student: (s, t, d, r) => <StudentForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  parent: (s, t, d, r) => <ParentForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  exam: (s, t, d, r) => <ExamForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  lesson: (s, t, d, r) => <LessonForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  assignment: (s, t, d, r) => <AssignmentForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  result: (s, t, d, r) => <ResultForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  attendance: (s, t, d, r) => <AttendanceForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  event: (s, t, d, r) => <EventForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  announcement: (s, t, d, r) => <AnnouncementForm {...{ setOpen: s, type: t, data: d, relatedData: r }} />,
  fee: (s, t, d, r) => (<FeeForm type={t} data={d} close={() => s(false)} relatedData={r} />),
  payment: (s, t, d) => (<CollectPaymentForm data={d} close={() => s(false)}/>),
};

const iconMap: Record<string, string> = {
  create: "/create.png",
  update: "/update.png",
  delete: "/delete.png",
  assign: "/assign.png",
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
  trigger,
}: FormContainerProps & { relatedData?: any; trigger?: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const iconBase =
    "w-7 h-7 flex items-center justify-center rounded-full transition hover:scale-105";

  const iconStyle =
    type === "create"
      ? "bg-yellow-400 hover:bg-yellow-500"
      : type === "update"
      ? "bg-blue-500 hover:bg-blue-600"
      : type === "assign"
      ? "bg-green-500 hover:bg-green-600"
      : "bg-red-500 hover:bg-red-600";

  const Form = () => {
    /* DELETE */
    if (type === "delete" && id) {
      const action = deleteActionMap[table];
      const [state, formAction] = useActionState(action, {
        success: false,
        error: false,
      });

      useEffect(() => {
        if (state.success) {
          toast(`${table} deleted successfully`);
          setOpen(false);
          router.refresh();
        }
      }, [state]);

      return (
        <form action={formAction} className="p-4 flex flex-col gap-4">
          <input type="hidden" name="id" value={id} />
          <p className="text-center font-medium">
            This {table} will be deleted permanently. Confirm?
          </p>
          <button className="bg-red-600 text-white py-2 rounded-md">
            Delete
          </button>
        </form>
      );
    }

    /* CREATE / UPDATE */
    if (type === "create" || type === "update") {
      return forms[table](setOpen, type, data, relatedData);
    }

    /* ASSIGN (FEE ONLY) */
    if (type === "assign" && table === "fee") {
      return (
        <AssignFeeForm
          onClose={() => setOpen(false)}
          relatedData={relatedData}
        />
      );
    }

    return null;
  };

  return (
    <>
      {/* TRIGGER */}
      <div onClick={() => setOpen(true)} className="inline-block cursor-pointer">
        {trigger ?? (
          <button className={`${iconBase} ${iconStyle}`}>
            <Image
              src={iconMap[type]}
              alt={type}
              width={14}
              height={14}
            />
          </button>
        )}
      </div>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[60%] lg:w-[45%]">
            <Form />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3"
            >
              <Image src="/close.png" alt="close" width={15} height={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
