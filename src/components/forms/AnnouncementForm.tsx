"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  announcementFormSchema,
  AnnouncementFormSchema,
} from "@/lib/formValidationSchemas";

import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
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

const AnnouncementForm = ({
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
  const classes = relatedData?.classes ?? [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnnouncementFormSchema>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      id: data?.id,
      title: data?.title ?? "",
      description: data?.description ?? "",
      date: data?.date
        ? new Date(data.date).toISOString().slice(0, 10)
        : "",
      classId: data?.classId ? String(data.classId) : "",
    },
  });

  const [state, formAction] = useActionState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    { success: false, error: false }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((formData) => {
    const payload = {
      id: data?.id,
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date),
      classId:
        formData.classId === "" || formData.classId === null
          ? null
          : Number(formData.classId),
    };

    startTransition(() => formAction(payload));
  });

  useEffect(() => {
    if (state.success) {
      toast(
        `Announcement has been ${
          type === "create" ? "created" : "updated"
        }!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  return (
    <form className="flex flex-col gap-6 w-full" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Announcement" : "Update Announcement"}
      </h1>

      <InputField
        label="Title"
        name="title"
        register={register}
        error={errors?.title}
      />

      <InputField
        label="Description"
        name="description"
        register={register}
        error={errors?.description}
      />

      <InputField
        label="Date"
        name="date"
        type="date"
        register={register}
        error={errors?.date}
      />

      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Class (optional)</label>
        <select
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md"
          {...register("classId")}
        >
          <option value="">All Classes</option>
          {classes.map((cls: any) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {state.error && (
        <p className="text-red-500">Something went wrong.</p>
      )}

      <button className="bg-blue-500 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
