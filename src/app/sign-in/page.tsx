"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";

export default function LoginPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  /* Redirect after login */
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
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 flex items-center justify-center px-4">

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-6 left-6 rounded-full bg-gradient-to-r from-indigo-600 to-pink-500 px-4 py-1.5 text-sm font-medium text-white shadow-md hover:opacity-90"
      >
        ← Back to Home
      </Link>

      <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.25)] grid grid-cols-1 md:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center px-12 py-14 text-white bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 relative">
          <h2 className="text-3xl font-semibold mb-4">
            Welcome to TrueSunshine
          </h2>

          <p className="text-sm text-white/90 max-w-sm leading-relaxed">
            Secure and centralized access to the School Management System.
            Manage academics, administration, and operations seamlessly.
          </p>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-400/30 rounded-full blur-3xl" />
            <div className="absolute top-10 right-10 w-52 h-52 bg-indigo-300/30 rounded-full blur-2xl" />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center bg-gray-50 px-8 py-12">
          <div className="w-full max-w-sm">

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <Image
                src="/school_logo.png"
                alt="Logo"
                width={48}
                height={48}
              />
              <h1 className="mt-4 text-xl font-semibold text-gray-900">
                User Login
              </h1>
            </div>

            <SignIn.Root>

              <SignIn.Step name="start" className="space-y-5">

                {/* GLOBAL ERROR */}
                <Clerk.GlobalError className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-3 py-2 text-center" />

                {/* USERNAME */}
                <Clerk.Field name="identifier">
                  <Clerk.Label className="text-sm text-gray-600">
                    Username or Email
                  </Clerk.Label>

                  <Clerk.Input
                    required
                    autoComplete="username"
                    placeholder="Enter username"
                    className="w-full rounded-full bg-gray-200 border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />

                  <Clerk.FieldError className="text-xs text-red-500 mt-1" />
                </Clerk.Field>

                {/* PASSWORD */}
                <Clerk.Field name="password">
                  <Clerk.Label className="text-sm text-gray-600">
                    Password
                  </Clerk.Label>

                  <div className="relative">

                    <Clerk.Input
                      required
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="w-full rounded-full bg-gray-200 border border-gray-200 px-5 py-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    {/* Show / Hide */}
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                  <Clerk.FieldError className="text-xs text-red-500 mt-1" />
                </Clerk.Field>

                {/* Forgot Password */}
                <div className="text-right">
                  <SignIn.Action
                    navigate="forgot-password"
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Forgot password?
                  </SignIn.Action>
                </div>

                {/* LOGIN BUTTON */}
                <SignIn.Action
                  submit
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-sm font-semibold text-white flex justify-center shadow-md hover:opacity-95"
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