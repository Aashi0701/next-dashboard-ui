"use client";

import {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  startTransition,
  useActionState,
} from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { teacherSchema, TeacherFormValues } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "../InputField";
import RadixMultiSelect from "@/components/ui/RadixMultiSelect";
import RadixDatePicker from "@/components/ui/RadixDatePicker";
import RadixSelect from "@/components/ui/RadixSelect";
import PhoneField from "@/components/ui/PhoneField";
import { CldUploadWidget } from "next-cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import FormStepper from "@/components/ui/FormStepper";
import { ActionState } from "@/lib/actions";

const steps = ["Authentication", "Personal", "Subjects"];

export default function TeacherForm({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: TeacherFormValues;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { subjects: { id: number; name: string }[] };
}) {
  const router = useRouter();
  const { subjects = [] } = relatedData || {};

  const [step, setStep] = useState(0);
  const [img, setImg] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const methods = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      id: data?.id,
      username: data?.username ?? "",
      email: data?.email ?? "",
      password: "",
      phone: data?.phone ?? "",
      name: data?.name ?? "",
      surname: data?.surname ?? "",
      address: data?.address ?? "",
      bloodType: data?.bloodType ?? "",
      birthday: data?.birthday ? new Date(data.birthday) : undefined,
      sex: data?.sex ?? "MALE",
      subjects: data?.subjects ?? [],
      img: data?.img,
    },
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    trigger,
    handleSubmit,
    formState: { isSubmitting, isValid },
  } = methods;

  /* ================= ACTION ================= */

  const [state, formAction] = useActionState<ActionState, TeacherFormValues>(
    type === "create" ? createTeacher : updateTeacher,
    { success: false },
  );

  /* ================= STEP VALIDATION ================= */

  const nextStep = async () => {
    const fieldsByStep: (keyof TeacherFormValues)[][] = [
      ["username", "email", "password", "phone"],
      ["name", "surname", "address", "bloodType", "birthday", "sex"],
    ];

    const valid = await trigger(fieldsByStep[step]);
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

  /* ================= SUCCESS ================= */

  useEffect(() => {
    if (state.success) {
      toast.success("Teacher saved successfully");
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router, setOpen]);

  const {
    formState: { errors },
  } = methods;

  const errorSteps = [
    Boolean(errors.username || errors.email || errors.phone),
    Boolean(errors.name || errors.surname || errors.address),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-4 sm:p-8 max-h-screen overflow-y-auto">
        {/* HEADER */}
        <div className="relative mb-8 flex justify-center">
          <div className="absolute top-1 sm:hidden w-10 h-1.5 bg-gray-300 rounded-full" />
          <button
            onClick={() => setOpen(false)}
            className="absolute right-0 p-1 rounded-lg hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        <FormStepper steps={steps} step={step} errorSteps={errorSteps} />

        {/* FORM */}
        <FormProvider {...methods}>
          <form onSubmit={onSubmit}>
            <div className="min-h-[240px]">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="auth"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    <InputField label="Username" name="username" />
                    <InputField label="Email" name="email" />
                    <InputField
                      label="Password"
                      type="password"
                      name="password"
                    />
                    <PhoneField />

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

                {step === 1 && (
                  <motion.div
                    key="personal"
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    <InputField name="name" />
                    <InputField name="surname" />
                    <InputField name="address" />
                    <InputField name="bloodType" />

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

                {step === 2 && (
                  <RadixMultiSelect
                    placeholder="Select Subjects"
                    value={watch("subjects") ?? []}
                    onChange={(v) =>
                      setValue("subjects", v, { shouldValidate: true })
                    }
                    options={subjects.map((s) => ({
                      value: String(s.id),
                      label: s.name,
                    }))}
                  />
                )}
              </AnimatePresence>
            </div>

            {state.error && (
              <p className="text-xs text-red-500 mt-2">{state.error}</p>
            )}

            {/* ACTIONS */}
            <div className="flex justify-between pt-4 border-t">
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
                  disabled={!isValid || isSubmitting}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md disabled:opacity-40"
                >
                  {isSubmitting ? "Saving..." : "Submit"}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
