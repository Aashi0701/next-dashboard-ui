"use client";

import {
  Dispatch,
  SetStateAction,
  startTransition,
  useEffect,
  useState,
} from "react";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FeeSchema, FeeSchemaType } from "@/lib/formValidationSchemas";

import { createFee, updateFee } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import FormStepper from "@/components/ui/FormStepper";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Basic Info", "Classification"];

export default function FeeForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: FeeSchemaType;
  close: () => void;
  relatedData?: {
    classes?: {
      id: number;
      name: string;
    }[];
  };
}) {
  const router = useRouter();
  const { classes = [] } = relatedData || {};
  const [step, setStep] = useState(0);

  /* ================= RHF (OUTPUT TYPE ONLY) ================= */

  const methods = useForm<FeeSchemaType>({
    resolver: zodResolver(FeeSchema) as any, // ✅ REQUIRED with z.coerce
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      amount: data?.amount ?? undefined,
      type: data?.type ?? "ADMISSION",
      classId: data?.classId ?? null,
      term: data?.term ?? null,
      isActive: data?.isActive ?? true,
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

  const feeType = watch("type");

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof FeeSchemaType)[][] = [
      ["title", "amount"],
      ["type", "term", "classId"],
    ];

    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => s + 1);
  };

  /* ================= SUBMIT ================= */

  const submitFinal = handleSubmit((values) => {
    startTransition(async () => {
      const parsed = FeeSchema.parse(values);

      const result =
        type === "create"
          ? await createFee({ success: false }, parsed)
          : await updateFee(
              { success: false },
              {
                ...parsed,
                id: data!.id!, // ✅ GUARANTEED ID for update
              },
            );

      if (result.success) {
        toast.success(
          `Fee ${type === "create" ? "created" : "updated"} successfully`,
        );
        close();
        router.refresh();
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  });

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form className="flex flex-col gap-4 max-h-[85vh]">
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Fee Structure" : "Update Fee Structure"}
        </h1>

        <FormStepper
          steps={steps}
          step={step}
          errorSteps={[
            Boolean(errors.title || errors.amount),
            Boolean(errors.type || errors.term || errors.classId),
          ]}
        />

        <div className="min-h-[180px]">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 0 && (
              <motion.div key="basic" className="space-y-4">
                <InputField label="Fee Title" name="title" />
                <InputField label="Amount (₹)" name="amount" type="number" />
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <motion.div key="classification" className="space-y-4">
                <RadixSelect
                  placeholder="Select Fee Type"
                  value={watch("type")}
                  onChange={(v) =>
                    setValue("type", v as FeeSchemaType["type"], {
                      shouldValidate: true,
                    })
                  }
                  options={[
                    { value: "ADMISSION", label: "Admission" },
                    { value: "TERM", label: "Term" },
                    { value: "ANNUAL", label: "Annual" },
                    { value: "MISC", label: "Miscellaneous" },
                  ]}
                />

                {feeType === "TERM" && (
                  <RadixSelect
                    placeholder="Select term"
                    value={watch("term") ?? ""}
                    onChange={(v) =>
                      setValue("term", v as FeeSchemaType["term"], {
                        shouldValidate: true,
                      })
                    }
                    options={[
                      { value: "TERM_1", label: "Term 1" },
                      { value: "TERM_2", label: "Term 2" },
                    ]}
                  />
                )}

                <RadixSelect
                  placeholder="All Classes"
                  value={
                    watch("classId") !== null ? String(watch("classId")) : ""
                  }
                  onChange={(v) =>
                    setValue("classId", v ? Number(v) : null, {
                      shouldValidate: true,
                    })
                  }
                  options={classes.map((cls) => ({
                    value: String(cls.id),
                    label: cls.name,
                  }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
              type="button"
              onClick={submitFinal}
              disabled={isSubmitting}
              className="bg-blue-800 text-white px-6 py-2 rounded-lg disabled:opacity-40"
            >
              {isSubmitting
                ? "Saving..."
                : type === "create"
                  ? "Create Fee"
                  : "Update Fee"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
