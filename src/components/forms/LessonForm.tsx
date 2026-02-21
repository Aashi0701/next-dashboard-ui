"use client";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
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
import FormStepper from "@/components/ui/FormStepper";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { motion, AnimatePresence } from "framer-motion";

/* ================= STEPS ================= */

const steps = ["Basic Info", "Schedule", "Assignment"];

/* ================= MAIN FORM ================= */

export default function LessonForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: LessonFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
    subjects: { id: number; name: string }[];
    classes: { id: number; name: string }[];
  };
}) {
  const router = useRouter();
  const { teachers = [], subjects = [], classes = [] } = relatedData || {};

  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

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
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    control,
    trigger,
    formState: { isSubmitting, errors },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, LessonFormValues>(
    type === "create" ? createLesson : updateLesson,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof LessonFormValues)[][] = [
      ["name", "day"],
      ["startTime", "endTime"],
      ["subjectId", "classId", "teacherId"],
    ];

    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => s + 1);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Lesson ${type === "create" ? "created" : "updated"} successfully`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, type, setOpen, router]);

  const errorSteps = [
    Boolean(errors.name || errors.day),
    Boolean(errors.startTime || errors.endTime),
    Boolean(errors.subjectId || errors.classId || errors.teacherId),
  ];

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Hidden fields */}
        <input type="hidden" {...methods.register("subjectId")} />
        <input type="hidden" {...methods.register("classId")} />
        <input type="hidden" {...methods.register("teacherId")} />

        <div className="relative">
          <ModalCloseButton onClose={() => setOpen(false)} />
          <h1 className="text-lg font-semibold">
            {type === "create" ? "Create Class" : "Update Class"}
          </h1>
        </div>

        <FormStepper steps={steps} step={step} errorSteps={errorSteps} />

        <div className="min-h-[160px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s1" className="space-y-4">
                <InputField label="Lesson Name" name="name" />

                <RadixSelect
                  value={watch("day")}
                  onChange={(v) =>
                    setValue("day", v as any, { shouldValidate: true })
                  }
                  placeholder="Select Day"
                  options={[
                    { value: "MONDAY", label: "Monday" },
                    { value: "TUESDAY", label: "Tuesday" },
                    { value: "WEDNESDAY", label: "Wednesday" },
                    { value: "THURSDAY", label: "Thursday" },
                    { value: "FRIDAY", label: "Friday" },
                  ]}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s2" className="space-y-4">
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
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s3" className="space-y-4">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === steps.length - 1 && state.error && (
          <span className="text-xs text-red-500">{state.error}</span>
        )}

        <div className="flex justify-between pt-3 border-t">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 text-white px-4 py-2 rounded-full"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : type === "create"
                  ? "Create Lesson"
                  : "Update Lesson"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
