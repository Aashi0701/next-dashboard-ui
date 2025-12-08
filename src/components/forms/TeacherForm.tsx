"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema) as any,
    defaultValues: {
      ...data,
      birthday: data?.birthday
        ? data.birthday.toISOString().split("T")[0]
        : "",
    },
  });

  const [img, setImg] = useState<any>();

  const [state, formAction] = useActionState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((values) => {
    startTransition(() => {
      formAction({
        ...values,
        img: img?.secure_url,
      });
    });
  });

  const router = useRouter();
  const { subjects } = relatedData;

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-10 max-h-[85vh] overflow-y-auto px-1"
    >
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800">
        {type === "create" ? "Create New Teacher" : "Update Teacher"}
      </h1>

      {/* Authentication Section */}
      <div className="border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-700">
          Authentication Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors.username}
          defaultValue={data?.username}
        />

        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email}
          defaultValue={data?.email}
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors.password}
          defaultValue={data?.password}
        />
      </div>

      {/* Personal Section */}
      <div className="border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-700">
          Personal Information
        </h2>
      </div>

      {/* Upload */}
      <CldUploadWidget
        uploadPreset="school"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => (
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => open()}
          >
            <Image src="/upload.png" alt="Upload" width={32} height={32} />
            <span className="text-sm text-gray-600">Upload a Photo</span>
          </div>
        )}
      </CldUploadWidget>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField
          label="First Name"
          name="name"
          register={register}
          error={errors.name}
          defaultValue={data?.name}
        />

        <InputField
          label="Last Name"
          name="surname"
          register={register}
          error={errors.surname}
          defaultValue={data?.surname}
        />

        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
          defaultValue={data?.phone}
        />

        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
          defaultValue={data?.address}
        />

        <InputField
          label="Blood Type"
          name="bloodType"
          register={register}
          error={errors.bloodType}
          defaultValue={data?.bloodType}
        />

        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          register={register}
          error={errors.birthday}
          defaultValue={
            data?.birthday
              ? data.birthday.toISOString().split("T")[0]
              : ""
          }
        />

        {/* Hidden ID */}
        {data && (
          <InputField
            label="Id"
            name="id"
            register={register}
            defaultValue={data?.id}
            hidden
          />
        )}

        {/* Sex */}
        <div className="space-y-2">
          <label className="text-sm text-gray-700 font-medium">Sex</label>
          <select
            {...register("sex")}
            defaultValue={data?.sex}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex && (
            <p className="text-xs text-red-500">
              {errors.sex.message?.toString()}
            </p>
          )}
        </div>

        {/* Subjects */}
        <div className="space-y-2">
          <label className="text-sm text-gray-700 font-medium">Subjects</label>
          <select
            multiple
            {...register("subjects")}
            defaultValue={data?.subjects?.map((s: any) => s.id.toString())}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            {subjects.map((subject: any) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects && (
            <p className="text-xs text-red-500">
              {errors.subjects.message?.toString()}
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {state.error && (
        <p className="text-red-500 text-sm">Something went wrong. Try again.</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-sm transition"
      >
        {type === "create" ? "Create Teacher" : "Update Teacher"}
      </button>
    </form>
  );
};

export default TeacherForm;
