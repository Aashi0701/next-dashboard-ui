"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

import {
  assignFeeSchema,
  AssignFeeFormInput,
  AssignFeeValues,
} from "@/lib/formValidationSchemas";
import { assignFeeAction } from "@/lib/actions";

import RadixSelect from "@/components/ui/RadixSelect";
import RadixDatePicker from "@/components/ui/RadixDatePicker";

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
  const [assignmentType, setAssignmentType] = useState<"CLASS" | "STUDENT">(
    "CLASS",
  );

  const {
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignFeeFormInput>({
    resolver: zodResolver(assignFeeSchema),
    defaultValues: {
      assignmentType: "CLASS",
      dueDate: undefined,
    },
  });

  /* ================= SYNC ASSIGNMENT TYPE ================= */

  useEffect(() => {
    setValue("assignmentType", assignmentType);

    if (assignmentType === "CLASS") {
      setValue("studentId", undefined);
    } else {
      setValue("classId", undefined);
    }
  }, [assignmentType, setValue]);

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(async () => {
      const parsed: AssignFeeValues = assignFeeSchema.parse(values);

      const res = await assignFeeAction({ success: false }, parsed);

      if (!res.success) {
        toast.error(res.error ?? "Failed to assign fee");
        return;
      }

      toast.success("Fee assigned successfully");
      reset();
      onClose();
    });
  });

  /* ================= UI ================= */

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
          <label
            key={type}
            className="flex items-center gap-2 text-sm font-medium"
          >
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
        {/* CLASS */}
        {assignmentType === "CLASS" && (
          <div>
            <label className="block text-sm font-medium mb-1">Class</label>

            <RadixSelect
              placeholder="Select Class"
              value={
                watch("classId") !== undefined
                  ? String(watch("classId"))
                  : undefined
              }
              onChange={(v) =>
                setValue("classId", v ? Number(v) : undefined, {
                  shouldValidate: true,
                })
              }
              options={relatedData.classes.map((c) => ({
                value: String(c.id),
                label: c.name,
              }))}
            />

            {errors.classId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.classId.message}
              </p>
            )}
          </div>
        )}

        {/* STUDENT */}
        {assignmentType === "STUDENT" && (
          <div>
            <label className="block text-sm font-medium mb-1">Student</label>

            <RadixSelect
              placeholder="Select Student"
              value={watch("studentId") ?? undefined}
              onChange={(v) =>
                setValue("studentId", v, {
                  shouldValidate: true,
                })
              }
              options={relatedData.students.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />

            {errors.studentId && (
              <p className="text-xs text-red-500 mt-1">
                {errors.studentId.message}
              </p>
            )}
          </div>
        )}

        {/* FEE STRUCTURE */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Fee Structure
          </label>

          <RadixSelect
            placeholder="Select Fee"
            value={
              watch("feeStructureId") !== undefined
                ? String(watch("feeStructureId"))
                : undefined
            }
            onChange={(v) =>
              setValue("feeStructureId", Number(v), {
                shouldValidate: true,
              })
            }
            options={relatedData.feeStructures.map((f) => ({
              value: String(f.id),
              label: f.title,
            }))}
          />

          {errors.feeStructureId && (
            <p className="text-xs text-red-500 mt-1">
              {errors.feeStructureId.message}
            </p>
          )}
        </div>

        {/* DUE DATE */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Due Date <span className="text-gray-400">(optional)</span>
          </label>

          <RadixDatePicker
            value={watch("dueDate") as Date | undefined}
            onChange={(d) =>
              setValue("dueDate", d, {
                shouldValidate: true,
              })
            }
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
