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
import {
  studentSchema,
  StudentSchema,
} from "@/lib/formValidationSchemas";
import {
  createStudent,
  updateStudent,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
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
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema) as any,
  });

  const [img, setImg] = useState<any>();

  const [state, formAction] = useActionState(
    type === "create" ? createStudent : updateStudent,
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((formData) => {
    startTransition(() => {
      formAction({
        ...formData,
        img: img?.secure_url,
      });
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { grades, classes } = relatedData;

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-10 max-h-[85vh] overflow-y-auto px-2"
    >
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-800">
        {type === "create" ? "Create New Student" : "Update Student"}
      </h1>

      {/* ================================
          Authentication Information
      ================================= */}
      <div className="border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-700">
          Authentication Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors.email}
        />
        <InputField
          label="Password"
          type="password"
          name="password"
          defaultValue={data?.password}
          register={register}
          error={errors.password}
        />
      </div>

      {/* ================================
          Personal Information
      ================================= */}
      <div className="border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-700">Personal Information</h2>
      </div>

      {/* Upload */}
      <div className="flex items-center gap-4 py-2">
        <CldUploadWidget
          uploadPreset="school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => (
            <div
              className="flex items-center gap-3 cursor-pointer border rounded-lg px-4 py-2 hover:bg-gray-50 transition"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="Upload" width={28} height={28} />
              <span className="text-sm text-gray-700">Upload a Photo</span>
            </div>
          )}
        </CldUploadWidget>

        {img?.secure_url && (
          <Image
            src={img.secure_url}
            alt="Preview"
            width={50}
            height={50}
            className="rounded-full object-cover"
          />
        )}
      </div>

      {/* Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />

        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />

        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />

        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />

        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />

        <InputField
          label="Birthday"
          name="birthday"
          type="date"
          defaultValue={
            data?.birthday
              ? data.birthday.toISOString().split("T")[0]
              : ""
          }
          register={register}
          error={errors.birthday}
        />

        <div className="space-y-2">
          <label className="text-sm text-gray-700 font-medium">Parent</label>
          <select
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-sm"
            {...register("parentId")}
            defaultValue={data?.parentId}
          >
            <option value="">Select Parent</option>
            {relatedData.parents.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.surname} ({p.phone})
              </option>
            ))}
          </select>

          {errors.parentId?.message && (
            <p className="text-xs text-red-500">{errors.parentId.message!.toString()}</p>
          )}
        </div>

        {/* Sex */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Sex</label>
          <select
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-sm"
            {...register("sex")}
            defaultValue={data?.sex}
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

        {/* Grade */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Grade</label>
          <select
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-sm"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            {grades.map((g: any) => (
              <option key={g.id} value={g.id}>
                {g.level}
              </option>
            ))}
          </select>
        </div>

        {/* Class */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Class</label>
          <select
            className="w-full mt-1 p-3 border border-gray-300 rounded-lg text-sm"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes.map((cls: any) => (
              <option key={cls.id} value={cls.id}>
                {cls.name} ({cls._count.students}/{cls.capacity})
              </option>
            ))}
          </select>
        </div>

        {/* Hidden ID */}
        {data && (
          <input type="hidden" {...register("id")} defaultValue={data?.id} />
        )}
      </div>

      {/* Error Message */}
      {state.error && (
        <p className="text-red-500 text-sm">Something went wrong. Try again.</p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-sm transition"
      >
        {type === "create" ? "Create Student" : "Update Student"}
      </button>
    </form>
  );
};

export default StudentForm;
