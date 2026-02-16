"use client";

import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  startTransition,
  useActionState,
} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RadixDatePicker from "../ui/RadixDatePicker";
import RadixSelect from "../ui/RadixSelect";
import { studentSchema, StudentFormValues } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "../InputField";
import { CldUploadWidget } from "next-cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import FormStepper from "@/components/ui/FormStepper";
import { ActionState } from "@/lib/actions";

const steps = ["Authentication", "Personal", "Academic"];

export default function StudentForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<StudentFormValues>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    grades: any[];
    classes: any[];
    parents: any[];
  };
}) {
  const router = useRouter();
  const { grades = [], classes = [], parents = [] } = relatedData || {};

  const [step, setStep] = useState(0);
  const [img, setImg] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  /* ================= RHF ================= */

  const methods = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    mode: "onChange",
    defaultValues: {
      ...data,
      gradeId: data?.gradeId ?? 0,
      classId: data?.classId ?? 0,
    },
  });

  const {
    handleSubmit,
    setValue,
    trigger,
    watch,
    register,
    formState: { isSubmitting },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, StudentFormValues>(
    type === "create" ? createStudent : updateStudent,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fields: (keyof StudentFormValues)[][] = [
      ["username", "email", "password"],
      ["name", "surname", "phone", "address", "bloodType", "birthday", "sex"],
      ["parentId", "gradeId", "classId"],
    ];

    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = handleSubmit((values) => {
    startTransition(() =>
      formAction({
        ...values,
        img: img?.secure_url ?? values.img,
      }),
    );
  });

  const {
    formState: { errors },
  } = methods;

  const errorSteps = [
    Boolean(errors.username || errors.email || errors.phone),
    Boolean(errors.name || errors.surname || errors.address),
  ];

  useEffect(() => {
    if (state.success) {
      toast.success(
        `Student ${type === "create" ? "created" : "updated"} successfully`,
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, setOpen, type]);

  /* ================= UI ================= */

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h1 className="text-base sm:text-lg font-semibold">
          {type === "create" ? "Create Student" : "Update Student"}
        </h1>

        <FormStepper steps={steps} step={step} errorSteps={errorSteps} />

        {/* SCROLL AREA */}
        <div className="transition-[min-height] duration-300 ease-in-out min-h-[140px] sm:min-h-[150px] md:min-h-[160px] lg:min-h-[170px]">
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 0 && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <InputField label="Username" name="username" />
                <InputField label="Email" name="email" />
                <InputField label="Password" name="password" type="password" />
                <CldUploadWidget
                  uploadPreset="school"
                  onUploadAdded={() => setUploading(true)}
                  onSuccess={(res, { widget }) => {
                    setImg(res.info);
                    setUploading(false);
                    widget.close();
                  }}
                  onError={() => {
                    setUploading(false);
                  }}
                >
                  {({ open }) => (
                    <div className="sm:col-span-2">
                      {/* PREVIEW */}
                      {img && (
                        <div className="mb-3 flex items-center gap-4">
                          <img
                            src={img.secure_url}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full object-cover border"
                          />

                          <div className="flex flex-col gap-1">
                            <span className="text-green-600 text-xs sm:text-sm font-medium">
                              Photo uploaded ✓
                            </span>

                            <div className="flex gap-3 text-xs">
                              <button
                                type="button"
                                onClick={() => open()}
                                className="text-blue-600 hover:underline"
                              >
                                Replace
                              </button>

                              <button
                                type="button"
                                onClick={() => setImg(null)}
                                className="text-red-500 hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* UPLOAD BUTTON */}
                      {!img && (
                        <button
                          type="button"
                          onClick={() => open()}
                          disabled={uploading}
                          className="
            w-full h-11
            flex items-center justify-center gap-2
            border rounded-xl
            bg-gray-50 hover:bg-gray-100
            text-sm sm:text-base
            disabled:opacity-50
          "
                        >
                          {uploading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                              Uploading…
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                              <span>Upload Photo</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <motion.div
                key="personal"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <InputField label="First Name" name="name" />
                <InputField label="Last Name" name="surname" />
                <InputField label="Phone" name="phone" />
                <InputField label="Address" name="address" />
                <InputField label="Blood Type" name="bloodType" />
                <RadixDatePicker
                  value={watch("birthday")}
                  onChange={(d) =>
                    setValue("birthday", d, { shouldValidate: true })
                  }
                />

                <RadixSelect
                  value={watch("sex")}
                  onChange={(v) =>
                    setValue("sex", v as any, { shouldValidate: true })
                  }
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                  ]}
                />
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <motion.div
                key="academic"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <select
                  {...register("parentId")}
                  className="h-11 rounded-xl border px-3 text-sm"
                >
                  <option value="">Select Parent</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.surname}
                    </option>
                  ))}
                </select>

                <select
                  {...register("gradeId", { valueAsNumber: true })}
                  className="h-11 rounded-xl border px-3 text-sm"
                >
                  <option value={0}>Select Grade</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.level}
                    </option>
                  ))}
                </select>

                <select
                  {...register("classId", { valueAsNumber: true })}
                  className="h-11 rounded-xl border px-3 text-sm"
                >
                  <option value={0}>Select Class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {state.error && (
          <p className="text-xs text-red-500 mt-2">{state.error}</p>
        )}

        {/* ================= ACTION BAR ================= */}
        <div className="sticky bottom-0 bg-white px-5 py-3 flex justify-between border-t">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}

          {step < steps.length - 1 ? (
            <button type="button" onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
