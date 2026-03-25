"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  assignmentSchema,
  AssignmentFormValues,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment, ActionState } from "@/lib/actions";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import RadixDateTimePicker from "@/components/ui/RadixDateTimePicker";
import RadixSelect from "@/components/ui/RadixSelect";
import CollapsibleSection from "../CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

type Section = "details" | "schedule";

export default function AssignmentForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: AssignmentFormValues;
  close: () => void;
  relatedData?: {
    lessons: {
      id: number;
      name: string;
      classId: number;
      className: string;
    }[];
  };
}) {
  const router = useRouter();
  const lessons = relatedData?.lessons ?? [];

  const [openSection, setOpenSection] = useState<Section>("details");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  /* ================= FORM ================= */

  const methods = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      lessonId: data?.lessonId ?? 0, // ✅ FIX: no undefined
      startDate: data?.startDate ? new Date(data.startDate) : undefined,
      dueDate: data?.dueDate ? new Date(data.dueDate) : undefined,
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, submitCount, isSubmitting },
  } = methods;

  /* ================= DERIVED DATA ================= */

  // ✅ Filter lessons based on selected class
  const filteredLessons = selectedClassId
    ? lessons.filter((l) => l.classId === selectedClassId)
    : [];

  // ✅ Unique class list
  const classOptions = Array.from(
    new Map(lessons.map((l) => [l.classId, l.className])).entries()
  ).map(([id, name]) => ({
    value: String(id),
    label: name,
  }));

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, AssignmentFormValues>(
    type === "create" ? createAssignment : updateAssignment,
    { success: false }
  );

  /* ================= AUTO SET CLASS (EDIT MODE) ================= */

  useEffect(() => {
    if (data?.lessonId && lessons.length) {
      const lesson = lessons.find((l) => l.id === data.lessonId);
      if (lesson) {
        setSelectedClassId(lesson.classId);
      }
    }
  }, [data, lessons]);

  /* ================= AUTO-OPEN ERROR ================= */

  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      if (errors.title || errors.lessonId) {
        setOpenSection("details");
      } else if (errors.startDate || errors.dueDate) {
        setOpenSection("schedule");
      }

      requestAnimationFrame(() => {
        const firstErrorField = Object.keys(errors)[0];
        document
          .querySelector(`[name="${firstErrorField}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [errors, submitCount]);

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Assignment ${type === "create" ? "created" : "updated"} successfully`
      );
      close();
      router.refresh();
    }

    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[60vh] max-h-[75vh]">
        {/* ===== HEADER ===== */}
        <div className="shrink-0 px-4 sm:px-6 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Assignment" : "Update Assignment"}
          </h1>
          <p className="text-xs text-gray-500">
            Assignment details and schedule
          </p>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* DETAILS */}
          <CollapsibleSection
            title="Assignment Details"
            description="Title, class and lesson mapping"
            icon="📝"
            open={openSection === "details"}
            onToggle={() => setOpenSection("details")}
          >
            <div className="space-y-4">
              <InputField label="Assignment Title" name="title" />

              {/* CLASS DROPDOWN */}
              <RadixSelect
                value={selectedClassId ? String(selectedClassId) : ""}
                onChange={(v) => {
                  const classId = Number(v);
                  setSelectedClassId(classId);

                  // ✅ reset lesson safely
                  setValue("lessonId", 0, { shouldValidate: true });
                }}
                placeholder="Select Class"
                options={classOptions}
              />

              {/* LESSON DROPDOWN */}
              <RadixSelect
                value={watch("lessonId") ? String(watch("lessonId")) : ""}
                onChange={(v) =>
                  setValue("lessonId", Number(v), {
                    shouldValidate: true,
                  })
                }
                placeholder={
                  selectedClassId
                    ? "Select Lesson"
                    : "Select class first"
                }
                options={filteredLessons.map((l) => ({
                  value: String(l.id),
                  label: l.name,
                }))}
                disabled={!selectedClassId}
              />
            </div>
          </CollapsibleSection>

          {/* SCHEDULE */}
          <CollapsibleSection
            title="Schedule"
            description="Start and due date"
            icon="⏰"
            open={openSection === "schedule"}
            onToggle={() => setOpenSection("schedule")}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <RadixDateTimePicker
                value={watch("startDate")}
                onChange={(d) =>
                  setValue("startDate", d, {
                    shouldValidate: true,
                  })
                }
                placeholder="Start date & time"
              />

              <RadixDateTimePicker
                value={watch("dueDate")}
                onChange={(d) =>
                  setValue("dueDate", d, {
                    shouldValidate: true,
                  })
                }
                placeholder="Due date & time"
              />
            </div>
          </CollapsibleSection>

          {/* ERROR MESSAGE */}
          {submitCount > 0 && Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">
              Please fix the highlighted fields before saving.
            </div>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="shrink-0 border-t bg-white px-4 sm:px-6 py-3">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="px-3 py-1.5 text-xs text-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : type === "create"
                ? "Create Assignment"
                : "Update Assignment"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}