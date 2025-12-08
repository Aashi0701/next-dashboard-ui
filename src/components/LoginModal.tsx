"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LoginModal({ open, onClose }: any) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const [animate, setAnimate] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  // 🔐 Local validation state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    identifier?: string;
    password?: string;
  }>({});

  // Modal animation
  useEffect(() => {
    setAnimate(open);
  }, [open]);

  // Redirect after login
  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const role = user.publicMetadata.role;
      if (role) {
        setPageLoading(true);
        setTimeout(() => {
          onClose();
          router.push(`/${role}`);
        }, 250);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  // ❌ Shake animation for auth errors
  const triggerAuthError = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 350);
  };

  // ✅ Client-side validation
  const validate = () => {
    const errors: typeof fieldErrors = {};

    if (!identifier.trim()) {
      errors.identifier = "Username is required";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  return (
    <>
      {/* Loading overlay after success */}
      {pageLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      >
        {/* Modal */}
        <div
          className={`bg-white p-8 rounded-2xl shadow-2xl w-[420px] relative transition-all duration-300
            ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}
            ${errorShake ? "animate-shake" : ""}
          `}
        >
          {/* Close */}
          <button
            onClick={() => {
              setAnimate(false);
              setTimeout(onClose, 200);
            }}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
          >
            ✕
          </button>

          {/* Header */}
          <div className="flex flex-col items-center mb-4">
            <Image src="/my_logo.png" width={55} height={55} alt="Logo" />
            <h2 className="mt-3 text-2xl font-semibold text-amber-800">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>

          <SignIn.Root>
            <SignIn.Step name="start" className="flex flex-col gap-4 mt-4">
              {/* Global error (wrong credentials, etc.) */}
              <Clerk.GlobalError className="text-sm text-red-600 text-center" />

              {/* Username */}
              <Clerk.Field name="identifier">
                <Clerk.Label className="text-sm font-medium">
                  Username
                </Clerk.Label>

                <Clerk.Input
                  className="
                    w-full mt-1 p-3 rounded-lg border
                    border-gray-300 focus:ring-2 focus:ring-amber-500
                  "
                />

                <Clerk.FieldError className="text-xs text-red-600 mt-1" />
              </Clerk.Field>

              {/* Password */}
              <Clerk.Field name="password">
                <Clerk.Label className="text-sm font-medium">
                  Password
                </Clerk.Label>

                <Clerk.Input
                  type="password"
                  className="
                    w-full mt-1 p-3 rounded-lg border
                    border-gray-300 focus:ring-2 focus:ring-amber-500
                  "
                />

                <Clerk.FieldError className="text-xs text-red-600 mt-1" />
              </Clerk.Field>

              {/* Submit */}
              <SignIn.Action
                submit
                className="
                  mt-3 w-full py-3
                  bg-amber-600 text-white
                  rounded-lg font-semibold
                  shadow hover:bg-amber-700
                  transition
                "
              >
                Sign In
              </SignIn.Action>
            </SignIn.Step>
          </SignIn.Root>
        </div>
      </div>
    </>
  );
}
