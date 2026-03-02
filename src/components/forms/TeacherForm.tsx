"use client";

import { useEffect, useState, startTransition, useActionState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { teacherSchema, TeacherFormValues } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import RadixMultiSelect from "@/components/ui/RadixMultiSelect";
import RadixDOBPicker from "@/components/ui/RadixDOBPicker";
import CollapsibleSection from "../CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { ActionState } from "@/lib/actions";

type Section = "account" | "personal" | "subjects";

export default function TeacherForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: TeacherFormValues;
  close: () => void;
  relatedData?: {
    subjects: { id: number; name: string }[];
    classes: { id: number; name: string }[];
  };
}) {
  const router = useRouter();
  const subjects = relatedData?.subjects ?? [];
  const classes = relatedData?.classes ?? [];

  const methods = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      id: data?.id,
      username: data?.username ?? "",
      email: data?.email ?? "",
      password: "",
      phone: data?.phone ?? "",
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      address: data?.address ?? "",
      bloodType: data?.bloodType ?? "",
      birthday: data?.birthday ? new Date(data.birthday) : undefined,
      sex: data?.sex ?? "MALE",
      subjects: data?.subjects ?? [],
      supervisedClasses: Array.isArray(data?.supervisedClasses)
        ? data.supervisedClasses.map((c: any) =>
            typeof c === "string" ? c : String(c.id),
          )
        : [],
      img: data?.img,
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
  const [openSection, setOpenSection] = useState<Section>("account");

  const sectionFields: Record<Section, readonly (keyof TeacherFormValues)[]> = {
    account: ["username", "email", "password", "phone"],
    personal: ["name", "surname", "address", "bloodType", "birthday", "sex"],
    subjects: ["subjects"],
  };

  const [state, formAction] = useActionState<ActionState, TeacherFormValues>(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
    },
  );

  /* Auto-open section with first error */
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0] as keyof TeacherFormValues;

      const section = (
        Object.entries(sectionFields) as [
          Section,
          readonly (keyof TeacherFormValues)[],
        ][]
      ).find(([, fields]) => fields.includes(firstError))?.[0];

      if (section) setOpenSection(section);

      requestAnimationFrame(() => {
        document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
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
        `Teacher ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col h-[65dvh]"
      >
        {/* HEADER */}
        <div className="shrink-0 pb-3 px-4 sm:px-6">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Teacher" : "Update Teacher"}
          </h1>
          <p className="text-xs text-gray-500">
            Manage teacher account and profile details
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 pb-6 space-y-4">
          {/* ACCOUNT */}
          <CollapsibleSection
            title="Teacher Account"
            description="Login and contact details"
            icon="👤"
            open={openSection === "account"}
            onToggle={() => setOpenSection("account")}
          >
            <div className="grid sm:grid-cols-2 gap-1.5 sm:gap-4">
              <InputField
                label="Username"
                name="username"
                readOnly={type === "update"}
              />
              <InputField label="Email" name="email" />
              <InputField label="Phone" name="phone" type="phone" />

              {type === "create" && (
                <InputField label="Password" name="password" type="password" />
              )}

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
                        className="w-full h-10 border rounded-lg bg-gray-50 text-xs"
                      >
                        Upload photo
                      </button>
                    )}
                  </div>
                )}
              </CldUploadWidget>
            </div>
          </CollapsibleSection>

          {/* PERSONAL */}
          <CollapsibleSection
            title="Personal Information"
            description="Basic personal and address details"
            icon="🏠"
            open={openSection === "personal"}
            onToggle={() => setOpenSection("personal")}
          >
            <div className="grid sm:grid-cols-2 gap-1.5 sm:gap-4">
              <InputField label="First Name" name="name" />
              <InputField label="Last Name" name="surname" />
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
                    setValue("sex", v as "MALE" | "FEMALE", {
                      shouldValidate: true,
                    })
                  }
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                  ]}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* SUBJECTS */}
          <CollapsibleSection
            title="Subjects"
            description="Subjects assigned to teacher"
            icon="📚"
            open={openSection === "subjects"}
            onToggle={() => setOpenSection("subjects")}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <RadixMultiSelect
                placeholder="Select subjects"
                value={watch("subjects") ?? []}
                onChange={(v) =>
                  setValue("subjects", v, {
                    shouldValidate: true,
                  })
                }
                options={subjects.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
              />

              <RadixMultiSelect
                placeholder="Select supervised classes"
                value={watch("supervisedClasses") ?? []}
                onChange={(values) =>
                  setValue("supervisedClasses", values, {
                    shouldValidate: true,
                  })
                }
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

        {/* FOOTER */}
        <div className="shrink-0 border-t bg-white px-4 sm:px-6 py-1 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={close}
              className="px-3 py-2 text-xs text-gray-600"
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
                  ? "Create Teacher"
                  : "Update Teacher"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
