"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
} from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      id: data?.id,
      classId: data?.classId ?? "",
      category: data?.category ?? "default",
    },
  });

  const [state, formAction] = useActionState(
    type === "create" ? createEvent : updateEvent,
    { success: false, error: false }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-8 max-h-[85vh] overflow-y-auto px-1"
    >
      {/* TITLE */}
      <h1 className="text-2xl font-bold text-gray-800">
        {type === "create" ? "Create New Event" : "Update Event"}
      </h1>

      {/* BASIC EVENT INFO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InputField
          label="Title"
          name="title"
          register={register}
          defaultValue={data?.title}
          error={errors.title}
        />

        <InputField
          label="Description"
          name="description"
          register={register}
          defaultValue={data?.description}
          error={errors.description}
        />
      </div>

      {/* DATE & TIME */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Start Time"
          name="startTime"
          type="datetime-local"
          register={register}
          defaultValue={
            data?.startTime
              ? new Date(data.startTime).toISOString().slice(0, 16)
              : ""
          }
          error={errors.startTime}
        />

        <InputField
          label="End Time"
          name="endTime"
          type="datetime-local"
          register={register}
          defaultValue={
            data?.endTime
              ? new Date(data.endTime).toISOString().slice(0, 16)
              : ""
          }
          error={errors.endTime}
        />
      </div>

      {/* CLASS SELECT */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-700 font-medium">Class</label>
        <select
          {...register("classId")}
          defaultValue={data?.classId ?? ""}
          className="w-full p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">None (General Event)</option>
          {classes.map((cls: any) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
        {errors.classId && (
          <p className="text-xs text-red-500">
            {errors.classId.message?.toString()}
          </p>
        )}
      </div>

      {/* CATEGORY SELECT */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-700 font-medium">Category</label>
        <select
          {...register("category")}
          defaultValue={data?.category ?? "default"}
          className="w-full p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
        >
          <option value="default">Default</option>
          <option value="holiday">Holiday</option>
          <option value="exam">Exam</option>
          <option value="competition">Competition</option>
          <option value="meeting">Meeting</option>
          <option value="celebration">Celebration</option>
        </select>
        {errors.category && (
          <p className="text-xs text-red-500">
            {errors.category.message?.toString()}
          </p>
        )}
      </div>

      {/* ERROR */}
      {state.error && (
        <p className="text-red-500 text-sm p-3">Something went wrong. Try again.</p>
      )}

      {/* SUBMIT BUTTON */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-sm transition">
        {type === "create" ? "Create Event" : "Update Event"}
      </button>
    </form>
  );
};

export default EventForm;
