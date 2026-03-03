"use client";

import { useEffect, useState, startTransition, useActionState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject, ActionState } from "@/lib/actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import InputField from "../InputField";
import CollapsibleSection from "../CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

type Section = "basic" | "teachers";

const sectionFields: Record<Section, readonly (keyof SubjectSchema)[]> = {
  basic: ["name"],
  teachers: ["teachers"],
};

export default function SubjectForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: SubjectSchema;
  close: () => void;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
  };
}) {
  const router = useRouter();
  const teachers = relatedData?.teachers ?? [];

  const methods = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id,
      name: data?.name ?? "",
      teachers: data?.teachers ?? [],
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, submitCount, isSubmitting },
  } = methods;

  const [openSection, setOpenSection] = useState<Section>("basic");

  const [state, formAction] = useActionState<ActionState, SubjectSchema>(
    type === "create" ? createSubject : updateSubject,
    { success: false },
  );

  /* Auto-open section with first error */
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0] as keyof SubjectSchema;

      const section = (
        Object.entries(sectionFields) as [
          Section,
          readonly (keyof SubjectSchema)[],
        ][]
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
        `Subject ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[55vh] max-h-[65vh]">
        {/* ===== HEADER (FIXED) ===== */}
        <div className="shrink-0 px-4 sm:px-6 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Subject" : "Update Subject"}
          </h1>
          <p className="text-xs text-gray-500">
            Manage subject details and teacher assignment
          </p>
        </div>

        {/* ===== CONTENT (SCROLL ONLY) ===== */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 pb-2 space-y-4">
          {/* BASIC INFO */}
          <CollapsibleSection
            title="Basic Information"
            description="Subject name"
            icon="📘"
            open={openSection === "basic"}
            onToggle={() => setOpenSection("basic")}
          >
            <InputField label="Subject Name" name="name" />
          </CollapsibleSection>

          {/* TEACHERS */}
          <CollapsibleSection
            title="Teachers"
            description="Teachers assigned to this subject"
            icon="👩‍🏫"
            open={openSection === "teachers"}
            onToggle={() => setOpenSection("teachers")}
          >
            <div className="space-y-1">
              <label className="text-[8px] sm:text-[11px] font-bold text-gray-600">
                Select Teachers
              </label>

              <select
                multiple
                {...register("teachers")}
                value={watch("teachers")}
                className="
                  w-full min-h-[100px]
                  rounded-lg border border-gray-300
                  px-2 py-2 text-xs
                  outline-none transition
                  focus:border-blue-600 focus:ring-2 focus:ring-blue-100
                "
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} {t.surname}
                  </option>
                ))}
              </select>

              {errors.teachers && (
                <p className="text-[11px] text-red-500">
                  {errors.teachers.message as string}
                </p>
              )}
            </div>
          </CollapsibleSection>

          {submitCount > 0 && Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">
              Please fix the highlighted fields before saving.
            </div>
          )}
        </div>

        {/* ===== FOOTER (FIXED) ===== */}
        <div className="shrink-0 border-t bg-white px-4 sm:px-6 py-2">
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
                ? "Saving..."
                : type === "create"
                  ? "Create Subject"
                  : "Update Subject"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
