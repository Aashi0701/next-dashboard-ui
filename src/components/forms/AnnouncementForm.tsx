"use client";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  announcementFormSchema,
  AnnouncementFormInput,
  AnnouncementFormValues,
} from "@/lib/formValidationSchemas";

import { createAnnouncement, updateAnnouncement } from "@/lib/actions";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import FormStepper from "@/components/ui/FormStepper";
import RadixDatePicker from "@/components/ui/RadixDatePicker";
import RadixSelect from "@/components/ui/RadixSelect";
import InputField from "../InputField";
import { ActionState } from "@/lib/actions";
import { motion, AnimatePresence } from "framer-motion";

/* ===================================================== */

const steps = ["Details", "Schedule"];

type AnnouncementAction = (
  state: ActionState,
  data: AnnouncementFormValues
) => Promise<ActionState>;

/* ===================================================== */

export default function AnnouncementForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: AnnouncementFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classes: { id: number; name: string }[];
  };
}) {
  const router = useRouter();
  const classes = relatedData?.classes ?? [];

  const [step, setStep] = useState(0);

  /* ================= RHF ================= */

  const methods = useForm<AnnouncementFormInput>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      description: data?.description ?? "",
      date: data?.date ? new Date(data.date) : undefined,
      classId: data?.classId ? String(data.classId) : "",
    },
    mode: "onChange",
  });

  const {
    control,
    setValue,
    trigger,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
  } = methods;

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof AnnouncementFormInput)[][] = [
      ["title", "description"],
      ["date"],
    ];

    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => s + 1);
  };

  /* ================= ACTION ================= */

  const announcementAction: AnnouncementAction = async (state, data) => {
    return type === "create"
      ? createAnnouncement(state, data)
      : updateAnnouncement(state, data);
  };

  const [state, formAction] = useActionState(announcementAction, {
    success: false,
  });

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => {
      // values are already validated & parsed by zodResolver
      formAction(values);
    });
  });

  /* ================= SUCCESS ================= */

  useEffect(() => {
    if (!state.success) return;

    toast.success(
      `Announcement ${type === "create" ? "created" : "updated"} successfully`,
    );

    setOpen(false);
    router.refresh();
  }, [state.success, type, router, setOpen]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        className="flex flex-col gap-4"
      >
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Announcement" : "Update Announcement"}
        </h1>

        <FormStepper
          steps={steps}
          step={step}
          errorSteps={[
            Boolean(errors.title || errors.description),
            Boolean(errors.date),
          ]}
        />

        {/* CONTENT */}
        <div className="min-h-[170px]">
          <AnimatePresence mode="wait">
            {/* STEP 1 — DETAILS */}
            {step === 0 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <InputField label="Title" name="title" />
                <InputField label="Description" name="description" />
              </motion.div>
            )}

            {/* STEP 2 — SCHEDULE */}
            {step === 1 && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                {/* DATE */}
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <RadixDatePicker
                      value={field.value}
                      onChange={(d) => {
                        if (!d) return;
                        field.onChange(d);
                      }}
                    />
                  )}
                />

                {/* CLASS */}
                <Controller
                  name="classId"
                  control={control}
                  render={({ field }) => (
                    <RadixSelect
                      placeholder="Select class (optional)"
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? "")}
                      options={[
                        { value: "ALL", label: "All Classes" },
                        ...classes.map((cls) => ({
                          value: String(cls.id),
                          label: cls.name,
                        })),
                      ]}
                    />
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
