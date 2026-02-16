"use client";

import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  startTransition,
  useActionState,
} from "react";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { examSchema, ExamFormValues } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import RadixDateTimePicker from "@/components/ui/RadixDateTimePicker";
import FormStepper from "@/components/ui/FormStepper";

import { motion, AnimatePresence } from "framer-motion";
import { ActionState } from "@/lib/actions";

/* ===================================================== */

const steps = ["Basic Info", "Schedule"];

/* ===================================================== */

export default function ExamForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: ExamFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { lessons: { id: number; name: string }[] };
}) {
  const router = useRouter();
  const { lessons = [] } = relatedData || {};

  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema) as any,
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      lessonId: data?.lessonId,
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    handleSubmit,
    trigger,
    control,
    formState: { isSubmitting },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, ExamFormValues>(
    type === "create" ? createExam : updateExam,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof ExamFormValues)[][] = [
      ["title", "lessonId"],
      ["startTime", "endTime"],
    ];

    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => s + 1);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= SUCCESS ================= */

  useEffect(() => {
    if (!state.success) return;

    toast.success(
      `Exam ${type === "create" ? "created" : "updated"} successfully`,
    );
    setOpen(false);
    router.refresh();
  }, [state.success, type, router, setOpen]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Student" : "Update Student"}
        </h1>

        <FormStepper steps={steps} step={step} />

        {/* SCROLL AREA */}
        <div className="transition-[min-height] duration-300 ease-in-out min-h-[140px] sm:min-h-[150px] md:min-h-[160px] lg:min-h-[170px]">
          <AnimatePresence mode="wait">
            {/* STEP 1 – BASIC INFO */}
            {step === 0 && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-4"
              >
                <InputField label="Exam Title" name="title" />

                <RadixSelect
                  value={watch("lessonId") ? String(watch("lessonId")) : ""}
                  onChange={(v) =>
                    setValue("lessonId", Number(v), {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select Lesson"
                  options={lessons.map((l) => ({
                    value: String(l.id),
                    label: l.name,
                  }))}
                />
              </motion.div>
            )}

            {/* STEP 2 – SCHEDULE */}
            {step === 1 && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-4"
              >
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <RadixDateTimePicker
                      value={field.value}
                      onChange={(v) =>
                        setValue("startTime", v, {
                          shouldValidate: true,
                        })
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
                        setValue("endTime", v, {
                          shouldValidate: true,
                        })
                      }
                      placeholder="End date & time"
                    />
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIONS */}
        <div className="px-5 py-4 border-t bg-white flex justify-between">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}

          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : type === "create"
                  ? "Create Exam"
                  : "Update Exam"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
