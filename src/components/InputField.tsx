import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string | number;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full"}>
      <label className="text-sm text-gray-700 font-medium">{label}</label>

      <input
        type={type}
        {...register(name)}
        defaultValue={defaultValue}
        {...inputProps}
        className="
          w-full
          p-3
          border border-gray-300
          rounded-lg
          text-sm
          shadow-sm
          focus:ring-1 focus:ring-blue-500
          focus:outline-none
        "
      />

      {error?.message && (
        <p className="text-xs text-red-500">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
