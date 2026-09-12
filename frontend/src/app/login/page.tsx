"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
            onSubmit={async (e) => {
              e.preventDefault();

              setError("");
              setLoading(true);

              const formData = new FormData(e.currentTarget);

              const email = String(
                formData.get("email") || ""
              ).trim();

              const password = String(
                formData.get("password") || ""
              );

              if (!email || !password) {
                setError(
                  "Please enter your email and password."
                );
                setLoading(false);
                return;
              }

              try {
                const response = await fetch("/api/login", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email,
                    password,
                  }),
                });

                const data = await response.json();

                if (!response.ok) {
                  setError(
                    data.error || "Unable to sign in."
                  );
                  return;
                }

                /*
                 * Tell CartContext that authentication changed.
                 *
                 * CartContext will call /api/auth/me, get the
                 * newly logged-in user's ID, and switch from the
                 * guest cart to that user's own cart.
                 */
                window.dispatchEvent(
                  new Event("lumora-auth-changed")
                );

if (data.user?.role === "ADMIN") {
  window.location.href = "/admin";
} else {
  window.location.href = "/account";
}              } catch {
                setError(
                  "Unable to sign in. Please try again."
                );
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-5"
          >
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              </div>
            )}

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
                required
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
                  type={
                    showPassword ? "text" : "password"
                  }
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3.5 pr-16 bg-stone-50 border border-stone-200 rounded-xl text-sm text-[#2d2a26] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f5a]/20 focus:border-[#8b6f5a] transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-stone-400 hover:text-[#2d2a26] transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                className="w-4 h-4 rounded border-stone-300 text-[#8b6f5a] focus:ring-[#8b6f5a]"
              />

              <span className="text-xs text-stone-500">
                Remember me
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2d2a26] text-white px-6 py-3.5 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
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
