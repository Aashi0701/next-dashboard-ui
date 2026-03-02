"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  eventSchema,
  EventFormInput,
  EventFormValues,
} from "@/lib/formValidationSchemas";
import { createEvent, updateEvent, ActionState } from "@/lib/actions";

import ModalCloseButton from "@/components/ui/ModalCloseButton";
import CollapsibleSection from "@/components/CollapsibleSection";
import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import RadixDateTimePicker from "@/components/ui/RadixDateTimePicker";

import { CalendarDays } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Section = "details" | "schedule";

export default function EventForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: EventFormValues;
  close: () => void;
  relatedData?: {
    classes: { id: number; name: string }[];
  };
}) {
  const router = useRouter();
  const classes = relatedData?.classes ?? [];

  /* ================= COLLAPSIBLE STATE ================= */

  const [openSection, setOpenSection] = useState<Section>("details");

  /* ================= RHF ================= */

  const methods = useForm<EventFormInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      description: data?.description ?? "",
      startTime: data?.startTime ? new Date(data.startTime) : undefined,
      endTime: data?.endTime ? new Date(data.endTime) : undefined,
      classId: data?.classId ?? undefined,
      category: data?.category ?? "default",
    },
    mode: "onSubmit",
  });

  const { handleSubmit, setValue, control, watch } = methods;

  /* ================= WATCH DATES ================= */

  const startTime = useWatch({
    control,
    name: "startTime",
  }) as Date | undefined;

  const endTime = useWatch({
    control,
    name: "endTime",
  }) as Date | undefined;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, EventFormInput>(
    type === "create" ? createEvent : updateEvent,
    { success: false },
  );

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Event ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state, close, router, type]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[60vh]">
        {/* HEADER */}
        <div className="shrink-0 px-4 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Event" : "Update Event"}
          </h1>
          <p className="text-xs text-gray-500">
            Event details, schedule, and class visibility
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* DETAILS */}
          <CollapsibleSection
            title="Event Details"
            icon={<CalendarDays className="h-4 w-4 text-purple-600" />}
            open={openSection === "details"}
            onToggle={() => setOpenSection("details")}
          >
            <div className="space-y-4">
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
                placeholder="Select class (optional)"
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
            </div>
          </CollapsibleSection>

          {/* SCHEDULE */}
          <CollapsibleSection
            title="Schedule"
            icon={<CalendarDays className="h-4 w-4 text-purple-600" />}
            open={openSection === "schedule"}
            onToggle={() => setOpenSection("schedule")}
          >
            <div className="space-y-4">
              <RadixDateTimePicker
                value={startTime}
                onChange={(d) =>
                  d &&
                  setValue("startTime", d, {
                    shouldValidate: true,
                  })
                }
              />

              <RadixDateTimePicker
                value={endTime}
                onChange={(d) =>
                  d &&
                  setValue("endTime", d, {
                    shouldValidate: true,
                  })
                }
              />
            </div>
          </CollapsibleSection>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t px-4 py-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="text-xs text-gray-600"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-xs"
          >
            {type === "create" ? "Create Event" : "Update Event"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}