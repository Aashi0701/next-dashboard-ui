"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  attendanceSchema,
  AttendanceFormInput,
  AttendanceFormValues,
} from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { toast } from "react-toastify";
import ModalCloseButton from "@/components/ui/ModalCloseButton";
import CollapsibleSection from "@/components/CollapsibleSection";
import RadixSelect from "@/components/ui/RadixSelect";
import RadixDatePicker from "@/components/ui/RadixDatePicker";
import { CalendarDays, UserCheck } from "lucide-react";

export default function AttendanceForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: AttendanceFormValues;
  close: () => void;
  relatedData: {
    students: { id: string; name: string; surname: string }[];
    lessons: {
      id: number;
      subject?: { name: string };
      class?: { name: string };
    }[];
  };
}) {
  const { students, lessons } = relatedData;

  /* ---------------- ACCORDION ---------------- */

  const [openSection, setOpenSection] = useState<"lesson" | "student">("lesson");
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- RHF ---------------- */

  const methods = useForm<AttendanceFormInput>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      id: data?.id,
      studentId: data?.studentId ?? "",
      lessonId: data?.lessonId,
      date: data?.date ?? new Date(),
      present: data?.present ?? true,
    },
  });

  const { watch, setValue, handleSubmit, control } = methods;

  const watchedDate = useWatch({
    control,
    name: "date",
  }) as Date | undefined;

  /* ---------------- AUTO ADVANCE ---------------- */

  useEffect(() => {
    if (watch("lessonId") && watchedDate) {
      setOpenSection("student");
    }
  }, [watch("lessonId"), watchedDate]);

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = handleSubmit(async (values) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const result =
        type === "create"
          ? await createAttendance({ success: false }, values)
          : await updateAttendance({ success: false }, values);

      if (result.success) {
        toast.success(
          `Attendance ${type === "create" ? "created" : "updated"} successfully`,
        );
        close(); // ✅ ALWAYS closes modal
        return;
      }

      if (result.error) {
        toast.error(result.error);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  });

  /* ---------------- UI ---------------- */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[60vh]">
        {/* HEADER */}
        <div className="shrink-0 px-4 pb-2">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Attendance" : "Update Attendance"}
          </h1>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* LESSON */}
          <CollapsibleSection
            title="Lesson & Date"
            icon={<CalendarDays className="h-4 w-4 text-purple-600" />}
            open={openSection === "lesson"}
            onToggle={() => setOpenSection("lesson")}
          >
            <div className="space-y-3">
              <RadixSelect
                placeholder="Select lesson"
                value={watch("lessonId") ? String(watch("lessonId")) : ""}
                onChange={(v) =>
                  setValue("lessonId", Number(v), { shouldValidate: true })
                }
                options={lessons.map((l) => ({
                  value: String(l.id),
                  label: `${l.subject?.name ?? "Subject"} / ${
                    l.class?.name ?? "Class"
                  }`,
                }))}
              />

              <RadixDatePicker
                value={watchedDate}
                onChange={(d) =>
                  d && setValue("date", d, { shouldValidate: true })
                }
              />
            </div>
          </CollapsibleSection>

          {/* STUDENT */}
          <CollapsibleSection
            title="Student Attendance"
            icon={<UserCheck className="h-4 w-4 text-purple-600" />}
            open={openSection === "student"}
            onToggle={() => setOpenSection("student")}
          >
            <div className="space-y-3">
              <RadixSelect
                placeholder="Select student"
                value={watch("studentId")}
                onChange={(v) =>
                  setValue("studentId", v ?? "", {
                    shouldValidate: true,
                  })
                }
                options={students.map((s) => ({
                  value: s.id,
                  label: `${s.name} ${s.surname}`,
                }))}
              />

              <RadixSelect
                placeholder="Status"
                value={watch("present") ? "true" : "false"}
                onChange={(v) =>
                  setValue("present", v === "true", {
                    shouldValidate: true,
                  })
                }
                options={[
                  { value: "true", label: "Present" },
                  { value: "false", label: "Absent" },
                ]}
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
            disabled={submitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-xs disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : type === "create"
                ? "Create Attendance"
                : "Update Attendance"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}