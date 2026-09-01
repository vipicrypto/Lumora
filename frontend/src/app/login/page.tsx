"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-[75vh] bg-[#faf9f7] flex items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5"
          >
            <div className="w-10 h-10 rounded-full bg-[#2d2a26] flex items-center justify-center">
              <span className="text-white font-serif text-xl font-bold leading-none">
                L
              </span>
            </div>

            <span className="text-2xl font-serif font-semibold tracking-tight text-[#2d2a26]">
              Lumora
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#8b6f5a] mb-2">
              Welcome Back
            </p>

            <h1 className="text-3xl md:text-4xl font-serif font-semibold text-[#2d2a26]">
              Sign in to Lumora
            </h1>

            <p className="mt-2 text-sm text-stone-500">
              Access your orders, wishlist, and account.
            </p>
          </div>

          {/* Login Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold tracking-wide text-[#2d2a26] mb-2"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a] transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold tracking-wide text-[#2d2a26]"
                >
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-[#8b6f5a] hover:text-[#2d2a26] transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3.5 pr-12 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a] transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-stone-400 hover:text-[#2d2a26] transition-colors"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18M10.584 10.587a2 2 0 002.829 2.828M9.88 4.24A9.77 9.77 0 0112 4c5 0 9 3.5 10 8a9.73 9.73 0 01-2.1 4.26M6.61 6.61C4.93 7.84 3.7 9.63 3 12c1 4.5 5 8 9 8a9.77 9.77 0 004.24-.96"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-stone-300 text-[#8b6f5a] focus:ring-[#8b6f5a]"
              />

              <span className="text-xs text-stone-500">
                Remember me
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-[#2d2a26] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="h-px flex-1 bg-stone-100" />

            <span className="text-[10px] uppercase tracking-wider text-stone-400">
              New to Lumora?
            </span>

            <div className="h-px flex-1 bg-stone-100" />
          </div>

          {/* Register */}
          <Link
            href="/register"
            className="w-full inline-flex items-center justify-center border border-stone-200 bg-white text-[#2d2a26] px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-stone-50 hover:border-stone-300 transition-all"
          >
            Create an Account
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-stone-400 mt-6">
          By continuing, you agree to Lumora&apos;s terms and
          privacy policy.
        </p>
      </div>
    </main>
  );
}