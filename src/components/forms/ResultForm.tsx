"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { createResult, updateResult } from "@/lib/actions";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { toast } from "react-toastify";
import InputField from "../InputField";
import { useRouter } from "next/navigation";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema) as any,
  });

  const [state, formAction] = useActionState(
    type === "create" ? createResult : updateResult,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => formAction(formData));
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Result has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  const { students, exams, assignments } = relatedData;

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Result" : "Update Result"}
      </h1>

      <InputField
        label="Score"
        name="score"
        defaultValue={data?.score}
        register={register}
        error={errors?.score}
      />

      {/* Student Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Student</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md"
          {...register("studentId")}
          defaultValue={data?.studentId ?? ""}
        >
          <option value="">Select Student</option>
          {students.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.surname}
            </option>
          ))}
        </select>
        {errors.studentId && (
          <p className="text-xs text-red-400">{errors.studentId.message}</p>
        )}
      </div>

      {/* Exam Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Exam</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md"
          {...register("examId")}
          defaultValue={data?.examId ?? ""}
        >
          <option value="">Select Exam</option>
          {exams.map((e: any) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </div>

      {/* Assignment Dropdown */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Assignment</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md"
          {...register("assignmentId")}
          defaultValue={data?.assignmentId ?? ""}
        >
          <option value="">Select Assignment</option>
          {assignments.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.title}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p className="text-red-500">Something went wrong!</p>
      )}

      <button className="bg-blue-500 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ResultForm;
