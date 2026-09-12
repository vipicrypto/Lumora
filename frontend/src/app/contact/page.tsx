import Link from "next/link";

export const dynamic = "force-static";

const contactCards = [
  {
    number: "01",
    label: "General Enquiries",
    title: "Let’s talk.",
    description:
      "Have a question about Lumora, our products, or something else? Send us a message and we’ll get back to you.",
    email: "hello@lumora.com",
  },
  {
    number: "02",
    label: "Order Support",
    title: "Need a hand?",
    description:
      "Questions about an order, delivery, return, or anything that didn’t go as expected? We’re here to help.",
    email: "support@lumora.com",
  },
  {
    number: "03",
    label: "Partnerships",
    title: "Work with us.",
    description:
      "Interested in collaborating with Lumora, working together on a campaign, or discussing a business opportunity?",
    email: "hello@lumora.com",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-neutral-100 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-neutral-50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
              Contact Lumora
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              We&apos;d love
              <br />
              <span className="text-neutral-400">to hear from you.</span>
            </h1>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-base leading-7 text-neutral-600 sm:text-lg">
                Whether you have a question, need help with an order, or simply
                want to say hello, our team is always happy to hear from you.
              </p>

              <Link
                href="#contact-options"
                className="inline-flex w-fit items-center gap-3 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Get in touch
                <span className="text-base">↓</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact options */}
      <section
        id="contact-options"
        className="mx-auto max-w-6xl px-6 py-16 sm:py-24"
      >
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              How can we help?
            </p>

            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Choose what you need.
            </h2>
          </div>

          <p className="max-w-sm text-sm leading-6 text-neutral-500">
            Pick the option that best matches your question and reach out
            directly.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {contactCards.map((card) => (
            <div
              key={card.number}
              className="group flex min-h-[330px] flex-col rounded-[28px] border border-neutral-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                  {card.number}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                  ↗
                </span>
              </div>

              <div className="mt-auto">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  {card.label}
                </p>

                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  {card.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-neutral-600">
                  {card.description}
                </p>

                <a
                  href={`mailto:${card.email}`}
                  className="mt-6 inline-flex text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
                >
                  {card.email}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Support strip */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                Customer Care
              </p>

              <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Good questions deserve good answers.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
                Our customer care team can help with orders, products,
                shipping, returns, and anything else you need while shopping
                with Lumora.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                  Support Hours
                </p>

                <p className="mt-3 text-lg font-semibold">
                  Monday – Saturday
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  9:00 AM – 6:00 PM
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-neutral-400">
                  Response Time
                </p>

                <p className="mt-3 text-lg font-semibold">
                  1–2 business days
                </p>

                <p className="mt-1 text-sm text-neutral-500">
                  We&apos;ll get back to you
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / Shipping links */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/faq"
            className="group rounded-[28px] border border-neutral-200 p-7 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-9"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Before you reach out
                </p>

                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  Browse the FAQ
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
                  Find quick answers to common questions about orders,
                  delivery, returns, and more.
                </p>
              </div>

              <span className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 transition group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                ↗
              </span>
            </div>
          </Link>

          <Link
            href="/shipping"
            className="group rounded-[28px] border border-neutral-200 p-7 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] sm:p-9"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
                  Delivery & returns
                </p>

                <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                  Shipping & Returns
                </h3>

                <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
                  Learn more about delivery, returns, exchanges, and getting
                  help with an order.
                </p>
              </div>

              <span className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-200 transition group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                ↗
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
            Lumora
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Thoughtful gifts.
            <br />
            Thoughtful service.
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-neutral-500">
            We&apos;re here to make your experience with Lumora as simple and
            enjoyable as possible.
          </p>

          <Link
            href="/categories"
            className="mt-7 inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Explore Lumora
            <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}