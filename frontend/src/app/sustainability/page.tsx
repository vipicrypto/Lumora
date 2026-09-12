import Link from "next/link";

export const dynamic = "force-static";

const commitments = [
  {
    number: "01",
    title: "Thoughtful curation",
    description:
      "We believe sustainability begins with choosing thoughtfully. We focus on products that feel meaningful, useful, and worth giving.",
  },
  {
    number: "02",
    title: "Considered packaging",
    description:
      "The experience of receiving a gift matters. We aim to make our packaging feel beautiful while being mindful about unnecessary materials.",
  },
  {
    number: "03",
    title: "Less, not more",
    description:
      "We don't believe in creating more for the sake of more. A carefully chosen gift can be more meaningful than a collection of things.",
  },
  {
    number: "04",
    title: "Always improving",
    description:
      "There is no perfect finish line. We continue looking for better ways to make our products, packaging, and processes more considered.",
  },
];

export default function SustainabilityPage() {
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
              Our Approach
            </div>

            <h1 className="text-5xl font-semibold leading-[0.96] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Better choices,
              <br />
              <span className="text-neutral-400">
                made thoughtfully.
              </span>
            </h1>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
              <p className="max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                Sustainability is not a label we want to put on things.
                It&apos;s a way of thinking about what we choose, how we
                package it, and what we can do better tomorrow.
              </p>

              <div className="lg:text-right">
                <p className="text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
                  01
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-400">
                  A work in progress
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Our Philosophy
            </p>
          </div>

          <div>
            <h2 className="max-w-4xl text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-5xl sm:leading-[1.12]">
              We want beautiful things to have a thoughtful footprint too.
            </h2>

            <div className="mt-8 max-w-2xl space-y-5 text-sm leading-7 text-neutral-600 sm:text-base">
              <p>
                Every product we choose becomes part of a bigger story. That
                means thinking beyond how something looks and considering why
                it exists, how it is presented, and how it can be enjoyed for
                longer.
              </p>

              <p>
                We know that meaningful progress doesn&apos;t happen through
                one perfect decision. It comes from many smaller, better
                decisions made consistently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Large statement */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
          <div className="flex flex-col justify-between gap-12 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                The idea
              </p>

              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
                Give with meaning.
                <br />
                <span className="text-neutral-400">
                  Choose with intention.
                </span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-neutral-500">
              We&apos;re building Lumora around a more considered approach to
              gifting — one where thought matters more than excess.
            </p>
          </div>
        </div>
      </section>

      {/* Commitments */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            What we&apos;re focusing on
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Small decisions.
            <br />
            Meaningful direction.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {commitments.map((item) => (
            <article
              key={item.number}
              className="group relative min-h-[300px] overflow-hidden rounded-[30px] border border-neutral-200 p-7 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:p-9"
            >
              <div className="absolute right-7 top-7 text-6xl font-semibold tracking-[-0.06em] text-neutral-100 transition duration-300 group-hover:text-neutral-200 sm:right-9 sm:top-9">
                {item.number}
              </div>

              <div className="relative flex h-full flex-col">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-sm transition duration-300 group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                  ↗
                </div>

                <div className="mt-auto max-w-lg">
                  <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Packaging / conscious choices */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-32">
        <div className="overflow-hidden rounded-[34px] bg-neutral-900 text-white">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex min-h-[420px] flex-col justify-between border-b border-white/10 p-8 sm:p-12 lg:border-b-0 lg:border-r">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                  Beyond the product
                </p>

                <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                  The little
                  <br />
                  details matter.
                </h2>
              </div>

              <p className="mt-10 max-w-sm text-sm leading-7 text-neutral-400">
                From presentation to delivery, we believe the experience
                surrounding a gift should feel as intentional as the gift
                itself.
              </p>
            </div>

            <div className="p-8 sm:p-12">
              <div className="space-y-10">
                <div className="border-b border-white/10 pb-10">
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                    Packaging
                  </p>

                  <h3 className="mt-3 text-2xl font-medium">
                    Beautiful without unnecessary excess.
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-neutral-400">
                    We aim to keep packaging considered and purposeful, while
                    continuing to look for opportunities to reduce unnecessary
                    materials.
                  </p>
                </div>

                <div className="border-b border-white/10 pb-10">
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                    Curation
                  </p>

                  <h3 className="mt-3 text-2xl font-medium">
                    Fewer things. Better reasons to give them.
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-neutral-400">
                    Thoughtful gifting starts with choosing something that has
                    a reason to exist — something someone will genuinely enjoy.
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                    Progress
                  </p>

                  <h3 className="mt-3 text-2xl font-medium">
                    Better is a direction, not a destination.
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-neutral-400">
                    As Lumora grows, we&apos;ll keep questioning our choices
                    and looking for more thoughtful ways to do things.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Our commitment
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            We may not have
            <br />
            <span className="text-neutral-400">all the answers yet.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
            But we&apos;re committed to asking better questions, making more
            thoughtful choices, and leaving room to improve.
          </p>

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
              About Lumora
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}