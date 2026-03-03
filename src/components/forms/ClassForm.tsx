"use client";

import { useEffect, startTransition, useActionState, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass, ActionState } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import CollapsibleSection from "../CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

type Section = "basic" | "assignments";

const SECTION_FIELDS: Record<Section, (keyof ClassSchema)[]> = {
  basic: ["name", "capacity"],
  assignments: ["supervisorId"],
};

export default function ClassForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<ClassSchema>;
  close: () => void;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
  };
}) {
  const router = useRouter();
  const teachers = relatedData?.teachers ?? [];

  const methods = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      capacity: data?.capacity ?? 1,
      supervisorId: data?.supervisorId,
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, submitCount, isSubmitting },
  } = methods;

  const [openSection, setOpenSection] = useState<Section>("basic");

  const [state, formAction] = useActionState<ActionState, ClassSchema>(
    type === "create" ? createClass : updateClass,
    { success: false },
  );

  /* Auto-open section with first error */
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0] as keyof ClassSchema;

      const section = (
        Object.entries(SECTION_FIELDS) as [Section, (keyof ClassSchema)[]][]
      ).find(([, fields]) => fields.includes(firstError))?.[0];

      if (section) setOpenSection(section);

      requestAnimationFrame(() => {
        document
          .querySelector(`[name="${firstError}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [errors, submitCount]);

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Class ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }

    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[65dvh]">
        {/* HEADER */}
        <div className="shrink-0 pb-3 px-4 sm:px-6">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Class" : "Update Class"}
          </h1>
          <p className="text-xs text-gray-500">
            Manage class details and assignments
          </p>
        </div>

        {/* CONTENT (SCROLL ONLY HERE) */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 pb-6 space-y-4">
          {/* BASIC INFO */}
          <CollapsibleSection
            title="Basic Information"
            description="Class name and capacity"
            icon="🏫"
            open={openSection === "basic"}
            onToggle={() => setOpenSection("basic")}
          >
            <div className="space-y-3">
              <InputField label="Class Name" name="name" />
              <InputField label="Capacity" name="capacity" type="number" />
            </div>
          </CollapsibleSection>

          {/* ASSIGNMENTS */}
          <CollapsibleSection
            title="Assignments"
            description="Class supervisor"
            icon="👩‍🏫"
            open={openSection === "assignments"}
            onToggle={() => setOpenSection("assignments")}
          >
            <RadixSelect
              placeholder="Select Class Supervisor"
              value={watch("supervisorId")}
              onChange={(v) => {
                if (!v) return; // ✅ ignore undefined
                setValue("supervisorId", v, { shouldValidate: true });
              }}
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.name} ${t.surname}`,
              }))}
            />
          </CollapsibleSection>

          {submitCount > 0 && Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">
              Please fix the highlighted fields before saving.
            </div>
          )}
        </div>

        {/* FOOTER (FIXED) */}
        <div className="shrink-0 border-t bg-white px-4 sm:px-6 py-3">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="px-3 py-1.5 text-xs text-gray-600"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-xs disabled:opacity-50"
            >
              {isSubmitting
                ? type === "create"
                  ? "Creating..."
                  : "Updating..."
                : type === "create"
                  ? "Create Class"
                  : "Update Class"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
