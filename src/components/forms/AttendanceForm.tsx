"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction } from "react";
import {
  attendanceSchema,
  AttendanceSchema,
} from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { toast } from "react-toastify";
import { z } from "zod";

export default function AttendanceForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: any;
}) {
  const { students, lessons } = relatedData;

  // IMPORTANT — use z.input<typeof schema> (input types)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof attendanceSchema>>({
    resolver: zodResolver(attendanceSchema),

    defaultValues: {
      id: data?.id,
      studentId: data?.studentId ?? "",
      lessonId: data?.lessonId?.toString() ?? "",
      date: data?.date
        ? data.date.split("T")[0]
        : new Date().toISOString().split("T")[0],
      present: data?.present ? "true" : "false",
    },
  });

  const submitHandler = async (values: z.input<typeof attendanceSchema>) => {
    // Convert into FINAL schema format
    const validated = attendanceSchema.parse(values);

    const action = type === "create" ? createAttendance : updateAttendance;

    const result = await action(validated);

    if (result.success) {
      toast("Attendance saved successfully");
      setOpen(false);
    } else {
      toast.error(result.error || "Failed to save attendance");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="flex flex-col gap-4 p-4"
    >
      <h2 className="text-lg font-semibold">
        {type === "create" ? "Create Attendance" : "Update Attendance"}
      </h2>

      {/* STUDENT */}
      <div>
        <label className="text-sm">Student</label>
        <select {...register("studentId")} className="border p-2 rounded w-full">
          <option value="">Select</option>
          {students.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name} {s.surname}
            </option>
          ))}
        </select>
        {errors.studentId && (
          <p className="text-red-500 text-xs">{errors.studentId.message}</p>
        )}
      </div>

      {/* LESSON */}
      <div>
        <label className="text-sm">Lesson</label>
        <select {...register("lessonId")} className="border p-2 rounded w-full">
          <option value="">Select</option>
          {lessons.map((l: any) => (
            <option key={l.id} value={l.id.toString()}>
              {l.subject?.name} / {l.class?.name}
            </option>
          ))}
        </select>
        {errors.lessonId && (
          <p className="text-red-500 text-xs">{errors.lessonId.message}</p>
        )}
      </div>

      {/* DATE */}
      <div>
        <label className="text-sm">Date</label>
        <input type="date" {...register("date")} className="border p-2 rounded w-full" />
        {errors.date && (
          <p className="text-red-500 text-xs">{errors.date.message}</p>
        )}
      </div>

      {/* STATUS */}
      <div>
        <label className="text-sm">Status</label>
        <select {...register("present")} className="border p-2 rounded w-full">
          <option value="true">Present</option>
          <option value="false">Absent</option>
        </select>
      </div>

      <button className="bg-blue-600 text-white rounded p-2">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
}
