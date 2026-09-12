import Link from "next/link";

export const dynamic = "force-static";

const policySections = [
  {
    number: "01",
    title: "General Terms",
    intro:
      "These terms explain the basic conditions for using the Lumora website and services.",
    points: [
      "By accessing or using Lumora, you agree to use the website responsibly and in accordance with these terms.",
      "Product information, descriptions, images, pricing, and availability are provided as accurately as reasonably possible.",
      "Product details, pricing, availability, and website content may be updated from time to time.",
    ],
  },
  {
    number: "02",
    title: "Orders & Payments",
    intro:
      "Please make sure the information provided during checkout is accurate before placing your order.",
    points: [
      "You are responsible for providing accurate contact, billing, and delivery information.",
      "Orders are subject to product availability and successful payment processing.",
      "If an issue affects your order, Lumora may contact you using the details provided during checkout.",
      "The price applicable to your order is the price displayed when the order is placed.",
    ],
  },
  {
    number: "03",
    title: "Shipping",
    intro:
      "We prepare orders carefully and provide delivery information based on the destination and available shipping options.",
    points: [
      "Estimated delivery times may vary depending on destination, product availability, shipping method, and circumstances outside our control.",
      "Tracking information may be provided when it is available for your shipment.",
      "Please verify your delivery address and contact details before completing your order.",
      "Delivery estimates are intended as guidance and may occasionally change due to unforeseen circumstances.",
    ],
  },
  {
    number: "04",
    title: "Returns & Exchanges",
    intro:
      "We want you to feel confident about your purchase. Return and exchange eligibility can vary by product.",
    points: [
      "Please contact Lumora before sending an item back so we can confirm the appropriate process.",
      "Returned items should meet the applicable condition requirements for the return or exchange.",
      "Return or exchange eligibility may depend on the product, condition, and circumstances of the request.",
      "Personalized, customized, or specially prepared products may have different return conditions where applicable.",
    ],
  },
  {
    number: "05",
    title: "Damaged or Incorrect Orders",
    intro:
      "If something isn't right with your order, please let us know as soon as possible.",
    points: [
      "Contact our support team if your order arrives damaged, incorrect, or incomplete.",
      "Include your order number and a clear description of the issue.",
      "Photos or additional information may be requested to help us review the issue.",
      "Once reviewed, our team will guide you through the available resolution.",
    ],
  },
  {
    number: "06",
    title: "Product Information",
    intro:
      "We make reasonable efforts to ensure that the information displayed for each product is accurate.",
    points: [
      "Product colours and appearance may vary slightly depending on your device, display settings, lighting, or the nature of the product.",
      "Product dimensions, materials, descriptions, and other specifications may be updated when necessary.",
      "Product availability can change without prior notice.",
    ],
  },
  {
    number: "07",
    title: "Website Use",
    intro:
      "Lumora is intended to provide a safe, useful, and enjoyable shopping experience.",
    points: [
      "You agree not to misuse the website, interfere with its operation, or attempt unauthorized access.",
      "The website should not be used for unlawful purposes or activities that could harm the service or other users.",
      "Lumora content, branding, graphics, layouts, text, and other materials should not be reproduced or used without appropriate permission.",
    ],
  },
  {
    number: "08",
    title: "Privacy",
    intro:
      "We respect the information you provide while using Lumora.",
    points: [
      "Information provided through the website may be used to process orders and provide customer support.",
      "Information may also be used to communicate with you about your account, orders, or Lumora services.",
      "Please avoid submitting personal information that is not necessary for your interaction with Lumora.",
    ],
  },
  {
    number: "09",
    title: "Policy Updates",
    intro:
      "As Lumora grows, our policies may occasionally need to change.",
    points: [
      "We may update these terms and policies when our website, products, services, or applicable requirements change.",
      "Updated policies will be made available on this page.",
      "Where applicable, continued use of the website after an update may indicate acceptance of the updated terms.",
    ],
  },
];

export default function PoliciesPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Hero */}
      <section className="border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-14 sm:pb-24 sm:pt-20">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
              Terms & Policies
            </div>

            <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-7xl">
              Clear terms.
              <br />
              <span className="text-neutral-400">
                No unnecessary complexity.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
              Everything you need to know about using Lumora, placing an
              order, shipping, returns, and our approach to your information.
            </p>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-xs font-medium uppercase tracking-[0.16em] text-neutral-400">
              On this page
            </span>

            {policySections.slice(0, 6).map((section) => (
              <a
                key={section.number}
                href={`#policy-${section.number}`}
                className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
              >
                {section.title}
              </a>
            ))}

            <a
              href="#policy-07"
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-600 transition hover:border-neutral-400 hover:text-neutral-900"
            >
              More
            </a>
          </div>
        </div>
      </section>

      {/* Policy content */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[280px_1fr] lg:gap-20">
          {/* Side information */}
          <aside className="h-fit lg:sticky lg:top-28">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
              Lumora Policies
            </p>

            <p className="mt-4 text-sm leading-7 text-neutral-500">
              We believe policies should be easy to understand. If something
              here is unclear or you need help with a specific order, please
              contact our team.
            </p>

            <div className="mt-7 hidden border-t border-neutral-200 pt-6 lg:block">
              <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                Need help?
              </p>

              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
              >
                Contact support
                <span>→</span>
              </Link>
            </div>
          </aside>

          {/* Main policies */}
          <div className="border-t border-neutral-200">
            {policySections.map((section) => (
              <article
                key={section.number}
                id={`policy-${section.number}`}
                className="scroll-mt-28 border-b border-neutral-200 py-10 sm:py-12"
              >
                <div className="grid gap-6 sm:grid-cols-[64px_1fr] sm:gap-8">
                  <div>
                    <span className="text-xs font-medium text-neutral-400">
                      {section.number}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                      {section.title}
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
                      {section.intro}
                    </p>

                    <ul className="mt-6 max-w-3xl space-y-4">
                      {section.points.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3 text-sm leading-7 text-neutral-600 sm:text-base"
                        >
                          <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Important note */}
      <section className="mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
        <div className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-7 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-400">
                A quick note
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                Need something specific?
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600">
                Policies can vary depending on the product and circumstances
                of an order. If you are unsure about something, contacting us
                before taking action is always the best option.
              </p>
            </div>

            <Link
              href="/faq"
              className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-medium transition hover:border-neutral-500"
            >
              Browse FAQ
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="rounded-[32px] bg-neutral-900 px-7 py-10 text-white sm:px-12 sm:py-14">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Lumora Support
                </p>

                <h2 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
                  We&apos;re here if you need us.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-neutral-400 sm:text-base">
                  Questions about an order, shipping, returns, or anything
                  else? Our team is happy to help.
                </p>
              </div>

              <Link
                href="/contact"
                className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
              >
                Contact Us
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer navigation */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col gap-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <p className="text-sm text-neutral-500">
              Looking for more information?
            </p>

            <div className="flex flex-wrap items-center justify-center gap-5 text-sm sm:justify-end">
              <Link
                href="/faq"
                className="text-neutral-600 transition hover:text-neutral-900"
              >
                FAQ
              </Link>

              <Link
                href="/shipping"
                className="text-neutral-600 transition hover:text-neutral-900"
              >
                Shipping & Returns
              </Link>

              <Link
                href="/contact"
                className="text-neutral-600 transition hover:text-neutral-900"
              >
                Contact
              </Link>

              <Link
                href="/categories"
                className="font-medium text-neutral-900"
              >
                Explore Gifts →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}