"use client";

import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  startTransition,
  useActionState,
} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass, ActionState } from "@/lib/actions";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import FormStepper from "@/components/ui/FormStepper";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

import { motion, AnimatePresence } from "framer-motion";

const steps = ["Basic Info", "Assignments"];

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
  };
}) {
  const router = useRouter();
  const { teachers = [] } = relatedData || {};

  const [step, setStep] = useState(0);

  /* -------------------- FORM SETUP -------------------- */
  const methods = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      capacity: data?.capacity ?? 1,

      // ⚠️ RHF may start undefined, Zod enforces required on submit
      supervisorId: data?.supervisorId,
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const [state, formAction] = useActionState<ActionState, ClassSchema>(
    type === "create" ? createClass : updateClass,
    { success: false },
  );

  /* -------------------- STEP VALIDATION -------------------- */
  const nextStep = async () => {
    const fields = step === 0 ? ["name", "capacity"] : ["supervisorId"];

    const valid = await trigger(fields as (keyof ClassSchema)[]);
    if (valid) setStep((s) => s + 1);
  };

  /* -------------------- FINAL SUBMIT -------------------- */
  const submitWithValidation = async () => {
    const valid = await trigger(["supervisorId"]);
    if (!valid) return;

    handleSubmit((values) => {
      startTransition(() => {
        formAction(values);
      });
    })();
  };

  /* -------------------- SIDE EFFECTS -------------------- */
  useEffect(() => {
    if (state.success) {
      toast.success(
        `Class ${type === "create" ? "created" : "updated"} successfully`,
      );
      setOpen(false);
      router.refresh();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, setOpen, type]);

  return (
    <FormProvider {...methods}>
      <form className="flex flex-col gap-4">
        {/* HEADER */}
        <div className="relative">
          <ModalCloseButton onClose={() => setOpen(false)} />
          <h1 className="text-lg font-semibold">
            {type === "create" ? "Create Class" : "Update Class"}
          </h1>
        </div>

        <FormStepper steps={steps} step={step} />

        {/* CONTENT */}
        <div className="min-h-[160px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-4"
              >
                <InputField label="Class Name" name="name" />
                <InputField label="Capacity" name="capacity" type="number" />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="assign"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="space-y-4"
              >
                <RadixSelect
                  value={watch("supervisorId")}
                  onChange={(v) => {
                    if (!v) return; // ⛔ ignore undefined
                    setValue("supervisorId", v, { shouldValidate: true });
                  }}
                  placeholder="Select Class Supervisor"
                  options={teachers.map((t) => ({
                    value: t.id,
                    label: `${t.name} ${t.surname}`,
                  }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between pt-3 border-t">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}

          {step < steps.length - 1 ? (
            <button type="button" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={submitWithValidation}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-5 py-2 rounded-md"
            >
              {isSubmitting
                ? type === "create"
                  ? "Creating…"
                  : "Updating…"
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
