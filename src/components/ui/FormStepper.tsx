"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/* ===================================================== */

type StepperProps = {
  steps: string[];
  step: number;
  errorSteps?: boolean[];
};

/* ===================================================== */

export default function FormStepper({
  steps,
  step,
  errorSteps = [],
}: StepperProps) {
  // 🔑 MOBILE-FIRST SIZE
  const CIRCLE = 26; // mobile circle size (w-6 h-6)

  return (
    <div className="relative mb-4 sm:mb-6">
      {/* CONNECTOR LINE */}
      <div
        className="absolute h-[2px] bg-gray-200"
        style={{
          top: CIRCLE / 2,
          left: CIRCLE / 1,
          right: CIRCLE / 1,
        }}
      >
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{
            width:
              steps.length > 1 ? `${(step / (steps.length - 1)) * 100}%` : "0%",
          }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        />
      </div>

      {/* STEPS */}
      <div className="relative flex justify-between">
        {steps.map((label, i) => {
          const active = i === step;
          const completed = i < step;
          const hasError = errorSteps[i];

          return (
            <div key={label} className="flex flex-col items-center gap-1.5">
              {/* STEP CIRCLE */}
              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 24,
                }}
                className={`
                  relative z-10
                  w-6 h-6 sm:w-8 sm:h-8       /* 🔑 smaller mobile */
                  rounded-full
                  flex items-center justify-center
                  text-[10px] sm:text-xs     /* 🔑 smaller text */
                  font-medium
                  ${
                    completed
                      ? "bg-green-600 text-white"
                      : active
                        ? "bg-blue-600 text-white"
                        : hasError
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-200 text-gray-500"
                  }
                `}
              >
                {completed ? <Check size={12} /> : i + 1}

                {/* ERROR DOT */}
                {hasError && !active && !completed && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </motion.div>

              {/* LABEL */}
              <span
                className={`
                  text-[10px] sm:text-xs
                  font-medium
                  ${
                    active
                      ? "text-blue-600"
                      : hasError
                        ? "text-red-500"
                        : "text-gray-400"
                  }
                `}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
