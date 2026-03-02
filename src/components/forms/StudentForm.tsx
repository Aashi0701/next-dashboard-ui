"use client";

import { useEffect, useState, startTransition, useActionState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studentSchema, StudentFormValues } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent, ActionState } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "../InputField";
import RadixDOBPicker from "@/components/ui/RadixDOBPicker";
import RadixSelect from "../ui/RadixSelect";
import CollapsibleSection from "../CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { Camera } from "lucide-react";

type Section = "personal" | "academic";

export default function StudentForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<StudentFormValues>;
  close: () => void;
  relatedData?: {
    classes: { id: number; name: string }[];
    parents: { id: string; name: string; surname: string }[];
  };
}) {
  const router = useRouter();
  const classes = relatedData?.classes ?? [];
  const parents = relatedData?.parents ?? [];

  const methods = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      ...data,
      classId: data?.classId ?? undefined,
      parentId: data?.parentId ?? undefined,
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { errors, submitCount, isSubmitting },
  } = methods;

  const [img, setImg] = useState<any>(data?.img ?? null);
  const [openSection, setOpenSection] = useState<Section>("personal");

  const sectionFields: Record<Section, readonly (keyof StudentFormValues)[]> = {
    personal: [
      "name",
      "surname",
      "email",
      "phone",
      "address",
      "bloodType",
      "birthday",
      "sex",
    ],
    academic: ["parentId", "classId"],
  };

  const [state, formAction] = useActionState<ActionState, StudentFormValues>(
    type === "create" ? createStudent : updateStudent,
    { success: false },
  );

  /* Auto-open section with first error */
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0] as keyof StudentFormValues;

      const section = (
        Object.entries(sectionFields) as [
          Section,
          readonly (keyof StudentFormValues)[],
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
    startTransition(() =>
      formAction({
        ...values,
        img:
          typeof img === "string" ? img.trim() || undefined : img?.secure_url,
      }),
    );
  });

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Student ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  return (
    <FormProvider {...methods}>
      <form className="flex flex-col h-[70vh] max-h-[75vh]" onSubmit={onSubmit}>
        {/* ===== HEADER (FIXED) ===== */}
        <div className="shrink-0 px-4 sm:px-6 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Student" : "Update Student"}
          </h1>
          <p className="text-xs text-gray-500">
            Manage student personal and academic details
          </p>
        </div>

        {/* ===== CONTENT (SCROLL ONLY) ===== */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 pb-24 space-y-4">
          {/* PERSONAL */}
          <CollapsibleSection
            title="Personal Information"
            description="Basic student details"
            icon="👤"
            open={openSection === "personal"}
            onToggle={() => setOpenSection("personal")}
          >
            <div className="grid sm:grid-cols-2 gap-1.5 sm:gap-4">
              <InputField label="First Name" name="name" />
              <InputField label="Last Name" name="surname" />
              <InputField label="Email" name="email" />
              <InputField label="Phone" name="phone" type="phone" />
              <InputField label="Address" name="address" />
              <InputField label="Blood Type" name="bloodType" />

              <div className="sm:col-span-2">
                <label className="text-[8px] sm:text-[11px] font-bold text-gray-600">
                  Date of Birth
                </label>
                <RadixDOBPicker
                  value={watch("birthday")}
                  onChange={(d) =>
                    setValue("birthday", d, {
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              <div className="w-full space-y-1">
                <label className="text-[8px] sm:text-[11px] font-bold text-gray-600">
                  Gender
                </label>
                <RadixSelect
                  value={watch("sex")}
                  onChange={(v) =>
                    setValue("sex", v as StudentFormValues["sex"], {
                      shouldValidate: true,
                    })
                  }
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                  ]}
                />
              </div>

              {/* PHOTO */}
              <CldUploadWidget
                uploadPreset="school"
                onSuccess={(res) => setImg(res.info)}
              >
                {({ open }) => (
                  <div className="sm:col-span-2">
                    {(
                      typeof img === "string" ? img.trim() : img?.secure_url
                    ) ? (
                      <div className="flex items-center gap-3">
                        <Image
                          src={typeof img === "string" ? img : img.secure_url}
                          alt="Avatar"
                          width={56}
                          height={56}
                          className="rounded-full border"
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => open()}
                            className="text-xs text-blue-600"
                          >
                            Replace photo
                          </button>
                          <button
                            type="button"
                            onClick={() => setImg(undefined)}
                            className="text-[11px] text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => open()}
                        className="w-full h-10 border rounded-lg bg-gray-50 text-xs flex items-center justify-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Upload photo
                      </button>
                    )}
                  </div>
                )}
              </CldUploadWidget>
            </div>
          </CollapsibleSection>

          {/* ACADEMIC */}
          <CollapsibleSection
            title="Academic Information"
            description="Class and parent details"
            icon="🎓"
            open={openSection === "academic"}
            onToggle={() => setOpenSection("academic")}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <RadixSelect
                value={watch("parentId") ?? ""}
                onChange={(v) =>
                  setValue("parentId", v ?? "", { shouldValidate: true })
                }
                placeholder="Select Parent"
                options={parents.map((p) => ({
                  value: p.id,
                  label: `${p.name} ${p.surname}`,
                }))}
              />

              <RadixSelect
                value={watch("classId") ? String(watch("classId")) : ""}
                onChange={(v) =>
                  setValue("classId", Number(v), { shouldValidate: true })
                }
                placeholder="Select Class"
                options={classes.map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
              />
            </div>
          </CollapsibleSection>

          {submitCount > 0 && Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-2 text-xs text-red-700">
              Please fix the highlighted fields before saving.
            </div>
          )}
        </div>

        {/* ===== FOOTER (FIXED) ===== */}
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
                ? "Saving..."
                : type === "create"
                  ? "Create Student"
                  : "Update Student"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
