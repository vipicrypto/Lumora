import Link from "next/link";

export const dynamic = "force-static";

const shippingSteps = [
  {
    number: "01",
    title: "Place your order",
    description:
      "Choose your gifts, review your order details, and complete checkout with your delivery information.",
  },
  {
    number: "02",
    title: "We prepare it",
    description:
      "Your order is carefully checked and prepared before it leaves us.",
  },
  {
    number: "03",
    title: "On its way",
    description:
      "Once shipped, tracking information may be provided when available so you can follow your order.",
  },
  {
    number: "04",
    title: "Delivered with care",
    description:
      "Your package makes its way to the delivery address provided during checkout.",
  },
];

const returnPoints = [
  "Please contact us before sending an item back so we can confirm the appropriate process.",
  "Return eligibility may depend on the product, its condition, and the circumstances of the request.",
  "Items should meet the applicable condition requirements for the return or exchange.",
  "Personalized, customized, or specially prepared items may have different return conditions where applicable.",
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-neutral-100 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-neutral-50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="max-w-5xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
              Shipping & Returns
            </div>

            <h1 className="text-5xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              From our door
              <br />
              <span className="text-neutral-400">
                to yours.
              </span>
            </h1>

            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                We want every order to feel as considered when it arrives as
                it did when you chose it.
              </p>

              <Link
                href="/contact"
                className="inline-flex w-fit items-center gap-3 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Need help?
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick overview */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto grid max-w-6xl gap-px bg-neutral-200 sm:grid-cols-3">
          <div className="bg-neutral-50 px-6 py-7">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
              Shipping
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Delivery details are shown during the ordering process.
            </p>
          </div>

          <div className="bg-neutral-50 px-6 py-7">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
              Tracking
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Tracking information may be provided when available.
            </p>
          </div>

          <div className="bg-neutral-50 px-6 py-7">
            <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
              Returns
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              Contact us first so we can guide you through the process.
            </p>
          </div>
        </div>
      </section>

      {/* How shipping works */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Shipping
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              A simple journey.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-500 sm:text-base">
              From checkout to delivery, here&apos;s what you can generally
              expect from your Lumora order.
            </p>
          </div>

          <div className="border-t border-neutral-200">
            {shippingSteps.map((step) => (
              <div
                key={step.number}
                className="grid gap-5 border-b border-neutral-200 py-8 sm:grid-cols-[64px_1fr] sm:gap-8"
              >
                <span className="text-xs font-medium text-neutral-400">
                  {step.number}
                </span>

                <div>
                  <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {step.title}
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery details */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Good to know
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Before your order arrives.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-7 sm:p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-sm">
                01
              </span>

              <h3 className="mt-7 text-xl font-semibold">
                Delivery times
              </h3>

              <p className="mt-3 text-sm leading-7 text-neutral-600">
                Delivery time can vary depending on your location, product
                availability, shipping method, and circumstances outside our
                control.
              </p>
            </div>

            <div className="rounded-[28px] border border-neutral-200 bg-white p-7 sm:p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-sm">
                02
              </span>

              <h3 className="mt-7 text-xl font-semibold">
                Your address
              </h3>

              <p className="mt-3 text-sm leading-7 text-neutral-600">
                Please check your delivery address and contact details
                carefully before completing your order.
              </p>
            </div>

            <div className="rounded-[28px] border border-neutral-200 bg-white p-7 sm:p-8">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-sm">
                03
              </span>

              <h3 className="mt-7 text-xl font-semibold">
                Tracking
              </h3>

              <p className="mt-3 text-sm leading-7 text-neutral-600">
                When tracking is available, it may be shared with you so you
                can follow your package while it is on its way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Returns */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Returns & Exchanges
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              If things don&apos;t go to plan.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-500 sm:text-base">
              We&apos;ll do our best to make the process clear and
              straightforward.
            </p>
          </div>

          <div>
            <div className="rounded-[30px] border border-neutral-200 p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-sm text-white">
                  ✓
                </span>

                <h3 className="text-xl font-semibold">
                  Return information
                </h3>
              </div>

              <ul className="mt-8 space-y-5">
                {returnPoints.map((point) => (
                  <li
                    key={point}
                    className="flex gap-4 text-sm leading-7 text-neutral-600 sm:text-base"
                  >
                    <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-neutral-200 pt-7">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
                >
                  Ask about a return
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Damaged orders */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
        <div className="overflow-hidden rounded-[32px] bg-neutral-900 text-white">
          <div className="grid lg:grid-cols-[1fr_0.75fr]">
            <div className="p-8 sm:p-12 lg:p-14">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                Something not right?
              </p>

              <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
                Damaged or incorrect order?
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
                Contact us as soon as possible with your order number and a
                description of the issue. Photos or additional information may
                be requested so we can understand what happened and help with
                the next steps.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
              >
                Contact Support
                <span>→</span>
              </Link>
            </div>

            <div className="flex min-h-[280px] items-end border-t border-white/10 p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-14">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Lumora Care
                </p>

                <p className="mt-4 text-2xl font-medium leading-tight">
                  We&apos;re here to
                  <br />
                  make it right.
                </p>

                <div className="mt-7 h-px w-14 bg-neutral-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ CTA */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Need more information?
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
            We&apos;ve kept the details
            <br />
            <span className="text-neutral-400">
              simple.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
            Browse our frequently asked questions or reach out directly if
            you need help with something specific.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/faq"
              className="inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Browse FAQ
              <span>→</span>
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}