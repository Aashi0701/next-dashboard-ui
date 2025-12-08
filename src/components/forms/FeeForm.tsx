"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FeeSchema, FeeSchemaType } from "@/lib/formValidationSchemas";
import { createFee, updateFee } from "@/lib/actions";

export default function FeeForm({
  type,
  data,
  close,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  close: () => void;
  relatedData?: {
    classes?: {
      id: number;
      name: string;
      grade?: { level: number };
    }[];
  };
}) {
  const form = useForm<FeeSchemaType>({
    resolver: zodResolver(FeeSchema),
    defaultValues: {
      title: data?.title ?? "",
      amount: data?.amount ?? undefined,
      type: data?.type ?? "ADMISSION",
      term: data?.term ?? "",
      classId: data?.classId ?? "",
    },
  });

  async function onSubmit(values: FeeSchemaType) {
    if (type === "create") {
      await createFee({} as any, values);
    } else {
      await updateFee({} as any, { ...values, id: data.id });
    }
    close();
  }

  /* ---------- SHARED STYLES ---------- */

  const label =
    "text-xs font-medium text-gray-500";

  const input =
    "w-full rounded-md bg-gray-50 border border-gray-300 px-3 py-2 text-sm outline-none " +
    "focus:border-lamaPurple focus:ring-1 focus:ring-lamaPurple";

  return (
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    {/* HEADER */}
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-800">
        {type === "create" ? "Create Fee Structure" : "Update Fee Structure"}
      </h2>
    </div>

    <hr className="border-gray-200" />

    {/* FIELDS */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Fee Title */}
      <div className="flex flex-col gap-1">
        <label className={label}>Fee Title</label>
        <input
          {...form.register("title")}
          placeholder="Admission Fee / Term 1 Fee"
          className={input}
        />
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1">
        <label className={label}>Amount (₹)</label>
        <input
          type="number"
          {...form.register("amount", { valueAsNumber: true })}
          placeholder="e.g. 15000"
          className={input}
        />
      </div>

      {/* Fee Type */}
      <div className="flex flex-col gap-1">
        <label className={label}>Fee Type</label>
        <select {...form.register("type")} className={input}>
          <option value="ADMISSION">Admission</option>
          <option value="TERM">Term</option>
          <option value="ANNUAL">Annual</option>
          <option value="MISC">Miscellaneous</option>
        </select>
      </div>

      {/* Term */}
      <div className="flex flex-col gap-1">
        <label className={label}>Term (optional)</label>
        <select {...form.register("term")} className={input}>
          <option value="">— None —</option>
          <option value="TERM_1">Term 1</option>
          <option value="TERM_2">Term 2</option>
        </select>
      </div>

      {/* Class */}
      <div className="md:col-span-2 flex flex-col gap-1">
        <label className={label}>Class (optional)</label>
        <select {...form.register("classId")} className={input}>
          <option value="">All Classes</option>
          {relatedData?.classes?.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
              {cls.grade ? ` (Grade ${cls.grade.level})` : ""}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* FOOTER */}
    <div className="flex justify-end gap-3 border-t pt-4">
      <button
        type="button"
        onClick={close}
        className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="px-5 py-2 text-sm rounded-md bg-lamaPurple text-white hover:bg-lamaPurpleDark"
      >
        {type === "create" ? "Create Fee" : "Update Fee"}
      </button>
    </div>
  </form>
);
}
