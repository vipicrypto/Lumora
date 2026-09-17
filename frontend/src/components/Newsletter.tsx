"use client";

import { useState } from "react";

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
        }),
      });

      let data: {
        success?: boolean;
        message?: string;
        error?: string;
      } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Unable to subscribe right now."
        );
      }

      setSubmitted(true);
      setEmail("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to subscribe right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#f5f0e8] to-[#e8dfd0] border border-stone-200/60">
      <div className="relative grid md:grid-cols-2 gap-8 md:gap-12 items-center px-8 md:px-14 py-14 md:py-16">
        <div>
          <span className="inline-block text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-[#8b6f5a] mb-3">
            Join the family
          </span>

          <h2 className="text-2xl md:text-4xl font-serif font-semibold text-[#2d2a26] leading-tight mb-3">
            Be the first to know
          </h2>

          <p className="text-sm md:text-base text-[#5a5248] max-w-md">
            Get exclusive offers, new arrival alerts, and thoughtful
            gift ideas delivered straight to your inbox.
          </p>
        </div>

        <form
          className="w-full"
          onSubmit={handleSubmit}
        >
          {submitted ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/60 text-center">
              <div className="w-12 h-12 bg-[#8b6f5a]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-[#8b6f5a]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <p className="text-sm font-semibold text-[#2d2a26]">
                Thanks for subscribing!
              </p>

              <p className="text-xs text-stone-500 mt-1">
                You're now part of the Lumora family.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-stone-200/60 flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter your email"
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-sm bg-transparent text-[#1a1a1a] placeholder:text-stone-400 focus:outline-none disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#2d2a26] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#1a1a1a] transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Subscribing..." : "Subscribe"}
                </button>
              </div>

              {error && (
                <p className="mt-2 px-1 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}
            </>
          )}

          <p className="text-[11px] text-stone-500 mt-3 text-center sm:text-left">
            By subscribing, you agree to our Privacy Policy.
            Unsubscribe anytime.
          </p>
        </form>
      </div>
    </section>
  );
};