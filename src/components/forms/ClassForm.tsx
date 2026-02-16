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

import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import FormStepper from "@/components/ui/FormStepper";

import { motion, AnimatePresence } from "framer-motion";

/* ================= STEPS ================= */

const steps = ["Basic Info", "Assignments"];

/* ================= MAIN FORM ================= */

export default function ClassForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<ClassSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
    grades: { id: number; level: string }[];
  };
}) {
  const router = useRouter();
  const { teachers = [], grades = [] } = relatedData || {};

  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      capacity: data?.capacity ?? 1,
      gradeId: data?.gradeId ?? 0,
      supervisorId: data?.supervisorId ?? "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { isSubmitting, errors },
  } = methods;

  /* ================= ACTION ================= */

  type ActionState = {
    success: boolean;
    error?: string;
  };

  const [state, formAction] = useActionState<ActionState, ClassSchema>(
    type === "create" ? createClass : updateClass,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof ClassSchema)[][] = [
      ["name", "capacity"],
      ["gradeId", "supervisorId"],
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
        `Class ${type === "create" ? "created" : "updated"} successfully`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, type, setOpen, router]);

  const errorSteps = [
    Boolean(errors.name || errors.capacity),
    Boolean(errors.gradeId || errors.supervisorId),
  ];

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {/* Hidden fields for RadixSelect */}
        <input type="hidden" {...methods.register("gradeId")} />
        <input type="hidden" {...methods.register("supervisorId")} />

        {/* TITLE */}
        <h1 className="text-base sm:text-xl font-semibold">
          {type === "create" ? "Create Class" : "Update Class"}
        </h1>

        {/* STEPPER */}
        <FormStepper steps={steps} step={step} errorSteps={errorSteps} />

        {/* BODY */}
        <div className="min-h-[150px] transition-all">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <InputField label="Class Name" name="name" />

                <InputField label="Capacity" name="capacity" type="number" />

                {data?.id && <InputField name="id" hidden />}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <RadixSelect
                  value={watch("gradeId") ? String(watch("gradeId")) : ""}
                  onChange={(v) =>
                    setValue("gradeId", Number(v), {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select Grade"
                  options={grades.map((g) => ({
                    value: String(g.id),
                    label: g.level,
                  }))}
                />

                <RadixSelect
                  value={watch("supervisorId")}
                  onChange={(v) =>
                    setValue("supervisorId", v ?? "", {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Select Supervisor"
                  options={teachers.map((t) => ({
                    value: t.id,
                    label: `${t.name} ${t.surname}`,
                  }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ERROR */}
        {step === steps.length - 1 && state.error && (
          <span className="text-xs text-red-500">{state.error}</span>
        )}

        {/* ACTIONS */}
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
                  ? "Create Class"
                  : "Update Class"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
