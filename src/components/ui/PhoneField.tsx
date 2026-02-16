"use client";

import { useFormContext, Controller } from "react-hook-form";

export default function PhoneField({ name = "phone" }) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const mask = (digits: string) =>
    digits.replace(/^(\d{5})(\d{0,5}).*/, "$1 $2").trim();

  return (
    <div className="w-full">
      <Controller
        name={name}
        control={control}
        rules={{
          required: "Phone number is required",
          validate: (v) =>
            v.length === 10 || "Phone must be exactly 10 digits",
        }}
        render={({ field }) => (
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Phone number"
            value={mask(field.value || "")}
            onChange={(e) => {
              const digits = e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

              field.onChange(digits); // ⭐ only digits stored
            }}
            className="
              w-full
              h-9 sm:h-12
              px-3 text-xs sm:text-sm
              rounded-xl border bg-white
              outline-none transition
              focus:border-blue-600 focus:ring-2 focus:ring-blue-100
            "
          />
        )}
      />

      {errors[name] && (
        <p className="text-xs text-red-500 mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );
}
