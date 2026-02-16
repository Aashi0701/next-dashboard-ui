"use client";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  assignmentSchema,
  AssignmentFormValues,
} from "@/lib/formValidationSchemas";

import { createAssignment, updateAssignment } from "@/lib/actions";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import RadixDateTimePicker from "@/components/ui/RadixDateTimePicker";
import RadixSelect from "@/components/ui/RadixSelect";
import FormStepper from "@/components/ui/FormStepper";

import { motion, AnimatePresence } from "framer-motion";
import { ActionState } from "@/lib/actions";

/* ===================================================== */

const steps = ["Details", "Schedule"];

/* ===================================================== */

export default function AssignmentForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: AssignmentFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    lessons: { id: number; name: string }[];
  };
}) {
  const router = useRouter();
  const { lessons = [] } = relatedData || {};
  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema) as any,
    defaultValues: {
      title: data?.title ?? "",
      startDate: data?.startDate ? new Date(data.startDate) : undefined,
      dueDate: data?.dueDate ? new Date(data.dueDate) : undefined,
      lessonId: data?.lessonId,
      ...(data?.id ? { id: data.id } : {}),
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, AssignmentFormValues>(
    type === "create" ? createAssignment : updateAssignment,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof AssignmentFormValues)[][] = [
      ["title", "lessonId"],
      ["startDate", "dueDate"],
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
      `Assignment ${type === "create" ? "created" : "updated"} successfully`,
    );
    setOpen(false);
    router.refresh();
  }, [state.success, type, router, setOpen]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* HEADER */}
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Assignment" : "Update Assignment"}
        </h1>

        {/* STEPPER */}
        <FormStepper steps={steps} step={step} />

        {/* STEP CONTENT */}
        <div className="relative min-h-[150px]">
          <AnimatePresence mode="wait">
            {/* STEP 1 — DETAILS */}
            {step === 0 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <InputField label="Title" name="title" />

                <RadixSelect
                  placeholder="Select lesson"
                  value={
                    watch("lessonId") ? String(watch("lessonId")) : undefined
                  }
                  onChange={(v) =>
                    setValue("lessonId", Number(v), {
                      shouldValidate: true,
                    })
                  }
                  options={lessons.map((l) => ({
                    value: String(l.id), // ✅ always non-empty
                    label: l.name,
                  }))}
                />
              </motion.div>
            )}

            {/* STEP 2 — SCHEDULE */}
            {step === 1 && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {state.error && (
          <p className="text-xs text-red-500 mt-2">
            {state.error}
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between pt-4">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}

          {step < steps.length - 1 ? (
            <button type="button" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-40"
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
