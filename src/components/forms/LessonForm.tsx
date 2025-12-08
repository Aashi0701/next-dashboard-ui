"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
    subjects: { id: number; name: string }[];
    classes: { id: number; name: string }[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema) as any,
  });

  const [state, formAction] = useActionState<
    { success: boolean; error: boolean },
    LessonSchema
  >(type === "create" ? createLesson : updateLesson, {
    success: false,
    error: false,
  });

  const onSubmit = handleSubmit((formData) => {
    const payload: any = {
      ...formData,
      startTime: new Date(formData.startTime as any),
      endTime: new Date(formData.endTime as any),
    };

    if (type === "update" && data?.id) payload.id = data.id;

    startTransition(() => {
      formAction(payload);
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Lesson ${type === "create" ? "created" : "updated"} successfully`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { teachers = [], subjects = [], classes = [] } = relatedData || {};

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-xl font-semibold">Create a new lesson</h1>
        <p className="text-sm text-gray-500">
          Configure lesson schedule, subject and teacher
        </p>
      </div>

      <div className="border-b" />

      {/* LESSON NAME */}
      <div>
        <InputField
          label="Lesson name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
      </div>

      {/* SCHEDULE */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Schedule</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Day */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Day</label>
            <select
              className="form-select"
              {...register("day")}
              defaultValue={data?.day ?? "MONDAY"}
            >
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
            </select>
          </div>

          {/* Start Time */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Start time</label>
            <input
              type="datetime-local"
              {...register("startTime")}
              defaultValue={
                data?.startTime
                  ? new Date(data.startTime).toISOString().slice(0, 16)
                  : undefined
              }
              className="form-input"
            />
          </div>

          {/* End Time */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">End time</label>
            <input
              type="datetime-local"
              {...register("endTime")}
              defaultValue={
                data?.endTime
                  ? new Date(data.endTime).toISOString().slice(0, 16)
                  : undefined
              }
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* ASSIGNMENT */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Assignment</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Subject */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Subject</label>
            <select
              {...register("subjectId")}
              defaultValue={data?.subjectId ?? ""}
              className="form-select"
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Class</label>
            <select
              {...register("classId")}
              defaultValue={data?.classId ?? ""}
              className="form-select"
            >
              <option value="">Select Class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Teacher</label>
            <select
              {...register("teacherId")}
              defaultValue={data?.teacherId ?? ""}
              className="form-select"
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.surname}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-500">
          Something went wrong. Please try again.
        </p>
      )}

      {/* ACTION */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-sm transition"
      >
        Create Lesson
      </button>
    </form>
  );
};

export default LessonForm;
