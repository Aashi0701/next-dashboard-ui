"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, startTransition, useActionState, useEffect } from "react";
import { parentSchema, ParentSchema } from "@/lib/formValidationSchemas";
import { createParent, updateParent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "../InputField";

const ParentForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema) as any,
    defaultValues: {
      id: data?.id,
      username: data?.username ?? "",
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      address: data?.address ?? "",
    },
  });

  const [state, formAction] = useActionState(
    type === "create" ? createParent : updateParent,
    { success: false, error: false }
  );

  const router = useRouter();

  const onSubmit = handleSubmit((values) => {
    startTransition(() => formAction(values));
  });

  useEffect(() => {
    if (state.success) {
      toast(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-10 max-h-[85vh] overflow-y-auto px-1"
    >
      {/* TITLE */}
      <h1 className="text-2xl font-bold text-gray-800">
        {type === "create" ? "Create New Parent" : "Update Parent"}
      </h1>

      {/* AUTH SECTION */}
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
        />

        <InputField
          label="Email"
          name="email"
          register={register}
          error={errors.email}
        />

        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
        />
      </div>

      {/* PERSONAL SECTION */}
      <div className="border-b pb-3">
        <h2 className="text-lg font-semibold text-gray-700">
          Personal Information
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InputField
          label="First Name"
          name="name"
          register={register}
          error={errors.name}
        />

        <InputField
          label="Last Name"
          name="surname"
          register={register}
          error={errors.surname}
        />

        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors.id}
            hidden
          />
        )}
      </div>

      {/* ERROR MESSAGE */}
      {state.error && (
        <p className="text-red-500 text-sm">Something went wrong. Try again.</p>
      )}

      {/* BUTTON */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold shadow-sm transition"
      >
        {type === "create" ? "Create Parent" : "Update Parent"}
      </button>
    </form>
  );
};

export default ParentForm;
