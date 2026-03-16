"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FeeSchema,
  FeeFormInput,
  FeeSchemaType,
} from "@/lib/formValidationSchemas";
import { createFee, updateFee, ActionState } from "@/lib/actions";
import { toast } from "react-toastify";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import CollapsibleSection from "@/components/CollapsibleSection";
import { Wallet } from "lucide-react";

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
    classes?: { id: number; name: string }[];
  };
}) {
  const { classes = [] } = relatedData || {};

  /* ================= RHF (IMPORTANT FIX HERE) ================= */

  const methods = useForm<FeeFormInput>({
    resolver: zodResolver(FeeSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      amount: data?.amount ?? undefined,
      type: data?.type ?? "ADMISSION",
      classId: data?.classId ?? null,
      term: data?.term ?? null,
      isActive: data?.isActive ?? true,
    },
    mode: "onSubmit",
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const feeType = watch("type");

  /* ================= ACTION ================= */

  const feeAction = async (
    prev: ActionState,
    payload: FeeSchemaType,
  ): Promise<ActionState> => {
    return type === "create"
      ? createFee(prev, payload)
      : updateFee(prev, payload as FeeSchemaType & { id: number });
  };

  const [state, formAction] = useActionState<ActionState, FeeSchemaType>(
    feeAction,
    { success: false },
  );

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    // values are FeeFormInput → resolver converts to FeeSchemaType
    startTransition(() => formAction(values as FeeSchemaType));
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Fee ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state, close, type]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[60vh]">
        {/* HEADER */}
        <div className="shrink-0 px-4 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create"
              ? "Create Fee Structure"
              : "Update Fee Structure"}
          </h1>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <CollapsibleSection
            title="Fee Details"
            description="Amount, classification and class mapping"
            icon={<Wallet className="h-4 w-4 text-purple-600" />}
            open
            onToggle={() => {}}
          >
            <div className="space-y-4">
              <InputField label="Fee Title" name="title" />

              <InputField
                label="Amount (₹)"
                name="amount"
                type="number"
              />

              <RadixSelect
                placeholder="Fee Type"
                value={watch("type")}
                onChange={(v) =>
                  setValue("type", v as FeeFormInput["type"])
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
                  placeholder="Select Term"
                  value={watch("term") ?? ""}
                  onChange={(v) =>
                    setValue("term", v as FeeFormInput["term"])
                  }
                  options={[
                    { value: "TERM_1", label: "Term 1" },
                    { value: "TERM_2", label: "Term 2" },
                  ]}
                />
              )}

              <RadixSelect
                placeholder="Applicable Class"
                value={
                  watch("classId") !== null
                    ? String(watch("classId"))
                    : ""
                }
                onChange={(v) =>
                  setValue("classId", v ? Number(v) : null)
                }
                options={classes.map((cls) => ({
                  value: String(cls.id),
                  label: cls.name,
                }))}
              />
            </div>
          </CollapsibleSection>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t px-4 py-3 flex justify-end gap-2">
          <button type="button" onClick={close} className="text-xs">
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs"
          >
            {isSubmitting
              ? "Saving..."
              : type === "create"
              ? "Create Fee"
              : "Update Fee"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}