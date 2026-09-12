"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "LUM-ORDER";

  return (
    <main className="min-h-[75vh] bg-[#faf9f7] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <div className="mx-auto mb-7 w-20 h-20 rounded-full bg-[#8b6f5a]/10 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#8b6f5a] flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#8b6f5a] mb-3">
          Order Confirmed
        </p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-[#2d2a26]">
          Thank You!
        </h1>

        <p className="mt-4 text-base md:text-lg text-[#5a5248] leading-relaxed max-w-lg mx-auto">
          Your order has been successfully placed. We&apos;ll take care of the
          rest and get your beautiful gifts on their way.
        </p>

        <div className="mt-9 bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sm:p-7 max-w-md mx-auto">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-stone-400 mb-2">
            Order Number
          </p>

          <p className="text-xl sm:text-2xl font-semibold tracking-wide text-[#2d2a26]">
            {orderId}
          </p>

          <div className="border-t border-stone-100 my-5" />

          <div className="flex items-center justify-center gap-2 text-sm text-stone-500">
            <svg className="w-4 h-4 text-[#8b6f5a]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>A confirmation has been saved with your order.</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-[#2d2a26] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#1a1a1a] transition-all shadow-sm hover:shadow-md"
          >
            Continue Shopping
          </Link>

          <Link
            href="/account"
            className="w-full sm:w-auto inline-flex items-center justify-center border border-stone-200 bg-white text-[#2d2a26] px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-stone-50 transition-all"
          >
            View My Orders
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-stone-400">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8b6f5a]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Carefully packed
          </span>

          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8b6f5a]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h2m-9 4h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Secure order
          </span>

          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#8b6f5a]" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Fast delivery
          </span>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
