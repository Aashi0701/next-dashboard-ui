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
  resultSchema,
  ResultFormValues,
} from "@/lib/formValidationSchemas";

import { createResult, updateResult } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import FormStepper from "@/components/ui/FormStepper";
import { motion, AnimatePresence } from "framer-motion";
import { ActionState } from "@/lib/actions";

const steps = ["Score", "Target"];

/* ===================================================== */

export default function ResultForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: ResultFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    students: { id: string; name: string; surname: string }[];
    exams: { id: number; title: string }[];
    assignments: { id: number; title: string }[];
  };
}) {
  const router = useRouter();
  const { students = [], exams = [], assignments = [] } = relatedData || {};

  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema) as any,
    defaultValues: {
      id: data?.id,
      score: data?.score ?? undefined,
      studentId: data?.studentId ?? "",
      examId: data?.examId,
      assignmentId: data?.assignmentId,
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, ResultFormValues>(
    type === "create" ? createResult : updateResult,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof ResultFormValues)[][] = [
      ["score", "studentId"],
      ["examId", "assignmentId"],
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
      `Result ${type === "create" ? "created" : "updated"} successfully`
    );
    setOpen(false);
    router.refresh();
  }, [state.success, type, router, setOpen]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Result" : "Update Result"}
        </h1>

        <FormStepper
          steps={steps}
          step={step}
          errorSteps={[
            Boolean(errors.score || errors.studentId),
            Boolean(errors.examId || errors.assignmentId),
          ]}
        />

        {/* SCROLL AREA */}
        <div className="min-h-[160px]">
          <AnimatePresence mode="wait">
            {/* STEP 1 — SCORE */}
            {step === 0 && (
              <motion.div
                key="score"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <InputField label="Score" name="score" />

                <RadixSelect
                  placeholder="Select student"
                  value={watch("studentId") || undefined}
                  onChange={(v) =>
                    setValue("studentId", v!, {
                      shouldValidate: true,
                    })
                  }
                  options={students.map((s) => ({
                    value: s.id,
                    label: `${s.name} ${s.surname}`,
                  }))}
                />
              </motion.div>
            )}

            {/* STEP 2 — TARGET */}
            {step === 1 && (
              <motion.div
                key="target"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <RadixSelect
                  placeholder="Select exam (optional)"
                  value={
                    watch("examId")
                      ? String(watch("examId"))
                      : undefined
                  }
                  onChange={(v) =>
                    setValue("examId", Number(v), {
                      shouldValidate: true,
                    })
                  }
                  options={exams.map((e) => ({
                    value: String(e.id),
                    label: e.title,
                  }))}
                />

                <RadixSelect
                  placeholder="Select assignment (optional)"
                  value={
                    watch("assignmentId")
                      ? String(watch("assignmentId"))
                      : undefined
                  }
                  onChange={(v) =>
                    setValue("assignmentId", Number(v), {
                      shouldValidate: true,
                    })
                  }
                  options={assignments.map((a) => ({
                    value: String(a.id),
                    label: a.title,
                  }))}
                />

                {(errors.examId || errors.assignmentId) && (
                  <p className="text-xs text-red-500">
                    Select either an exam or an assignment
                  </p>
                )}
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
        <div className="flex justify-between py-4">
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
