"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  announcementFormSchema,
  AnnouncementFormInput,
  AnnouncementFormValues,
} from "@/lib/formValidationSchemas";
import {
  createAnnouncement,
  updateAnnouncement,
  ActionState,
} from "@/lib/actions";

import { toast } from "react-toastify";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import CollapsibleSection from "@/components/CollapsibleSection";
import InputField from "../InputField";
import RadixDatePicker from "@/components/ui/RadixDatePicker";
import RadixSelect from "@/components/ui/RadixSelect";
import { Megaphone } from "lucide-react";

type AnnouncementAction = (
  prev: ActionState,
  data: AnnouncementFormValues,
) => Promise<ActionState>;

export default function AnnouncementForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: AnnouncementFormValues;
  close: () => void;
  relatedData?: {
    classes: { id: number; name: string }[];
  };
}) {
  const classes = relatedData?.classes ?? [];

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
    mode: "onSubmit",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  /* ================= ACTION ================= */

  const announcementAction: AnnouncementAction = (prev, payload) => {
    return type === "create"
      ? createAnnouncement(prev, payload)
      : updateAnnouncement(prev, payload);
  };

  const [state, formAction] = useActionState<
    ActionState,
    AnnouncementFormValues
  >(announcementAction, { success: false });

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Announcement ${
          type === "create" ? "created" : "updated"
        } successfully`,
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
            {type === "create" ? "Create Announcement" : "Update Announcement"}
          </h1>
          <p className="text-xs text-gray-500">
            Title, description, schedule, and class targeting
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <CollapsibleSection
            title="Announcement Details"
            description="Message and visibility"
            icon={<Megaphone className="h-4 w-4 text-purple-600" />}
            open
            onToggle={() => {}}
          >
            <div className="space-y-4">
              <InputField label="Title" name="title" />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              />

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
            </div>
          </CollapsibleSection>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t px-4 py-3 flex justify-end gap-2">
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
                ? "Create Announcement"
                : "Update Announcement"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
