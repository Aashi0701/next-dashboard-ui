"use client";

import { useFormContext } from "react-hook-form";

type Props = {
  label?: string;
  type?: "text" | "number" | "email" | "password";
  name: string;
  hidden?: boolean;
};

export default function InputField({
  label,
  type = "text",
  name,
  hidden = false,
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  // 🔹 auto-format label from name if not provided
  const format = (t: string) =>
    t.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  const displayLabel = label ?? format(name);

  // 🔹 safely access error message
  const errorMessage =
    (errors as Record<string, any>)?.[name]?.message as
      | string
      | undefined;

  // 🔹 register options (important for numbers!)
  const registerOptions =
    type === "number" ? { valueAsNumber: true } : undefined;

  // 🔹 hidden field support
  if (hidden) {
    return <input type="hidden" {...register(name, registerOptions)} />;
  }

  return (
    <div className="relative w-full">
      {/* INPUT */}
      <input
        type={type}
        placeholder=" "
        {...register(name, registerOptions)}
        className={`
          peer block w-full h-9 sm:h-12
          px-3 pt-3 sm:pt-4 pb-2
          text-xs sm:text-sm
          bg-transparent rounded-xl border
          appearance-none outline-none transition

          ${
            errorMessage
              ? "border-red-500 focus:ring-red-100 focus:border-red-500"
              : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          }
        `}
      />

      {/* FLOATING LABEL */}
      <label
        className={`
          absolute left-3
          text-xs sm:text-sm
          duration-200 transform
          -translate-y-4 scale-75
          top-2 sm:top-1.5
          z-10 origin-[0]
          backdrop-blur-sm px-1

          ${
            errorMessage
              ? "text-red-500"
              : "text-gray-500 peer-focus:text-blue-600"
          }

          peer-placeholder-shown:scale-100
          peer-placeholder-shown:translate-y-0
          peer-placeholder-shown:top-3
          peer-focus:top-2
          peer-focus:scale-75
          peer-focus:-translate-y-4
        `}
      >
        {displayLabel}
      </label>

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <p className="mt-1 text-xs text-red-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
}