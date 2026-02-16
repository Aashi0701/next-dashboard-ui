"use client";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { holidaySchema, HolidayFormInput } from "@/lib/formValidationSchemas";
import { createHoliday, updateHoliday } from "@/lib/actions";
import { ActionState } from "@/lib/actions";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import FormStepper from "@/components/ui/FormStepper";
import RadixDatePicker from "@/components/ui/RadixDatePicker";
import RadixSelect from "@/components/ui/RadixSelect";
import InputField from "../InputField";

import { motion, AnimatePresence } from "framer-motion";

const steps = ["Details", "Type"];

export default function HolidayForm({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: {
    id: number;
    title: string;
    date: Date;
    isFullDay: boolean;
  };
  setOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const submittedRef = useRef(false);

  /* ================= RHF ================= */

  const methods = useForm<HolidayFormInput>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      date: data?.date ? new Date(data.date) : new Date(),
      isFullDay: data?.isFullDay ? "FULL" : "HALF",
    },
    mode: "onChange",
  });

  const {
    control,
    watch,
    trigger,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  /* ================= SERVER ACTIONS ================= */

  const [createState, createAction] = useActionState<ActionState, any>(
    createHoliday,
    { success: false },
  );

  const [updateState, updateAction] = useActionState<ActionState, any>(
    updateHoliday,
    { success: false },
  );

  const state = type === "create" ? createState : updateState;

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fields: (keyof HolidayFormInput)[][] = [
      ["title", "date"],
      ["isFullDay"],
    ];

    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    submittedRef.current = true;

    startTransition(() => {
      const payload = {
        title: values.title,
        date: values.date,
        isFullDay: values.isFullDay === "FULL",
      };

      if (type === "create") {
        createAction(payload);
      } else {
        updateAction({ id: data!.id, ...payload });
      }
    });
  });

  /* ================= SUCCESS EFFECT ================= */

  useEffect(() => {
    if (!submittedRef.current) return;
    if (!state.success) return;

    toast.success(
      `Holiday ${type === "create" ? "created" : "updated"} successfully`,
    );

    submittedRef.current = false;
    setOpen(false);
    router.refresh();
  }, [state.success, type, router, setOpen]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
      >
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Holiday" : "Update Holiday"}
        </h1>

        <FormStepper
          steps={steps}
          step={step}
          errorSteps={[
            Boolean(errors.title || errors.date),
            Boolean(errors.isFullDay),
          ]}
        />

        <div className="min-h-[160px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <InputField label="Holiday Title" name="title" />

                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <RadixDatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <Controller
                  name="isFullDay"
                  control={control}
                  render={({ field }) => (
                    <RadixSelect
                      placeholder="Holiday type"
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: "FULL", label: "Full Day" },
                        { value: "HALF", label: "Half Day" },
                      ]}
                    />
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
              disabled={isSubmitting}
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
