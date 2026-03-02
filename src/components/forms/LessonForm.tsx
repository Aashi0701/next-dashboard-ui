"use client";

import {
  useEffect,
  useState,
  startTransition,
  useActionState,
} from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lessonSchema, LessonFormValues } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson, ActionState } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import RadixDateTimePicker from "@/components/ui/RadixDateTimePicker";
import CollapsibleSection from "../CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

type Section = "basic" | "schedule" | "assignment";

export default function LessonForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: LessonFormValues;
  close: () => void;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
    subjects: { id: number; name: string }[];
    classes: { id: number; name: string }[];
  };
}) {
  const router = useRouter();
  const { teachers = [], subjects = [], classes = [] } = relatedData || {};

  const methods = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      day: data?.day ?? "MONDAY",
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      subjectId: data?.subjectId ?? 0,
      classId: data?.classId ?? 0,
      teacherId: data?.teacherId ?? "",
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, submitCount, isSubmitting },
  } = methods;

  const [openSection, setOpenSection] = useState<Section>("basic");

  const sectionFields: Record<Section, readonly (keyof LessonFormValues)[]> = {
    basic: ["name", "day"],
    schedule: ["startTime", "endTime"],
    assignment: ["subjectId", "classId", "teacherId"],
  };

  const [state, formAction] = useActionState<ActionState, LessonFormValues>(
    type === "create" ? createLesson : updateLesson,
    { success: false },
  );

  /* Auto-open section with first error */
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0] as keyof LessonFormValues;

      const section = (
        Object.entries(sectionFields) as [
          Section,
          readonly (keyof LessonFormValues)[],
        ][]
      ).find(([, fields]) => fields.includes(firstError))?.[0];

      if (section) setOpenSection(section);

      requestAnimationFrame(() => {
        document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }, [errors, submitCount]);

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Lesson ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[70vh] max-h-[75vh]">
        {/* HEADER */}
        <div className="shrink-0 px-4 sm:px-6 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Lesson" : "Update Lesson"}
          </h1>
          <p className="text-xs text-gray-500">
            Manage lesson details and schedule
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 pb-24 space-y-4">
          {/* BASIC */}
          <CollapsibleSection
            title="Basic Information"
            description="Lesson name and day"
            icon="📘"
            open={openSection === "basic"}
            onToggle={() => setOpenSection("basic")}
          >
            <div className="space-y-3">
              <InputField label="Lesson Name" name="name" />

              <RadixSelect
                value={watch("day")}
                onChange={(v) =>
                  setValue("day", v as LessonFormValues["day"], {
                    shouldValidate: true,
                  })
                }
                options={[
                  { value: "MONDAY", label: "Monday" },
                  { value: "TUESDAY", label: "Tuesday" },
                  { value: "WEDNESDAY", label: "Wednesday" },
                  { value: "THURSDAY", label: "Thursday" },
                  { value: "FRIDAY", label: "Friday" },
                ]}
              />
            </div>
          </CollapsibleSection>

          {/* SCHEDULE */}
          <CollapsibleSection
            title="Schedule"
            description="Start and end time"
            icon="⏰"
            open={openSection === "schedule"}
            onToggle={() => setOpenSection("schedule")}
          >
            <div className="space-y-3">
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <RadixDateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Start time"
                  />
                )}
              />

              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <RadixDateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="End time"
                  />
                )}
              />
            </div>
          </CollapsibleSection>

          {/* ASSIGNMENT */}
          <CollapsibleSection
            title="Assignment"
            description="Subject, class and teacher"
            icon="🎯"
            open={openSection === "assignment"}
            onToggle={() => setOpenSection("assignment")}
          >
            <div className="space-y-3">
              <RadixSelect
                value={watch("subjectId") ? String(watch("subjectId")) : ""}
                onChange={(v) =>
                  setValue("subjectId", Number(v), {
                    shouldValidate: true,
                  })
                }
                placeholder="Select Subject"
                options={subjects.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
              />

              <RadixSelect
                value={watch("classId") ? String(watch("classId")) : ""}
                onChange={(v) =>
                  setValue("classId", Number(v), {
                    shouldValidate: true,
                  })
                }
                placeholder="Select Class"
                options={classes.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
              />

              <RadixSelect
                value={watch("teacherId")}
                onChange={(v) =>
                  setValue("teacherId", v ?? "", {
                    shouldValidate: true,
                  })
                }
                placeholder="Select Teacher"
                options={teachers.map((t) => ({
                  value: t.id,
                  label: `${t.name} ${t.surname}`,
                }))}
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
                  ? "Create Lesson"
                  : "Update Lesson"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}