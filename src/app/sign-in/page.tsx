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

  // ✅ Redirect AFTER successful sign-in
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const role = user.publicMetadata?.role as string | undefined;
    router.replace(role ? `/${role}` : "/dashboard");
  }, [isLoaded, isSignedIn, user, router]);

  // ✅ BLOCK UI WHILE REDIRECTING (prevents flashing)
  if (isLoaded && isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300">
        <div className="flex flex-col items-center gap-3 text-white">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
          <p className="text-sm opacity-90">Signing you in…</p>
        </div>
      </div>
    );
  }

  // ⏳ Clerk loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-300 flex items-center justify-center px-4">
      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-10 rounded-full bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-500 backdrop-blur px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition"
      >
        ← Back to Home
      </Link>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.25)] grid grid-cols-1 md:grid-cols-2">
        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center px-10 py-12 text-white bg-gradient-to-br from-indigo-500 to-purple-600 relative">
          <h2 className="text-3xl font-semibold mb-4">
            Welcome to TrueSunshine
          </h2>
          <p className="text-sm text-white/90 max-w-sm">
            Secure and centralized access to the School Management System.
            Manage academics, administration, and operations seamlessly.
          </p>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl" />
            <div className="absolute top-10 right-10 w-48 h-48 bg-indigo-300/30 rounded-full blur-2xl" />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center mb-8">
              <Image src="/my_logo.png" alt="Logo" width={56} height={56} />
              <h1 className="mt-4 text-xl font-semibold text-gray-900">
                User Login
              </h1>
            </div>

            <SignIn.Root>
              <SignIn.Step name="start" className="space-y-5">
                <Clerk.GlobalError className="text-sm text-red-600 text-center" />

                <Clerk.Field name="identifier">
                  <Clerk.Label className="text-sm text-gray-600">
                    Username
                  </Clerk.Label>
                  <Clerk.Input className="w-full rounded-full border px-4 py-3 text-sm" />
                </Clerk.Field>

                <Clerk.Field name="password">
                  <Clerk.Label className="text-sm text-gray-600">
                    Password
                  </Clerk.Label>
                  <div className="relative">
                    <Clerk.Input
                      type={showPassword ? "text" : "password"}
                      className="w-full rounded-full border px-4 py-3 pr-14 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </Clerk.Field>

                <div className="text-right">
                  <SignIn.Action
                    navigate="forgot-password"
                    className="text-xs text-purple-600 hover:underline"
                  >
                    Forgot password?
                  </SignIn.Action>
                </div>

                <SignIn.Action
                  submit
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-sm font-semibold text-white flex justify-center"
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

              <SignIn.Step name="forgot-password" className="space-y-5">
                <h2 className="text-lg font-semibold text-center">
                  Reset Password
                </h2>

                <Clerk.Field name="identifier">
                  <Clerk.Input className="w-full rounded-full border px-4 py-3 text-sm" />
                </Clerk.Field>

                <SignIn.Action
                  submit
                  className="w-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 py-3 text-sm text-white"
                >
                  Send reset link
                </SignIn.Action>

                <SignIn.Action
                  navigate="start"
                  className="text-xs text-gray-500 text-center hover:underline"
                >
                  Back to login
                </SignIn.Action>
              </SignIn.Step>
            </SignIn.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
