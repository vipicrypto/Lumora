import Link from "next/link";

export const dynamic = "force-static";

const highlights = [
  {
    number: "01",
    title: "A thoughtful way to gift",
    description:
      "Lumora brings together carefully selected gifts for the moments that deserve a little more thought.",
  },
  {
    number: "02",
    title: "Curated with intention",
    description:
      "From everyday gestures to meaningful celebrations, our collections are built around the art of choosing well.",
  },
  {
    number: "03",
    title: "A brand built around feeling",
    description:
      "At the heart of Lumora is a simple belief: the right gift can make someone feel genuinely remembered.",
  },
];

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full bg-neutral-100 blur-3xl" />
        <div className="absolute -bottom-48 -left-48 h-[520px] w-[520px] rounded-full bg-neutral-50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-32 sm:pt-24">
          <div className="max-w-5xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
              Lumora Press
            </div>

            <h1 className="text-5xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Stories worth
              <br />
              <span className="text-neutral-400">sharing.</span>
            </h1>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
              <p className="max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                Welcome to the Lumora press room — a place for our brand story,
                ideas, collaborations, and the things we&apos;re excited to
                share with the world.
              </p>

              <div className="lg:text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                  Media & Partnerships
                </p>

                <a
                  href="mailto:press@lumora.com"
                  className="mt-2 inline-block text-lg font-medium underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
                >
                  press@lumora.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand introduction */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              About the brand
            </p>

            <h2 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              More than a gift.
            </h2>
          </div>

          <div className="max-w-3xl">
            <p className="text-2xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl sm:leading-[1.15]">
              Lumora is a modern gifting destination built around one simple
              idea — thoughtful choices make ordinary moments feel special.
            </p>

            <div className="mt-8 space-y-5 text-sm leading-7 text-neutral-600 sm:text-base">
              <p>
                We curate gifts for people, occasions, and little moments that
                deserve to be remembered. Our approach is intentionally simple:
                beautiful products, thoughtful discovery, and an experience
                that makes giving feel effortless.
              </p>

              <p>
                Lumora exists for the person who wants their gift to say more
                than &ldquo;I bought you something.&rdquo; It should say,
                &ldquo;I know you.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Brand snapshot */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="mb-12">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              The Lumora story
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              What we&apos;re about.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.number}
                className="group flex min-h-[310px] flex-col rounded-[30px] border border-neutral-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-400">
                    {item.number}
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm transition duration-300 group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                    ↗
                  </span>
                </div>

                <div className="mt-auto">
                  <h3 className="text-2xl font-semibold tracking-tight">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-neutral-600">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Press resources */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Press Resources
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Looking for the
              <br />
              Lumora story?
            </h2>

            <p className="mt-6 max-w-lg text-sm leading-7 text-neutral-600 sm:text-base">
              For media enquiries, interviews, brand information, campaign
              opportunities, or collaboration requests, our team would love
              to hear from you.
            </p>
          </div>

          <div className="space-y-3">
            <a
              href="mailto:press@lumora.com"
              className="group flex items-center justify-between rounded-2xl border border-neutral-200 p-6 transition duration-300 hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                  Media enquiries
                </p>

                <p className="mt-2 text-lg font-medium">
                  press@lumora.com
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                ↗
              </span>
            </a>

            <Link
              href="/about"
              className="group flex items-center justify-between rounded-2xl border border-neutral-200 p-6 transition duration-300 hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                  Brand story
                </p>

                <p className="mt-2 text-lg font-medium">
                  Discover Lumora
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                ↗
              </span>
            </Link>

            <Link
              href="/contact"
              className="group flex items-center justify-between rounded-2xl border border-neutral-200 p-6 transition duration-300 hover:border-neutral-300 hover:bg-neutral-50"
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                  Get in touch
                </p>

                <p className="mt-2 text-lg font-medium">
                  Contact our team
                </p>
              </div>

              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 transition group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                ↗
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dark editorial section */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-32">
        <div className="overflow-hidden rounded-[34px] bg-neutral-900 px-7 py-12 text-white sm:px-12 sm:py-16 lg:px-16 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                For editors & creators
              </p>

              <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
                Have a story
                <br />
                in mind?
              </h2>
            </div>

            <div>
              <p className="text-sm leading-7 text-neutral-400 sm:text-base">
                We&apos;re open to thoughtful conversations, editorial
                features, collaborations, and creative opportunities that feel
                right for Lumora.
              </p>

              <a
                href="mailto:press@lumora.com"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
              >
                Start a conversation
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Lumora
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl">
            Thoughtful gifts.
            <br />
            <span className="text-neutral-400">
              A story worth telling.
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
              href="/about"
              className="inline-flex items-center gap-3 rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}