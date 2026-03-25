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
    students: {
      id: string;
      name: string;
      surname: string;
      classId: number;
      className: string;
    }[];
    lessons: {
      id: number;
      subjectName: string;
      classId: number;
      className: string;
    }[];
  };
}) {
  const { students = [], lessons = [] } = relatedData;

  const [openSection, setOpenSection] = useState<"lesson" | "student">(
    "lesson",
  );
  const [submitting, setSubmitting] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  /* ================= RHF ================= */

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
  const watchedLessonId = useWatch({ control, name: "lessonId" });

  /* ================= DERIVED ================= */

  const classOptions = Array.from(
    new Map(lessons.map((l) => [l.classId, l.className])).entries(),
  ).map(([id, name]) => ({
    value: String(id),
    label: name,
  }));

  const filteredLessons = selectedClassId
    ? lessons.filter((l) => l.classId === selectedClassId)
    : [];

  const filteredStudents = selectedClassId
    ? students.filter((s) => s.classId === selectedClassId)
    : [];

  /* ================= AUTO SET CLASS (EDIT) ================= */

  useEffect(() => {
    if (data?.lessonId && lessons.length) {
      const lesson = lessons.find((l) => l.id === data.lessonId);
      if (lesson) {
        setSelectedClassId(lesson.classId);
      }
    }
  }, [data, lessons]);

  /* ================= AUTO ADVANCE ================= */

  useEffect(() => {
    if (watchedLessonId && watchedDate) {
      setOpenSection("student");
    }
  }, [watchedLessonId, watchedDate]);

  /* ================= SUBMIT ================= */

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
          `Attendance ${
            type === "create" ? "created" : "updated"
          } successfully`,
        );
        close();
        return;
      }

      if (result.error) toast.error(result.error);
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  });

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col h-[60vh]">
        {/* HEADER */}
        <div className="shrink-0 px-4 pb-2">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Attendance" : "Update Attendance"}
          </h1>
          <p className="text-xs text-gray-500">
            Manage Student Attendance Details 
          </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* LESSON */}
          <CollapsibleSection
            title="Class & Date"
            description="Class and Date mapping"
            icon={<CalendarDays className="h-4 w-4 text-purple-600" />}
            open={openSection === "lesson"}
            onToggle={() => setOpenSection("lesson")}
          >
            <div className="space-y-3">
              {/* CLASS */}
              <RadixSelect
                placeholder="Select class"
                value={selectedClassId ? String(selectedClassId) : ""}
                onChange={(v) => {
                  const classId = Number(v);
                  setSelectedClassId(classId);

                  setValue("lessonId", undefined);
                  setValue("studentId", "");
                }}
                options={classOptions}
              />

              {/* LESSON */}
              {/* <RadixSelect
                placeholder={
                  selectedClassId ? "Select lesson" : "Select class first"
                }
                value={watch("lessonId") ? String(watch("lessonId")) : ""}
                onChange={(v) =>
                  setValue("lessonId", Number(v), {
                    shouldValidate: true,
                  })
                }
                options={filteredLessons.map((l) => ({
                  value: String(l.id),
                  label: `${l.subjectName} / ${l.className}`,
                }))}
                disabled={!selectedClassId}
              /> */}

              {/* DATE */}
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
            description="Present or Absent mapping"
            icon={<UserCheck className="h-4 w-4 text-purple-600" />}
            open={openSection === "student"}
            onToggle={() => setOpenSection("student")}
          >
            <div className="space-y-3">
              <RadixSelect
                placeholder={
                  selectedClassId ? "Select student" : "Select class first"
                }
                value={watch("studentId")}
                onChange={(v) =>
                  setValue("studentId", v ?? "", {
                    shouldValidate: true,
                  })
                }
                options={filteredStudents.map((s) => ({
                  value: s.id,
                  label: `${s.name} ${s.surname}`,
                }))}
                disabled={!selectedClassId}
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
            disabled={submitting}
            className="text-xs text-gray-600"
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
