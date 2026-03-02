"use client";

import { useEffect, startTransition, useActionState, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parentSchema, ParentFormValues } from "@/lib/formValidationSchemas";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import CollapsibleSection from "../CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import { ActionState } from "@/lib/actions";

/* ===== Password strength ===== */
function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

type Section = "account" | "personal";

export default function ParentForm({
  type,
  data,
  close,
}: {
  type: "create" | "update";
  data?: ParentFormValues;
  close: () => void;
}) {
  const router = useRouter();

  const methods = useForm<ParentFormValues>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      id: data?.id,
      username: data?.username ?? "",
      password: "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      address: data?.address ?? "",
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    watch,
    formState: { errors, submitCount, isSubmitting },
  } = methods;

  const [state, formAction] = useActionState<ActionState, ParentFormValues>(
    type === "create" ? createParent : updateParent,
    { success: false },
  );

  const [openSection, setOpenSection] = useState<Section>("account");

  const sectionFields: Record<Section, readonly (keyof ParentFormValues)[]> = {
    account: ["username", "email", "phone", "password"],
    personal: ["name", "surname", "address"],
  };

  /* Auto-expand section + scroll to first error */
  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      const firstErrorField = Object.keys(errors)[0] as keyof ParentFormValues;

      const section = (
        Object.entries(sectionFields) as [
          Section,
          readonly (keyof ParentFormValues)[],
        ][]
      ).find(([, fields]) => fields.includes(firstErrorField))?.[0];

      if (section) setOpenSection(section);

      requestAnimationFrame(() => {
        document
          .querySelector(`[name="${firstErrorField}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [errors, submitCount]);

  /* Success / Error */
  useEffect(() => {
    if (state.success) {
      toast.success(
        `Parent ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  const password = watch("password") ?? "";
  const strength = passwordStrength(password);
  const strengthLabel = ["Weak", "Weak", "Okay", "Good", "Strong"][strength];

  return (
    <FormProvider {...methods}>
      <form className="flex flex-col h-[65vh]" onSubmit={onSubmit}>
        {/* HEADER */}
        <div className="shrink-0 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Parent" : "Update Parent"}
          </h1>
          <p className="text-xs text-gray-500">
            Manage parent account and personal details
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto space-y-4 px-1">
          <CollapsibleSection
            title="Parent Account"
            description="Login credentials and contact details"
            icon="👤"
            open={openSection === "account"}
            onToggle={() => setOpenSection("account")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <InputField
                label="Username"
                name="username"
                readOnly={type === "update"}
              />
              <InputField
                label="Email"
                name="email"
                type="email"
                readOnly={type === "update"}
              />
              <InputField label="Phone" name="phone" />

              {type === "create" && (
                <div className="space-y-1.5">
                  <InputField
                    label="Password"
                    name="password"
                    type="password"
                  />
                  {password && (
                    <>
                      <div className="h-1 rounded bg-gray-200">
                        <div
                          className={`h-1 rounded transition-all ${
                            strength <= 1
                              ? "bg-red-500 w-1/4"
                              : strength === 2
                                ? "bg-yellow-500 w-2/4"
                                : strength === 3
                                  ? "bg-blue-500 w-3/4"
                                  : "bg-green-600 w-full"
                          }`}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Password strength: <b>{strengthLabel}</b>
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Personal Information"
            description="Basic personal and address details"
            icon="🏠"
            open={openSection === "personal"}
            onToggle={() => setOpenSection("personal")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-4 gap-1">
              <InputField label="First Name" name="name" />
              <InputField label="Last Name" name="surname" />
              <InputField
                label="Address"
                name="address"
                type="textarea"
                className="sm:col-span-2"
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
        <div className="shrink-0 border-t bg-white pt-3 sticky bottom-0">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={close}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
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
                  ? "Create Parent"
                  : "Update Parent"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
