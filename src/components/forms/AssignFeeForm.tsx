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
import ModalCloseButton from "@/components/ui/ModalCloseButton";

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

  useEffect(() => {
    setValue("assignmentType", assignmentType);
    assignmentType === "CLASS"
      ? setValue("studentId", undefined)
      : setValue("classId", undefined);
  }, [assignmentType, setValue]);

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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      {/* HEADER */}
      <div className="relative text-center">
        <div className="absolute right-0 top-0">
          <ModalCloseButton onClose={onClose} />
        </div>

        <h2 className="text-base font-semibold">Assign Fee</h2>
        <p className="text-xs text-gray-500 mt-1">
          Assign a fee structure to a class or an individual student
        </p>
      </div>

      {/* SEGMENTED CONTROL (MOBILE FRIENDLY) */}
      <div className="flex rounded-lg bg-gray-100 p-1">
        {(["CLASS", "STUDENT"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setAssignmentType(type)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition
              ${
                assignmentType === type
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500"
              }`}
          >
            {type === "CLASS" ? "Class" : "Student"}
          </button>
        ))}
      </div>

      {/* FORM FIELDS */}
      <div className="grid grid-cols-1 gap-4">
        {assignmentType === "CLASS" && (
          <div>
            <label className="text-sm font-medium">Class</label>
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

        {assignmentType === "STUDENT" && (
          <div>
            <label className="text-sm font-medium">Student</label>
            <RadixSelect
              placeholder="Select Student"
              value={watch("studentId") ?? undefined}
              onChange={(v) =>
                setValue("studentId", v, { shouldValidate: true })
              }
              options={relatedData.students.map((s) => ({
                value: s.id,
                label: s.name,
              }))}
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium">Fee Structure</label>
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
        </div>

        <div>
          <label className="text-sm font-medium">
            Due Date <span className="text-gray-400">(optional)</span>
          </label>
          <RadixDatePicker
            value={watch("dueDate") as Date | undefined}
            onChange={(d) =>
              setValue("dueDate", d, { shouldValidate: true })
            }
          />
        </div>
      </div>

      {/* STICKY FOOTER */}
      <div className="sticky bottom-0 bg-white pt-3 border-t flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2 rounded-md border text-sm"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 rounded-md text-sm font-medium text-white bg-purple-600 disabled:opacity-60"
        >
          {isPending ? "Assigning..." : "Assign Fee"}
        </button>
      </div>
    </form>
  );
}