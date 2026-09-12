import Link from "next/link";

export const dynamic = "force-static";

const values = [
  {
    number: "01",
    title: "Thoughtful by design",
    description:
      "We believe the best gifts are the ones that feel personal. Every part of Lumora is built around that simple idea.",
  },
  {
    number: "02",
    title: "Less, but better",
    description:
      "We focus on pieces worth discovering rather than overwhelming you with endless choices.",
  },
  {
    number: "03",
    title: "Made for moments",
    description:
      "Birthdays, celebrations, thank-yous, little surprises — Lumora exists for the moments people remember.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-neutral-200">
        <div className="absolute -right-40 -top-40 h-[420px] w-[420px] rounded-full bg-neutral-100 blur-3xl" />
        <div className="absolute -bottom-48 -left-40 h-[420px] w-[420px] rounded-full bg-neutral-50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <div className="max-w-5xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-neutral-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-900" />
              About Lumora
            </div>

            <h1 className="text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-7xl lg:text-8xl">
              Gifts that say
              <br />
              <span className="text-neutral-400">
                &ldquo;I thought of you.&rdquo;
              </span>
            </h1>

            <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
                Lumora is a place for thoughtful gifting — bringing together
                beautiful things, meaningful moments, and the people who make
                them matter.
              </p>

              <Link
                href="/categories"
                className="inline-flex w-fit items-center gap-3 rounded-full bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Explore Lumora
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              Our Story
            </p>

            <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
              It started with a simple thought.
            </h2>
          </div>

          <div className="max-w-2xl">
            <p className="text-xl leading-9 tracking-tight text-neutral-800 sm:text-2xl sm:leading-10">
              Finding a meaningful gift shouldn&apos;t feel complicated.
            </p>

            <div className="mt-7 space-y-5 text-sm leading-7 text-neutral-600 sm:text-base">
              <p>
                There are moments when you want to give someone something that
                feels just right. Not simply something expensive or popular,
                but something that makes them feel seen.
              </p>

              <p>
                Lumora was created around that feeling. We bring together
                thoughtfully selected gifts so you can spend less time
                searching and more time thinking about the person you&apos;re
                giving to.
              </p>

              <p>
                From everyday gestures to unforgettable celebrations, we want
                Lumora to be the place you come to when the gift matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:items-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
              What we believe
            </p>

            <blockquote className="text-3xl font-medium leading-tight tracking-[-0.03em] sm:text-5xl">
              &ldquo;The best gifts aren&apos;t just things. They carry a
              little piece of thought, feeling, and connection.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Our Values
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
            What makes Lumora, Lumora.
          </h2>

          <p className="mt-5 text-base leading-7 text-neutral-600">
            We keep things simple, intentional, and centred around the
            experience of giving.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.number}
              className="group flex min-h-[310px] flex-col rounded-[28px] border border-neutral-200 p-7 transition duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] sm:p-8"
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
                <h3 className="text-2xl font-semibold tracking-tight">
                  {value.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-neutral-600">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="mx-auto max-w-6xl px-6 pb-20 sm:pb-28">
        <div className="overflow-hidden rounded-[32px] bg-neutral-900 px-7 py-12 text-white sm:px-12 sm:py-16">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                The Lumora Experience
              </p>

              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.03em] sm:text-5xl">
                From choosing
                <br />
                to giving.
              </h2>
            </div>

            <div>
              <p className="text-base leading-8 text-neutral-300">
                We want every step to feel considered — discovering something
                special, choosing it for someone you care about, and finally
                seeing their reaction.
              </p>

              <Link
                href="/categories"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200"
              >
                Find a gift
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="border-t border-neutral-200">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Welcome to Lumora
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-6xl">
            Make the moment
            <br />
            <span className="text-neutral-400">a little more special.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-neutral-600">
            Because sometimes, the smallest gesture can say the most.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/categories"
              className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Explore Gifts
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-neutral-300 px-7 py-3.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}