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

import { parentSchema, ParentFormValues } from "@/lib/formValidationSchemas";

import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import { AnimatePresence, motion } from "framer-motion";
import { ActionState } from "@/lib/actions";

/* ===================================================== */

const steps = ["Authentication", "Personal"];

function Stepper({ steps, step }: { steps: string[]; step: number }) {
  const CIRCLE = 36; // w-8 h-8

  return (
    <div className="relative mb-6">
      {/* CONNECTOR LINE */}
      <div
        className="absolute top-1/2 left-4 right-4 h-[2px] bg-gray-200 -translate-y-1/2"
        style={{
          top: CIRCLE / 2,
          left: CIRCLE / 1,
          right: CIRCLE / 2,
        }}
      >
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{
            width: `${(step / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </div>

      {/* STEPS */}
      <div className="relative flex justify-between">
        {steps.map((label, i) => {
          const active = i === step;
          const completed = i < step;

          return (
            <div key={label} className="flex flex-col items-center gap-2">
              <motion.div
                animate={{ scale: active ? 1.15 : 1 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 24,
                }}
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center z-10
                  transition-colors
                  ${
                    completed
                      ? "bg-green-600 text-white"
                      : active
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                  }
                `}
              >
                {completed ? "✓" : i + 1}
              </motion.div>

              <span
                className={`text-xs font-medium ${
                  active ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ParentForm({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: ParentFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      id: data?.id,
      username: data?.username ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      address: data?.address ?? "",
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    trigger,
    formState: { isSubmitting },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, ParentFormValues>(
    type === "create" ? createParent : updateParent,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof ParentFormValues)[][] = [
      ["username", "email", "phone"],
      ["name", "surname", "address"],
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
    if (state.success) {
      toast.success(
        `Parent ${type === "create" ? "created" : "updated"} successfully`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router, setOpen, type]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Student" : "Update Student"}
        </h1>

        <Stepper steps={steps} step={step} />

        {/* SCROLL AREA */}
        <div className="transition-[min-height] duration-300 ease-in-out min-h-[140px] sm:min-h-[150px] md:min-h-[160px] lg:min-h-[170px]">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 0 && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                <InputField label="Username" name="username" />
                <InputField label="Email" name="email" />
                <InputField label="Phone" name="phone" />
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="grid sm:grid-cols-2 gap-4"
              >
                <InputField label="First Name" name="name" />
                <InputField label="Last Name" name="surname" />
                <InputField label="Address" name="address" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {state.error && (
          <p className="text-xs text-red-500 mt-2">{state.error}</p>
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
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : type === "create"
                  ? "Create Parent"
                  : "Update Parent"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
