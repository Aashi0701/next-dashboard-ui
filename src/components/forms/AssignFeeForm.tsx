"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { Resolver } from "react-hook-form";

import { assignFeeSchema, AssignFeeSchema } from "@/lib/formValidationSchemas";
import { assignFeeAction } from "@/lib/actions";

type Props = {
  onClose: () => void;
  relatedData: {
    classes: { id: number; name: string }[];
    feeStructures: { id: number; title: string }[];
    students: { id: string; name: string }[];
  };
};

export default function AssignFeeForm({ onClose, relatedData }: Props) {
  const [isPending, startTransition] = useTransition();
  const [assignmentType, setAssignmentType] =
    useState<"CLASS" | "STUDENT">("CLASS");

  const { register, handleSubmit, reset, setValue, formState: { errors } } =
    useForm<AssignFeeSchema>({
      resolver: zodResolver(assignFeeSchema) as Resolver<AssignFeeSchema>,
      defaultValues: { assignmentType: "CLASS" },
    });

  useEffect(() => {
    setValue("assignmentType", assignmentType);
    if (assignmentType === "CLASS") setValue("studentId", undefined);
    else setValue("classId", undefined);
  }, [assignmentType, setValue]);

  const onSubmit = (values: AssignFeeSchema) => {
    startTransition(async () => {
        const res = await assignFeeAction(values);

        if (res?.error) {
        toast.error(res.error);
        return; // ✅ returns void
        }

        toast.success("Fee assigned successfully");
        reset();
        onClose();
    });
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Assign Fee</h2>
        <p className="text-sm text-gray-500 mt-1">
          Assign a fee structure to a class or an individual student
        </p>
      </div>

      <hr />

      {/* ASSIGNMENT TYPE */}
      <div className="flex gap-6">
        {(["CLASS", "STUDENT"] as const).map((type) => (
          <label key={type} className="flex items-center gap-2 text-sm font-medium">
            <input
              type="radio"
              checked={assignmentType === type}
              onChange={() => setAssignmentType(type)}
              className="accent-purple-600 scale-110"
            />
            {type === "CLASS" ? "Class" : "Student"}
          </label>
        ))}
      </div>

      {/* FORM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {assignmentType === "CLASS" && (
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>
            <select
              {...register("classId", { valueAsNumber: true })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            >
              <option value="">Select Class</option>
              {relatedData.classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.classId && (
              <p className="text-xs text-red-500 mt-1">{errors.classId.message}</p>
            )}
          </div>
        )}

        {assignmentType === "STUDENT" && (
          <div>
            <label className="block text-sm font-medium mb-1">Student</label>
            <select
              {...register("studentId")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            >
              <option value="">Select Student</option>
              {relatedData.students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Fee Structure</label>
          <select
            {...register("feeStructureId", { valueAsNumber: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          >
            <option value="">Select Fee</option>
            {relatedData.feeStructures.map((f) => (
              <option key={f.id} value={f.id}>{f.title}</option>
            ))}
          </select>
          {errors.feeStructureId && (
            <p className="text-xs text-red-500 mt-1">{errors.feeStructureId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Due Date <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="date"
            {...register("dueDate", { valueAsDate: true })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
      </div>

      <hr />

      {/* FOOTER */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2 rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
        >
          {isPending ? "Assigning..." : "Assign Fee"}
        </button>
      </div>
    </form>
  );
}
