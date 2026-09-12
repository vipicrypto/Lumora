import Link from "next/link";

const faqGroups = [
  {
    label: "Shopping",
    title: "Before you buy",
    questions: [
      {
        question: "What is Lumora?",
        answer:
          "Lumora is a thoughtfully curated gifting destination designed to help you discover beautiful and meaningful gifts for the people who matter to you.",
      },
      {
        question: "How do I find the right gift?",
        answer:
          "You can explore our collections by category, recipient, occasion, or simply browse the full selection. We curate our products to make discovering a thoughtful gift easier.",
      },
      {
        question: "How do I place an order?",
        answer:
          "Choose the product you love, select any available options, add it to your cart, and continue to checkout. You can review your order details before completing your purchase.",
      },
      {
        question: "Are all products available all the time?",
        answer:
          "Availability can change depending on stock. If a product is unavailable, you may need to check back later or explore similar products in our collections.",
      },
    ],
  },
  {
    label: "Orders",
    title: "Your order",
    questions: [
      {
        question: "Can I change or cancel my order?",
        answer:
          "If you need to change or cancel an order, contact our support team as soon as possible. Whether a change can be made depends on the current processing or shipping status of your order.",
      },
      {
        question: "Can I track my order?",
        answer:
          "When tracking information is available, it will be provided so you can follow your order during delivery.",
      },
      {
        question: "What if I entered the wrong delivery address?",
        answer:
          "Please contact us immediately if you notice an incorrect delivery address. We will do our best to help, although changes may not be possible once an order has been processed or shipped.",
      },
      {
        question: "What if my order is delayed?",
        answer:
          "Delivery times can vary based on destination, shipping conditions, and other circumstances. If your order appears to be significantly delayed, contact our support team and we will help you check its status.",
      },
    ],
  },
  {
    label: "Shipping",
    title: "Delivery & returns",
    questions: [
      {
        question: "How long does delivery take?",
        answer:
          "Estimated delivery times can vary depending on your location, product availability, and the shipping method. Relevant delivery information is provided during the ordering process.",
      },
      {
        question: "Can I return or exchange an item?",
        answer:
          "Return and exchange eligibility depends on the product and its condition. Please contact us before sending an item back so we can confirm the appropriate process for your order.",
      },
      {
        question: "What if my order arrives damaged?",
        answer:
          "Please contact us as soon as possible if your order arrives damaged or incorrect. Include your order number and details of the issue. Our team will review it and guide you through the next steps.",
      },
      {
        question: "Are personalized items returnable?",
        answer:
          "Personalized, customized, or specially prepared items may have different return conditions. Please check the relevant product information or contact us before placing your order if you have questions.",
      },
    ],
  },
  {
    label: "Support",
    title: "Need a little more help?",
    questions: [
      {
        question: "How can I contact Lumora?",
        answer:
          "You can reach our team through the Contact Us page. We can help with orders, products, delivery, returns, and other questions about your Lumora experience.",
      },
      {
        question: "How quickly will I receive a response?",
        answer:
          "Our customer care team aims to respond as soon as possible. Response times may vary depending on the nature and volume of enquiries.",
      },
      {
        question: "I have a question that isn't listed here.",
        answer:
          "No problem. Send us a message through our Contact Us page and tell us what you need. If we can help, we will.",
      },
    ],
  },
];

export const dynamic = "force-static";

export default function FAQPage() {
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
              Help Centre
            </div>

            <h1 className="text-5xl font-semibold leading-[0.95] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Questions,
              <br />
              <span className="text-neutral-400">answered.</span>
            </h1>

            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                Everything you need to know about shopping with Lumora,
                from finding the right gift to receiving it at your door.
              </p>

              <Link
                href="/contact"
                className="inline-flex w-fit items-center gap-3 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Contact support
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick navigation */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="mr-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
              Browse
            </span>

            {faqGroups.map((group) => (
              <a
                key={group.label}
                href={`#${group.label.toLowerCase()}`}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
              >
                {group.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ groups */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="space-y-20 sm:space-y-28">
          {faqGroups.map((group, groupIndex) => (
            <section
              key={group.label}
              id={group.label.toLowerCase()}
              className="scroll-mt-28"
            >
              <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
                {/* Section intro */}
                <div className="lg:sticky lg:top-28 lg:h-fit">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-neutral-400">
                      {String(groupIndex + 1).padStart(2, "0")}
                    </span>

                    <span className="h-px w-8 bg-neutral-300" />

                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                      {group.label}
                    </span>
                  </div>

                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                    {group.title}
                  </h2>
                </div>

                {/* Questions */}
                <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                  {group.questions.map((faq, index) => (
                    <details
                      key={faq.question}
                      className="group"
                    >
                      <summary className="flex cursor-pointer list-none items-center gap-6 py-6 text-left sm:py-7">
                        <span className="w-7 shrink-0 text-xs font-medium text-neutral-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="flex-1 text-base font-medium leading-6 sm:text-lg">
                          {faq.question}
                        </span>

                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-lg font-light transition duration-200 group-open:rotate-45 group-open:bg-neutral-900 group-open:text-white">
                          +
                        </span>
                      </summary>

                      <div className="pb-7 pl-13 pr-4 sm:pl-13 sm:pr-14">
                        <p className="max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* Support CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
        <div className="overflow-hidden rounded-[34px] bg-neutral-900 text-white">
          <div className="grid lg:grid-cols-[1fr_0.8fr]">
            <div className="p-8 sm:p-12 lg:p-16">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                Still wondering?
              </p>

              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
                Some questions are
                <br />
                better answered by a person.
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
                If you couldn&apos;t find what you were looking for, our team
                is happy to help with your specific question.
              </p>

              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
              >
                Talk to us
                <span>→</span>
              </Link>
            </div>

            <div className="flex min-h-[280px] items-end border-t border-white/10 p-8 sm:p-12 lg:border-l lg:border-t-0 lg:p-16">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
                  Lumora Support
                </p>

                <p className="mt-4 text-2xl font-medium tracking-tight">
                  Thoughtful help,
                  <br />
                  when you need it.
                </p>

                <div className="mt-7 h-px w-16 bg-neutral-700" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Lumora
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
            Find the answer.
            <br />
            <span className="text-neutral-400">
              Then find the perfect gift.
            </span>
          </h2>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/categories"
              className="inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Explore Gifts
              <span>→</span>
            </Link>

            <Link
              href="/shipping"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Shipping & Returns
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}