"use client";

import { useFormContext } from "react-hook-form";

type Props = {
  label?: string;
  type?: string;
  name: string;
  hidden?: boolean;
};

export default function InputField({
  label,
  type = "text",
  name,
  hidden,
}: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  if (hidden) return <input type="hidden" {...register(name)} />;

  const format = (t: string) =>
    t.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  const displayLabel = label || format(name);
  const error = errors[name]?.message as string | undefined;

  return (
    <div className="relative w-full">
      {/* input */}
      <input
        type={type}
        placeholder=" "
        {...register(
          name,
          type === "number"
            ? { valueAsNumber: true }
            : undefined
        )}
        className={`
          peer block w-full h-9 sm:h-12
          px-3 pt-3 sm:pt-4 pb-2 text-xs sm:text-sm
          bg-transparent
          rounded-xl border appearance-none outline-none transition

          ${
            error
              ? "border-red-500 focus:ring-red-100 focus:border-red-500"
              : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          }
        `}
      />

      {/* floating label */}
      <label
        className={`
          absolute left-3
          text-xs sm:text-sm
          duration-200 transform
          -translate-y-4 scale-75 top-2 sm:top-1.5
          z-10 origin-[0]
          backdrop-blur-sm px-1

          ${
            error
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

      {/* error */}
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
