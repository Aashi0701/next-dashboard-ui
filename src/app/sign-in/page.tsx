"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const role = user.publicMetadata?.role as string | undefined;
    router.replace(role ? `/${role}` : "/dashboard");
  }, [isLoaded, isSignedIn, user, router]);

  if (isLoaded && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300">
        <div className="flex flex-col items-center gap-3 text-white">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <p className="text-sm opacity-90">Signing you in...</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-60 h-60 bg-indigo-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl rounded-[24px] sm:rounded-[28px] overflow-hidden bg-white/20 backdrop-blur-2xl border border-none shadow-[0_20px_60px_rgba(0,0,0,0.16)] grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="hidden lg:flex relative flex-col justify-between px-10 py-8 text-white bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
          {/* Back Button Inside Card */}
          <Link
            href="/"
            className="absolute top-5 left-5 z-20 flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg hover:bg-white/20 hover:scale-105 transition-all"
          >
            ←
          </Link>

          {/* Decorative Shapes */}
          <div className="absolute inset-0">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center mt-6">
            {/* Large Illustration */}
            <div className="mb-2">
              <Image
                src="/newLogo.png"
                alt="School Portal Illustration"
                width={200}
                height={200}
                className="object-contain drop-shadow-2xl"
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold mb-4 leading-tight">
              TrueSunshine School Portal
            </h2>

            <p className="max-w-sm text-sm text-white/85 leading-7">
              Secure and centralized access to academics, administration,
              admissions, and school operations — all in one place.
            </p>

            {/* Slider Dots Style */}
            <div className="flex items-center gap-2 mt-6">
              <span className="w-5 h-1.5 rounded-full bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative flex items-center justify-center bg-white/95 backdrop-blur-xl px-5 sm:px-8 py-8 sm:py-10 rounded-[24px] lg:rounded-none">
          {/* Mobile Back Button */}
          <Link
            href="/"
            className="lg:hidden absolute top-4 left-4 flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-200 transition"
          >
            ←
          </Link>

          <div className="w-full max-w-[320px] sm:max-w-[340px]">
            {/* Logo */}
            <div className="flex flex-col items-center mb-5 pt-6 sm:pt-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center shadow-md border border-indigo-100">
                <Image
                  src="/school_logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="object-contain sm:w-12 sm:h-12"
                />
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
                User Login
              </h1>

              <p className="mt-1 text-[11px] sm:text-xs text-gray-500 text-center">
                Sign in to continue to your dashboard
              </p>
            </div>

            <SignIn.Root>
              <SignIn.Step name="start" className="space-y-4">
                {/* GLOBAL ERROR */}
                <Clerk.GlobalError className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-3 py-3 text-center" />

                {/* USERNAME */}
                <Clerk.Field name="identifier">
                  <Clerk.Label className="text-xs sm:text-sm font-medium text-gray-600">
                    Username or Email
                  </Clerk.Label>

                  <div className="relative mt-1.5">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    <Clerk.Input
                      required
                      autoComplete="username"
                      placeholder="Enter username or email"
                      className="w-full rounded-xl bg-gray-100 border border-gray-200 pl-11 pr-4 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <Clerk.FieldError className="text-xs text-red-500 mt-1" />
                </Clerk.Field>

                {/* PASSWORD */}
                {/* PASSWORD */}
                <Clerk.Field name="password">
                  <Clerk.Label className="text-xs sm:text-sm font-medium text-gray-600">
                    Password
                  </Clerk.Label>

                  <div className="relative mt-1.5">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />

                    <Clerk.Input
                      required
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="w-full rounded-xl bg-gray-100 border border-gray-200 pl-11 pr-12 py-2.5 sm:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <Clerk.FieldError className="text-xs text-red-500 mt-1" />
                </Clerk.Field>

                {/* Forgot Password */}
                <div className="text-right">
                  <SignIn.Action
                    navigate="forgot-password"
                    className="text-[11px] sm:text-xs font-medium text-purple-600 hover:text-pink-500 transition"
                  >
                    Forgot password?
                  </SignIn.Action>
                </div>

                {/* LOGIN BUTTON */}
                <SignIn.Action
                  submit
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 py-2.5 sm:py-3 text-sm font-semibold text-white flex justify-center shadow-lg hover:scale-[1.02] transition-all"
                >
                  <Clerk.Loading>
                    {(loading) =>
                      loading ? (
                        <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        "Login"
                      )
                    }
                  </Clerk.Loading>
                </SignIn.Action>
              </SignIn.Step>
            </SignIn.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
