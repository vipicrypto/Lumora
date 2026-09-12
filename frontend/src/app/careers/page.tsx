import Link from "next/link";

export const dynamic = "force-static";

const values = [
  {
    number: "01",
    title: "Stay curious",
    description:
      "Ask better questions, explore new ideas, and never stop looking for a more thoughtful way to do things.",
  },
  {
    number: "02",
    title: "Care deeply",
    description:
      "We care about the details, the experience, the people we work with, and the people we build for.",
  },
  {
    number: "03",
    title: "Build together",
    description:
      "Great things rarely happen alone. We believe in sharing ideas, giving honest feedback, and growing together.",
  },
];

export default function CareersPage() {
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
              Careers at Lumora
            </div>

            <h1 className="text-5xl font-semibold leading-[0.94] tracking-[-0.05em] sm:text-7xl lg:text-8xl">
              Build something
              <br />
              <span className="text-neutral-400">thoughtful.</span>
            </h1>

            <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-end">
              <p className="max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                We&apos;re building a brand around the art of giving. If you
                love good ideas, meaningful experiences, and work that people
                genuinely care about, you might feel at home here.
              </p>

              <div className="lg:text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
                  Come build with us
                </p>

                <a
                  href="mailto:careers@lumora.com"
                  className="mt-2 inline-block text-lg font-medium underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
                >
                  careers@lumora.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[0.55fr_1.45fr] lg:gap-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Life at Lumora
            </p>

            <h2 className="mt-4 max-w-sm text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
              Work with purpose.
            </h2>
          </div>

          <div className="max-w-3xl">
            <p className="text-2xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl sm:leading-[1.15]">
              We&apos;re not just building another store. We&apos;re building
              an experience around one of life&apos;s simplest human gestures:
              giving.
            </p>

            <div className="mt-8 space-y-5 text-sm leading-7 text-neutral-600 sm:text-base">
              <p>
                That means there&apos;s room here for people who care about
                design, technology, storytelling, operations, products, and
                above all, the people using what we build.
              </p>

              <p>
                We value thoughtful work over unnecessary complexity and
                curiosity over having all the answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                The way we work
              </p>

              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.04em] sm:text-6xl">
                Bring your thinking.
                <br />
                <span className="text-neutral-400">
                  Bring your perspective.
                </span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-neutral-500">
              We believe the strongest teams are made from different
              perspectives, shared ownership, and a genuine desire to make
              something better.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            What matters here
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            A few things we believe in.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <article
              key={value.number}
              className="group flex min-h-[330px] flex-col rounded-[30px] border border-neutral-200 p-7 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_24px_60px_rgba(0,0,0,0.06)] sm:p-9"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-400">
                  {value.number}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm transition duration-300 group-hover:rotate-45 group-hover:bg-neutral-900 group-hover:text-white">
                  ↗
                </span>
              </div>

              <div className="mt-auto">
                <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {value.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
                  {value.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* What you can expect */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-32">
        <div className="overflow-hidden rounded-[34px] bg-neutral-900 text-white">
          <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
            <div className="flex min-h-[460px] flex-col justify-between border-b border-white/10 p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-14">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                  At Lumora
                </p>

                <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
                  Bring
                  <br />
                  curiosity.
                </h2>
              </div>

              <p className="mt-10 max-w-sm text-sm leading-7 text-neutral-400">
                We want people who are excited to learn, contribute, question,
                experiment, and take ownership.
              </p>
            </div>

            <div className="p-8 sm:p-12 lg:p-14">
              <div className="space-y-9">
                <div className="border-b border-white/10 pb-9">
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                    Ownership
                  </p>

                  <h3 className="mt-3 text-2xl font-medium">
                    Make it yours.
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-400">
                    We value people who take responsibility for their work and
                    care about the outcome, not just the task.
                  </p>
                </div>

                <div className="border-b border-white/10 pb-9">
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                    Creativity
                  </p>

                  <h3 className="mt-3 text-2xl font-medium">
                    Think beyond the obvious.
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-400">
                    Good ideas can come from anywhere. We make space for
                    curiosity, experimentation, and fresh perspectives.
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-neutral-500">
                    Growth
                  </p>

                  <h3 className="mt-3 text-2xl font-medium">
                    Keep getting better.
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-400">
                    We&apos;re building something that will evolve. We expect
                    ourselves to learn, adapt, and improve along the way.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open positions */}
      <section className="border-y border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
                Open Positions
              </p>

              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Your next chapter could start here.
              </h2>
            </div>

            <div>
              <div className="rounded-[28px] border border-neutral-200 bg-neutral-50 p-7 sm:p-9">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <span className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-neutral-500">
                      Currently
                    </span>

                    <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                      Nothing open right now.
                    </h3>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-neutral-600">
                      We&apos;re growing thoughtfully rather than rushing to
                      fill seats. If you believe you could bring something
                      valuable to Lumora, we&apos;d still love to hear from
                      you.
                    </p>
                  </div>

                  <a
                    href="mailto:careers@lumora.com"
                    className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-neutral-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Say hello
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-32">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Come build with us
          </p>

          <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
            Good work feels
            <br />
            <span className="text-neutral-400">
              better when it means something.
            </span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
            If that sounds like the kind of place you&apos;d like to be part
            of, introduce yourself.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:careers@lumora.com"
              className="inline-flex items-center gap-3 rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              careers@lumora.com
              <span>→</span>
            </a>

            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              About Lumora
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}