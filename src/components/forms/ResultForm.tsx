"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { resultSchema, ResultFormValues } from "@/lib/formValidationSchemas";
import { createResult, updateResult, ActionState } from "@/lib/actions";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import ModalCloseButton from "@/components/ui/ModalCloseButton";
import InputField from "../InputField";
import RadixSelect from "@/components/ui/RadixSelect";
import CollapsibleSection from "../CollapsibleSection";

type Section = "score" | "target";

export default function ResultForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: ResultFormValues;
  close: () => void;
  relatedData?: {
    students: {
      id: string;
      name: string;
      surname: string;
      classId: number;
      className: string;
    }[];
    exams: { id: number; title: string; classId: number }[];
    assignments: { id: number; title: string; classId: number }[];
  };
}) {
  const router = useRouter();
  const { students = [], exams = [], assignments = [] } = relatedData || {};

  const [openSection, setOpenSection] = useState<Section>("score");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  /* ================= RHF ================= */

  const methods = useForm<ResultFormValues>({
    resolver: zodResolver(resultSchema) as any,
    defaultValues: {
      id: data?.id,
      score: data?.score ?? undefined,
      studentId: data?.studentId ?? "",
      examId: data?.examId,
      assignmentId: data?.assignmentId,
    },
    mode: "onSubmit",
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { errors, submitCount, isSubmitting },
  } = methods;

  /* ================= DERIVED ================= */

  const classOptions = Array.from(
    new Map(students.map((s) => [s.classId, s.className])).entries(),
  ).map(([id, name]) => ({
    value: String(id),
    label: name,
  }));

  const filteredStudents = selectedClassId
    ? students.filter((s) => s.classId === selectedClassId)
    : [];

  const filteredExams = selectedClassId
    ? exams.filter((e) => e.classId === selectedClassId)
    : [];

  const filteredAssignments = selectedClassId
    ? assignments.filter((a) => a.classId === selectedClassId)
    : [];

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, ResultFormValues>(
    type === "create" ? createResult : updateResult,
    { success: false },
  );

  /* ================= AUTO SET CLASS (EDIT) ================= */

  useEffect(() => {
    if (data?.studentId) {
      const student = students.find((s) => s.id === data.studentId);
      if (student) {
        setSelectedClassId(student.classId);
      }
    }
  }, [data, students]);

  /* ================= ERROR SECTION ================= */

  useEffect(() => {
    if (submitCount > 0 && Object.keys(errors).length > 0) {
      if (errors.score || errors.studentId) setOpenSection("score");
      else setOpenSection("target");
    }
  }, [errors, submitCount]);

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  /* ================= EFFECT ================= */

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Result ${type === "create" ? "created" : "updated"} successfully`,
      );
      close();
      router.refresh();
    }

    if (state.error) toast.error(state.error);
  }, [state, router, close, type]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form className="flex flex-col h-[60vh]" onSubmit={onSubmit}>
        {/* HEADER */}
        <div className="shrink-0 px-4 pb-3">
          <ModalCloseButton onClose={close} />
          <h1 className="text-base font-semibold">
            {type === "create" ? "Create Result" : "Update Result"}
          </h1>
          <p className="text-xs text-gray-500"> Student score and assessment mapping </p>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 space-y-4">
          <CollapsibleSection
            title="Score Details"
            description="Score and student"
            icon="📝"
            open={openSection === "score"}
            onToggle={() => setOpenSection("score")}
          >
            <div className="space-y-4">
              <InputField label="Score" name="score" />

              {/* CLASS */}
              <RadixSelect
                placeholder="Select Class"
                value={selectedClassId ? String(selectedClassId) : ""}
                onChange={(v) => {
                  const classId = Number(v);
                  setSelectedClassId(classId);

                  setValue("studentId", "");
                  setValue("examId", undefined);
                  setValue("assignmentId", undefined);
                }}
                options={classOptions}
              />

              {/* STUDENT */}
              <RadixSelect
                placeholder="Select student"
                value={watch("studentId") || ""}
                onChange={(v) =>
                  setValue("studentId", v ?? "", { shouldValidate: true })
                }
                options={filteredStudents.map((s) => ({
                  value: s.id,
                  label: `${s.name} ${s.surname}`,
                }))}
                disabled={!selectedClassId}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Target"
            description="Exam or assignment"
            icon="🎯"
            open={openSection === "target"}
            onToggle={() => setOpenSection("target")}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <RadixSelect
                placeholder="Select exam"
                value={watch("examId") ? String(watch("examId")) : ""}
                onChange={(v) => setValue("examId", v ? Number(v) : undefined)}
                options={filteredExams.map((e) => ({
                  value: String(e.id),
                  label: e.title,
                }))}
                disabled={!selectedClassId}
              />

              <RadixSelect
                placeholder="Select assignment"
                value={
                  watch("assignmentId") ? String(watch("assignmentId")) : ""
                }
                onChange={(v) =>
                  setValue("assignmentId", v ? Number(v) : undefined)
                }
                options={filteredAssignments.map((a) => ({
                  value: String(a.id),
                  label: a.title,
                }))}
                disabled={!selectedClassId}
              />
            </div>
          </CollapsibleSection>
        </div>

        {/* FOOTER */}
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
                  ? "Create Result"
                  : "Update Result"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
