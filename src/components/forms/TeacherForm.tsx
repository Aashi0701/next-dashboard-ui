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
import { Camera, X } from "lucide-react";
import { teacherSchema, TeacherFormValues } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import InputField from "../InputField";
import PhoneField from "@/components/ui/PhoneField";
import RadixSelect from "@/components/ui/RadixSelect";
import RadixMultiSelect from "@/components/ui/RadixMultiSelect";
import RadixDOBPicker from "@/components/ui/RadixDOBPicker";
import { CldUploadWidget } from "next-cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import FormStepper from "@/components/ui/FormStepper";
import { ActionState } from "@/lib/actions";
import Image from "next/image";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

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
    formState: { isSubmitting, isValid, errors },
  } = methods;

  const [state, formAction] = useActionState<ActionState, TeacherFormValues>(
    type === "create" ? createTeacher : updateTeacher,
    { success: false },
  );

  const nextStep = async () => {
    const fieldsByStep: (keyof TeacherFormValues)[][] = [
      ["username", "email", "password", "phone"],
      ["name", "surname", "address", "bloodType", "birthday", "sex"],
    ];

    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => s + 1);
  };

  const onSubmit = handleSubmit((values) => {
    startTransition(() =>
      formAction({
        ...values,
        img: img?.secure_url ?? values.img,
      }),
    );
  });

  useEffect(() => {
    if (state.success) {
      toast.success("Teacher saved successfully");
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router, setOpen]);

  const errorSteps = [
    Boolean(errors.username || errors.email || errors.phone),
    Boolean(errors.name || errors.surname || errors.address),
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center">
      {/* ===== MODAL ===== */}
      <div className="w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl shadow-xl p-4 sm:p-8 max-h-[70vh] sm:max-h-screen flex flex-col overflow-hidden">
        {/* ===== HEADER ===== */}
        <div className="relative mb-4">
          {/* Drag handle (mobile) */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 sm:hidden w-10 h-1.5 bg-gray-300 rounded-full" />

          {/* Title */}
          <h1 className="text-base sm:text-xl font-semibold text-center sm:text-left">
            {type === "create" ? "Create Teacher" : "Update Teacher"}
          </h1>

          {/* Close */}
          <ModalCloseButton onClose={() => setOpen(false)} />
        </div>

        <FormStepper steps={steps} step={step} errorSteps={errorSteps} />

        <FormProvider {...methods}>
          {/* ===== SCROLLABLE CONTENT (KEY FIX) ===== */}
          <div className="mt-2 pt-2 max-h-[calc(80vh-200px)] sm:max-h-none overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="auth"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
                    onError={() => setUploading(false)}
                  >
                    {({ open }) => (
                      <div className="sm:col-span-2">
                        {img && (
                          <div className="mb-3 flex items-center gap-4">
                            <Image
                              src={img.secure_url}
                              alt="Avatar"
                              width={64}
                              height={64}
                              className="rounded-full border"
                            />
                            <div className="flex flex-col gap-1">
                              <span className="text-green-600 text-xs font-medium">
                                Photo uploaded ✓
                              </span>
                              <div className="flex gap-3 text-xs">
                                <button
                                  onClick={() => open()}
                                  type="button"
                                  className="text-blue-600"
                                >
                                  Replace
                                </button>
                                <button
                                  onClick={() => setImg(null)}
                                  type="button"
                                  className="text-red-500"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {!img && (
                          <button
                            type="button"
                            onClick={() => open()}
                            disabled={uploading}
                            className="w-full h-11 flex items-center justify-center gap-2 border rounded-xl bg-gray-50"
                          >
                            {uploading ? "Uploading…" : "Upload Photo"}
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <InputField name="name" />
                    <InputField name="surname" />
                    <InputField name="address" />
                    <InputField name="bloodType" />

                    <div className="sm:col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">
                        Date of Birth
                      </label>

                      <RadixDOBPicker
                        value={watch("birthday")}
                        onChange={(d) =>
                          setValue("birthday", d, { shouldValidate: true })
                        }
                      />
                    </div>

                    <div className="transform-none">
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
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="subjects"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===== ACTIONS (STICKY) ===== */}
          <div className="flex justify-between pt-4 border-t mt-4">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                type="button"
                className="bg-gray-600 text-white px-4 py-2 rounded-full"
              >
                Back
              </button>
            )}

            {step < steps.length - 1 ? (
              <button
                onClick={nextStep}
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-full"
              >
                Next →
              </button>
            ) : (
              <form onSubmit={onSubmit}>
                <button
                  disabled={!isValid || isSubmitting}
                  className="bg-blue-600 text-white px-5 py-2 rounded-md"
                >
                  {isSubmitting ? "Saving…" : "Submit"}
                </button>
              </form>
            )}
          </div>

          {state.error && (
            <p className="text-xs text-red-500 mt-2">{state.error}</p>
          )}
        </FormProvider>
      </div>
    </div>
  );
}
