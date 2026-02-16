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
  eventSchema,
  EventFormInput,
  EventFormValues,
} from "@/lib/formValidationSchemas";

import { createEvent, updateEvent, ActionState } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import FormStepper from "@/components/ui/FormStepper";
import RadixDateTimePicker from "@/components/ui/RadixDateTimePicker";
import RadixSelect from "@/components/ui/RadixSelect";
import InputField from "../InputField";

import { motion, AnimatePresence } from "framer-motion";

/* ================= STEPS ================= */

const steps = ["Basic Info", "Schedule"];

/* ================= FORM ================= */

export default function EventForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: EventFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classes: { id: number; name: string }[];
  };
}) {
  const router = useRouter();
  const { classes = [] } = relatedData || {};
  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      description: data?.description ?? "",
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      classId: data?.classId ?? undefined,
      category: data?.category ?? "default",
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, EventFormInput>(
    type === "create" ? createEvent : updateEvent,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof EventFormInput)[][] = [
      ["title", "description"],
      ["startTime", "endTime"],
    ];

    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => s + 1);
  };

  /* ================= FINAL SUBMIT ================= */

  const submitFinal = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= SUCCESS ================= */

  useEffect(() => {
    if (!state.success) return;

    toast.success(
      `Event ${type === "create" ? "created" : "updated"} successfully`,
    );
    setOpen(false);
    router.refresh();
  }, [state.success, type, router, setOpen]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      {/* ❌ NO onSubmit */}
      <form className="flex flex-col gap-4">
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Event" : "Update Event"}
        </h1>

        <FormStepper
          steps={steps}
          step={step}
          errorSteps={[
            Boolean(errors.title || errors.description),
            Boolean(errors.startTime || errors.endTime),
          ]}
        />

        <div className="min-h-[180px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="basic" className="space-y-4">
                <InputField label="Title" name="title" />
                <InputField label="Description" name="description" />

                <RadixSelect
                  placeholder="Select category"
                  value={watch("category")}
                  onChange={(v) =>
                    setValue("category", v, { shouldValidate: true })
                  }
                  options={[
                    { value: "default", label: "Default" },
                    { value: "holiday", label: "Holiday" },
                    { value: "exam", label: "Exam" },
                    { value: "competition", label: "Competition" },
                    { value: "meeting", label: "Meeting" },
                    { value: "celebration", label: "Celebration" },
                  ]}
                />

                <RadixSelect
                  placeholder="Select class"
                  value={
                    watch("classId") !== undefined
                      ? String(watch("classId"))
                      : "__general__"
                  }
                  onChange={(v) =>
                    setValue(
                      "classId",
                      v === "__general__" ? undefined : Number(v),
                      { shouldValidate: true },
                    )
                  }
                  options={[
                    { value: "__general__", label: "General Event" },
                    ...classes.map((c) => ({
                      value: String(c.id),
                      label: c.name,
                    })),
                  ]}
                />
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="schedule" className="space-y-4">
                <RadixDateTimePicker
                  value={watch("startTime")}
                  onChange={(d) =>
                    d &&
                    setValue("startTime", d, {
                      shouldValidate: true,
                    })
                  }
                />

                <RadixDateTimePicker
                  value={watch("endTime")}
                  onChange={(d) =>
                    d &&
                    setValue("endTime", d, {
                      shouldValidate: true,
                    })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step === steps.length - 1 && state.error && (
          <p className="text-xs text-red-500">{state.error}</p>
        )}

        <div className="flex justify-between py-4">
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
              onClick={submitFinal}
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
