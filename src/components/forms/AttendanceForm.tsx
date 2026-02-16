"use client";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";

import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  attendanceSchema,
  AttendanceFormInput,   // ✅ FORM INPUT
  AttendanceFormValues,  // ✅ SERVER OUTPUT
} from "@/lib/formValidationSchemas";

import { createAttendance, updateAttendance, ActionState } from "@/lib/actions";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import FormStepper from "@/components/ui/FormStepper";
import RadixSelect from "@/components/ui/RadixSelect";
import RadixDatePicker from "@/components/ui/RadixDatePicker";

import { motion, AnimatePresence } from "framer-motion";

/* ================= STEPS ================= */

const steps = ["Student", "Lesson", "Status"];

/* ================= FORM ================= */

export default function AttendanceForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: AttendanceFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    students: { id: string; name: string; surname: string }[];
    lessons: {
      id: number;
      subject?: { name: string };
      class?: { name: string };
    }[];
  };
}) {
  const router = useRouter();
  const { students = [], lessons = [] } = relatedData;
  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<AttendanceFormInput>({
    resolver: zodResolver(attendanceSchema), // ✅ MATCHES INPUT
    defaultValues: {
      id: data?.id,
      studentId: data?.studentId ?? "",
      lessonId: data?.lessonId,
      date: data?.date ?? new Date(),
      present: data?.present ?? true,
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = methods;

  /* ✅ useWatch returns unknown → narrow it */
  const rawDate = useWatch({
    control,
    name: "date",
  });

  const watchedDate: Date | undefined =
    rawDate instanceof Date ? rawDate : undefined;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, AttendanceFormInput>(
    type === "create" ? createAttendance : updateAttendance,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fields: (keyof AttendanceFormInput)[][] = [
      ["studentId"],
      ["lessonId", "date"],
      ["present"],
    ];

    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  };

  /* ================= SUBMIT ================= */

  const submitFinal = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= SUCCESS ================= */

  useEffect(() => {
    if (!state.success) return;

    toast.success("Attendance saved successfully");
    setOpen(false);
    router.refresh();
  }, [state.success, router, setOpen]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      {/* ⛔ NO form submit */}
      <form className="flex flex-col gap-4">
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Attendance" : "Update Attendance"}
        </h1>

        <FormStepper
          steps={steps}
          step={step}
          errorSteps={[
            Boolean(errors.studentId),
            Boolean(errors.lessonId || errors.date),
            Boolean(errors.present),
          ]}
        />

        <div className="min-h-[160px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s1" className="space-y-4">
                <RadixSelect
                  placeholder="Select student"
                  value={watch("studentId")}
                  onChange={(v) =>
                    setValue("studentId", v ?? "", { shouldValidate: true })
                  }
                  options={students.map((s) => ({
                    value: s.id,
                    label: `${s.name} ${s.surname}`,
                  }))}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s2" className="space-y-4">
                <RadixSelect
                  placeholder="Select lesson"
                  value={watch("lessonId") ? String(watch("lessonId")) : ""}
                  onChange={(v) =>
                    setValue("lessonId", Number(v), { shouldValidate: true })
                  }
                  options={lessons.map((l) => ({
                    value: String(l.id),
                    label: `${l.subject?.name ?? "Subject"} / ${
                      l.class?.name ?? "Class"
                    }`,
                  }))}
                />

                {/* ✅ NO TYPE ERROR */}
                <RadixDatePicker
                  value={watchedDate}
                  onChange={(d) =>
                    d && setValue("date", d, { shouldValidate: true })
                  }
                />
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s3" className="space-y-4">
                <RadixSelect
                  placeholder="Attendance status"
                  value={watch("present") ? "true" : "false"}
                  onChange={(v) =>
                    setValue("present", v === "true", {
                      shouldValidate: true,
                    })
                  }
                  options={[
                    { value: "true", label: "Present" },
                    { value: "false", label: "Absent" },
                  ]}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === steps.length - 1 && state.error && (
          <p className="text-xs text-red-500">{state.error}</p>
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
              type="button"
              onClick={submitFinal}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
