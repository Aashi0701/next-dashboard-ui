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
  deleteHoliday,
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
import ModalPortal from "./ModalPortal";

type TableKey = FormContainerProps["table"];
type MutationType = "create" | "update";
type ServerAction = (prev: any, formData: FormData) => Promise<any>;

type FormFactory = (
  setOpen: Dispatch<SetStateAction<boolean>>,
  type?: MutationType,
  data?: any,
  relatedData?: any,
) => JSX.Element;

const deleteActionMap: Partial<Record<TableKey, ServerAction>> = {
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
  holiday: deleteHoliday,
  fee: deleteFee,
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
const HolidayForm = dynamic(() => import("./forms/HolidayForm"));
const ProfileForm = dynamic(() => import("./forms/ProfileForm"));

/* ------------------------------------------------------------------ */
/* FORM FACTORY MAP */
/* ------------------------------------------------------------------ */

const forms: Record<TableKey, FormFactory> = {
  subject: (s, t, d, r) => (
    <SubjectForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  class: (s, t, d, r) => (
    <ClassForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  teacher: (s, t, d, r) => (
    <TeacherForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  student: (s, t, d, r) => (
    <StudentForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  parent: (s, t, d, r) => (
    <ParentForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  exam: (s, t, d, r) => (
    <ExamForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  lesson: (s, t, d, r) => (
    <LessonForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  assignment: (s, t, d, r) => (
    <AssignmentForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  result: (s, t, d, r) => (
    <ResultForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  attendance: (s, t, d, r) => (
    <AttendanceForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  event: (s, t, d, r) => (
    <EventForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  announcement: (s, t, d, r) => (
    <AnnouncementForm {...{ setOpen: s, type: t!, data: d, relatedData: r }} />
  ),
  holiday: (s, t, d) => <HolidayForm type={t!} data={d} setOpen={s} />,
  fee: (s, t, d, r) => (
    <FeeForm type={t!} data={d} relatedData={r} close={() => s(false)} />
  ),
  payment: (s, _t, d) => <CollectPaymentForm data={d} close={() => s(false)} />,

  /* ✅ PROFILE — FIXED */
  profile: (s, _t, _d, r) => (
    <ProfileForm
      relatedData={r}
      setOpen={(v: boolean) => {
        if (!v) {
          s(false);
        }
      }}
    />
  ),
};

const iconMap: Record<string, string> = {
  create: "/createnew.png",
  update: "/update.png",
  delete: "/bin.png",
  assign: "/assignment.png",
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
    "w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition hover:scale-105";

  const iconStyle =
    type === "create"
      ? "bg-purple-500 hover:bg-blue-600"
      : type === "update"
        ? "bg-green-300 hover:bg-blue-600"
        : type === "assign"
          ? "bg-yellow-300 hover:bg-blue-600"
          : "bg-orange-300 hover:bg-blue-600";

  const Form = () => {
    /* 🚫 PROFILE CANNOT BE DELETED */
    if (type === "delete" && table === "profile") {
      return null;
    }

    /* DELETE */
    if (type === "delete" && id) {
      const action = deleteActionMap[table];
      if (!action) return null;

      return (
        <DeleteForm
          table={table}
          id={String(id)}
          action={action}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
        />
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
      {/* TRIGGER (UNCHANGED) */}
      <div
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center leading-none cursor-pointer"
      >
        {trigger ?? (
          <button className={`${iconBase} ${iconStyle}`}>
            <Image src={iconMap[type]} alt={type} width={14} height={14} />
          </button>
        )}
      </div>

      {open && (
        <ModalPortal>
          <div className="fixed inset-0 z-[9999] bg-black/60 flex items-end sm:items-center justify-center">
            {/* MODAL CONTAINER */}
            <div
              className="
          relative
          w-full
          sm:max-w-xl md:max-w-2xl
          bg-white
          rounded-t-2xl sm:rounded-2xl
          shadow-xl
          max-h-[90vh]
          overflow-y-auto
          p-4 sm:p-6
        "
            >
              {/* MOBILE HANDLE */}
              <div className="sm:hidden flex justify-center mb-2">
                <div className="w-10 h-1.5 rounded-full bg-gray-300" />
              </div>

              <Form />

            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
};

export default FormModal;

function DeleteForm({
  table,
  id,
  action,
  onSuccess,
}: {
  table: TableKey;
  id: string;
  action: ServerAction;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState(action, {
    success: false,
    error: false,
  });

  useEffect(() => {
    if (state.success) {
      toast(`${table} deleted successfully`);
      onSuccess();
    }
  }, [state, table, onSuccess]);

  return (
    <form action={formAction} className="p-4 flex flex-col gap-4">
      <input type="hidden" name="id" value={id} />
      <p className="text-center font-medium">
        This {table} will be deleted permanently. Confirm?
      </p>
      <button className="bg-red-600 text-white py-2 rounded-md">Delete</button>
    </form>
  );
}
