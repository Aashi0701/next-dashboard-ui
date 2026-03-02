"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  holidaySchema,
  HolidayFormInput,
} from "@/lib/formValidationSchemas";
import { createHoliday, updateHoliday, ActionState } from "@/lib/actions";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import CollapsibleSection from "@/components/CollapsibleSection";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import InputField from "../InputField";
import RadixDatePicker from "@/components/ui/RadixDatePicker";
import RadixSelect from "@/components/ui/RadixSelect";

import { CalendarDays } from "lucide-react";

/* ================= TYPES ================= */

type Section = "details" | "type";

export default function HolidayForm({
  type,
  data,
  close,
}: {
  type: "create" | "update";
  data?: {
    id: number;
    title: string;
    date: Date;
    isFullDay: boolean;
  };
  close: () => void;
}) {
  const router = useRouter();

  /* ================= COLLAPSIBLE STATE ================= */

  const [openSection, setOpenSection] = useState<Section>("details");

  /* ================= RHF ================= */

  const methods = useForm<HolidayFormInput>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      date: data?.date ? new Date(data.date) : new Date(),
      isFullDay: data?.isFullDay ? "FULL" : "HALF",
    },
    mode: "onSubmit",
  });

  const { control, handleSubmit } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, any>(
    type === "create" ? createHoliday : updateHoliday,
    { success: false },
  );

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => {
      const payload = {
        title: values.title,
        date: values.date,
        isFullDay: values.isFullDay === "FULL",
      };

      if (type === "create") {
        formAction(payload);
      } else {
        formAction({ id: data!.id, ...payload });
      }
    });
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Holiday ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [state, router, close, type]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[60vh]">
        {/* HEADER */}
        <div className="shrink-0 px-4 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Holiday" : "Update Holiday"}
          </h1>
          <p className="text-xs text-gray-500">
            Holiday details and type
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* DETAILS */}
          <CollapsibleSection
            title="Holiday Details"
            icon={<CalendarDays className="h-4 w-4 text-purple-600" />}
            open={openSection === "details"}
            onToggle={() => setOpenSection("details")}
          >
            <div className="space-y-4">
              <InputField label="Holiday Title" name="title" />

              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <RadixDatePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </CollapsibleSection>

          {/* TYPE */}
          <CollapsibleSection
            title="Holiday Type"
            icon={<CalendarDays className="h-4 w-4 text-purple-600" />}
            open={openSection === "type"}
            onToggle={() => setOpenSection("type")}
          >
            <Controller
              name="isFullDay"
              control={control}
              render={({ field }) => (
                <RadixSelect
                  placeholder="Holiday type"
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "FULL", label: "Full Day" },
                    { value: "HALF", label: "Half Day" },
                  ]}
                />
              )}
            />
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
            {type === "create" ? "Create Holiday" : "Update Holiday"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}