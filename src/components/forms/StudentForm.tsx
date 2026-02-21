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
import { createStudent, updateStudent, ActionState } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import InputField from "../InputField";
import { CldUploadWidget } from "next-cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { Camera } from "lucide-react";
import FormStepper from "@/components/ui/FormStepper";
import Image from "next/image";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

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
    classes: any[];
    parents: any[];
  };
}) {
  const router = useRouter();
  const { classes = [], parents = [] } = relatedData || {};

  const [step, setStep] = useState(0);
  const [img, setImg] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  /* ================= RHF ================= */

  const methods = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    mode: "onChange",
    defaultValues: {
      ...data,
      classId: data?.classId ?? 0,
    },
  });

  const {
    handleSubmit,
    setValue,
    trigger,
    watch,
    register,
    formState: { isSubmitting, errors },
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
      ["parentId", "classId"],
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
        <div className="relative">
          <ModalCloseButton onClose={() => setOpen(false)} />
          <h1 className="text-lg font-semibold">
            {type === "create" ? "Create Student" : "Update Student"}
          </h1>
        </div>

        <FormStepper
          steps={steps}
          step={step}
          errorSteps={[
            Boolean(errors.username || errors.email || errors.phone),
            Boolean(errors.name || errors.surname || errors.address),
          ]}
        />

        {/* SCROLL AREA */}
        <div className="min-h-[160px]">
          <AnimatePresence mode="wait">
            {/* STEP 1 – AUTH */}
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
                  onError={() => setUploading(false)}
                >
                  {({ open }) => (
                    <div className="sm:col-span-2">
                      {img ? (
                        <div className="mb-3 flex items-center gap-4">
                          <Image
                            src={img.secure_url}
                            alt="Avatar"
                            width={64}
                            height={64}
                            className="rounded-full object-cover border"
                          />
                          <button
                            type="button"
                            onClick={() => setImg(null)}
                            className="text-red-500 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => open()}
                          disabled={uploading}
                          className="w-full h-11 border rounded-xl flex items-center justify-center gap-2"
                        >
                          <Camera className="w-4 h-4" />
                          Upload Photo
                        </button>
                      )}
                    </div>
                  )}
                </CldUploadWidget>
              </motion.div>
            )}

            {/* STEP 2 – PERSONAL */}
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

            {/* STEP 3 – ACADEMIC */}
            {step === 2 && (
              <motion.div
                key="academic"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {/* PARENT */}
                <RadixSelect
                  value={watch("parentId")}
                  onChange={(v) => {
                    if (!v) return;
                    setValue("parentId", v, { shouldValidate: true });
                  }}
                  placeholder="Select Parent"
                  options={parents.map((p) => ({
                    value: p.id,
                    label: `${p.name} ${p.surname}`,
                  }))}
                />

                {/* CLASS */}
                <RadixSelect
                  value={watch("classId") ? String(watch("classId")) : ""}
                  onChange={(v) => {
                    if (!v) return;
                    setValue("classId", Number(v), {
                      shouldValidate: true,
                    });
                  }}
                  placeholder="Select Class"
                  options={classes.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {state.error && <p className="text-xs text-red-500">{state.error}</p>}

        {/* ACTION BAR */}
        <div className="flex justify-between border-t pt-3">
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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              {isSubmitting ? "Saving..." : "Submit"}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
