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

import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import {
  createSubject,
  updateSubject,
  ActionState,
} from "@/lib/actions";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import FormStepper from "@/components/ui/FormStepper";
import InputField from "../InputField";

/* ================= STEPS ================= */

const steps = ["Basic Info", "Assignment"];

/* ================= MAIN FORM ================= */

export default function SubjectForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: SubjectSchema;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
  };
}) {
  const router = useRouter();
  const { teachers = [] } = relatedData || {};

  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      teachers: data?.teachers ?? [],
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, SubjectSchema>(
    type === "create" ? createSubject : updateSubject,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof SubjectSchema)[][] = [
      ["name"],
      ["teachers"],
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
        `Subject ${type === "create" ? "created" : "updated"} successfully`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, type, setOpen, router]);

  const errorSteps = [
    Boolean(errors.name),
    Boolean(errors.teachers),
  ];

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h1 className="text-base sm:text-xl font-semibold">
          {type === "create" ? "Create Subject" : "Update Subject"}
        </h1>

        <FormStepper steps={steps} step={step} errorSteps={errorSteps} />

        <div className="min-h-[140px]">
          {step === 0 && (
            <InputField label="Subject Name" name="name" />
          )}

          {step === 1 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs text-gray-500">
                Teachers
              </label>

              <select
                multiple
                {...register("teachers")}
                value={watch("teachers")}
                className="
                  rounded-md border border-gray-300
                  p-2 text-sm
                  focus:ring-2 focus:ring-blue-500
                "
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.surname}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {step === steps.length - 1 && state.error && (
          <span className="text-xs text-red-500">
            {state.error}
          </span>
        )}

        <div className="flex justify-between pt-3 border-t">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-sm"
            >
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
                  ? "Create Subject"
                  : "Update Subject"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
