"use client";

import { useEffect, useState, startTransition, useActionState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { examSchema, ExamFormValues } from "@/lib/formValidationSchemas";
import { createExam, updateExam, ActionState } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import RadixDateTimePicker from "@/components/ui/RadixDateTimePicker";
import CollapsibleSection from "../CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

type Section = "basic" | "schedule";

const sectionFields: Record<Section, readonly (keyof ExamFormValues)[]> = {
  basic: ["title", "lessonId"],
  schedule: ["startTime", "endTime"],
};

export default function ExamForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: ExamFormValues;
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

  const [openSection, setOpenSection] = useState<Section>("basic");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  /* ================= FORM ================= */

  const methods = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema) as any,
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      lessonId: data?.lessonId ?? 0, // ✅ avoid undefined
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, submitCount, isSubmitting },
    control,
  } = methods;

  /* ================= DERIVED DATA ================= */

  const classOptions = Array.from(
    new Map(
      lessons.map((l) => [l.classId, l.className])
    ).entries()
  ).map(([id, name]) => ({
    value: String(id),
    label: name,
  }));

  const filteredLessons = selectedClassId
    ? lessons.filter((l) => l.classId === selectedClassId)
    : [];

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, ExamFormValues>(
    type === "create" ? createExam : updateExam,
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

  /* ================= AUTO ERROR SECTION ================= */

  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0] as keyof ExamFormValues;

      const section = (
        Object.entries(sectionFields) as [
          Section,
          readonly (keyof ExamFormValues)[]
        ][]
      ).find(([, fields]) => fields.includes(firstError))?.[0];

      if (section) setOpenSection(section);

      requestAnimationFrame(() => {
        document
          .querySelector(`[name="${firstError}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [errors, submitCount]);

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Exam ${type === "create" ? "created" : "updated"} successfully`
      );
      close();
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[70vh] max-h-[75vh]">
        {/* HEADER */}
        <div className="shrink-0 px-4 sm:px-6 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Exam" : "Update Exam"}
          </h1>
          <p className="text-xs text-gray-500">
            Manage exam details and schedule
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
          {/* BASIC */}
          <CollapsibleSection
            title="Exam Information"
            description="Title, class and lesson mapping"
            icon="📝"
            open={openSection === "basic"}
            onToggle={() => setOpenSection("basic")}
          >
            <div className="space-y-4">
              <InputField label="Exam Title" name="title" />

              {/* CLASS DROPDOWN */}
              <RadixSelect
                value={selectedClassId ? String(selectedClassId) : ""}
                onChange={(v) => {
                  const classId = Number(v);
                  setSelectedClassId(classId);

                  // reset lesson safely
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
            description="Exam date and time"
            icon="⏰"
            open={openSection === "schedule"}
            onToggle={() => setOpenSection("schedule")}
          >
            <div className="space-y-4">
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <RadixDateTimePicker
                    value={field.value}
                    onChange={(v) =>
                      setValue("startTime", v, { shouldValidate: true })
                    }
                    placeholder="Start date & time"
                  />
                )}
              />

              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <RadixDateTimePicker
                    value={field.value}
                    onChange={(v) =>
                      setValue("endTime", v, { shouldValidate: true })
                    }
                    placeholder="End date & time"
                  />
                )}
              />
            </div>
          </CollapsibleSection>

          {submitCount > 0 && Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">
              Please fix the highlighted fields before saving.
            </div>
          )}
        </div>

        {/* FOOTER */}
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
                ? "Create Exam"
                : "Update Exam"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}