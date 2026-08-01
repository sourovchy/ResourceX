import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Share2,
} from "lucide-react";
import { TiltCard } from "@/components/ui/TiltCard";
import { Background } from "@/components/ui/Background";
import { Reveal } from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";

const FEATURES = [
  {
    title: "Verified campus access",
    description:
      "Every account is securely tied to approved student identity data before entering the marketplace.",
    icon: BadgeCheck,
  },
  {
    title: "Seamless rental workflow",
    description:
      "List items, browse local listings, manage active bookings, and coordinate returns effortlessly.",
    icon: CalendarCheck,
  },
  {
    title: "Trusted protections",
    description:
      "Built-in accountability measures protect your belongings and ensure reliable transactions.",
    icon: ShieldCheck,
  },
];

const FAQS = [
  {
    q: "How do I verify my student account?",
    a: "Register with your official university email and provide your valid Student ID during sign up. Our automated system handles the rest.",
  },
  {
    q: "Is it safe to rent my items?",
    a: "Yes. All users are verified students within your campus network. Every account carries a trust score, and our moderation team reviews reports to protect your items.",
  },
  {
    q: "How are payments handled?",
    a: "Payment is arranged directly with the owner after they approve your request — ResourceX does not process online payments. You coordinate the details at handover.",
  },
  {
    q: "What happens if an item is damaged?",
    a: "If an item is returned damaged, the owner can report the borrower. Our moderation team reviews the evidence, and offenders lose trust score and can be restricted from the platform.",
  },
];

const MARQUEE = [
  "VERIFIED STUDENTS ONLY",
  "ZERO HIDDEN FEES",
  "TRUST SCORES",
  "CAMPUS MODERATION",
  "CAMPUS-LOCAL LISTINGS",
];

const WATERMARKS = [
  { t: "rent()", c: "left-8 top-40 text-[5rem] md:text-[8rem]" },
  { t: "O(1)", c: "right-16 top-28 text-[6rem] md:text-[10rem]" },
  { t: "ACCEPTED", c: "right-1/4 bottom-10 text-[4rem] md:text-[7rem] italic" },
  { t: "share", c: "left-1/4 bottom-24 text-[5rem] md:text-[8rem] italic" },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden bg-background text-textPrimary">
      <Background />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="graph-grid relative overflow-hidden border-b border-borderLight">
        {/* CS watermarks */}
        <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          {WATERMARKS.map((w) => (
            <span
              key={w.t}
              className={`absolute font-black text-primaryDark/[0.04] ${w.c}`}
            >
              {w.t}
            </span>
          ))}
        </div>

        {/* Backdrop glowing orbs */}
        <div className="pointer-events-none absolute left-1/4 top-1/4 -z-10 h-96 w-96 select-none rounded-full bg-primary/5 blur-[150px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-10 h-80 w-80 select-none rounded-full bg-accent/5 blur-[150px]" />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-20">
          {/* Left copy */}
          <div className="space-y-8">
            <Reveal delay={0}>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primaryLight/50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Secure student-to-student resource sharing
              </div>
            </Reveal>

            <div className="space-y-5">
              <Reveal delay={90}>
                <h1 className="text-[clamp(2.75rem,1.9rem+3.2vw,4.25rem)] font-black leading-[1.02] tracking-tight">
                  Rent peer items.{" "}
                  <span className="text-gradient-brand italic">
                    Share safely.
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={180}>
                <p className="max-w-xl text-base leading-7 text-textSecondary">
                  ResourceX is a trusted peer-to-peer marketplace designed
                  exclusively for students. Rent specialised equipment, share
                  everyday essentials, and monetise your idle items within a
                  verified campus network.
                </p>
              </Reveal>
            </div>

            <Reveal delay={270}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/register">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Create account
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="ghost" size="lg">
                    Browse marketplace
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Right visual card */}
          <Reveal delay={200} from="right">
            <div className="animate-float">
              <TiltCard className="space-y-5 rounded-3xl border border-border bg-card p-7 shadow-md">
                <div className="flex items-center gap-4 border-b border-divider pb-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primaryLight text-primary">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-textPrimary">
                      Smart Campus Economy
                    </h3>
                    <p className="text-sm text-textSecondary">
                      Cut down expenses, reduce waste.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border bg-surfaceVariant p-5">
                    <div className="text-3xl font-black text-primary">100%</div>
                    <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-textTertiary">
                      Verified Students
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-surfaceVariant p-5">
                    <div className="text-3xl font-black text-primary">Zero</div>
                    <div className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-textTertiary">
                      Hidden Fees
                    </div>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-primary/20 bg-primaryLight/50 p-5">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                      How it works
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-textPrimary">
                      Verify identity → List or find resources → Securely book
                      online
                    </p>
                  </div>
                </div>
              </TiltCard>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-borderLight bg-surfaceVariant py-3.5">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
              {MARQUEE.map((item) => (
                <span
                  key={item}
                  className="flex items-center text-[11px] font-bold uppercase tracking-[0.12em] text-primary"
                >
                  <span className="mx-6 text-primaryMuted">✦</span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────── */}
      <section id="features" className="relative scroll-mt-24 border-b border-borderLight py-20">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-textPrimary md:text-4xl">
              Built for{" "}
              <span className="text-gradient-brand italic">campus life.</span>
            </h2>
            <p className="mt-3 text-sm text-textSecondary">
              Everything you need, nothing you don&apos;t.
            </p>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ title, description, icon: Icon }, i) => (
              <Reveal key={title} delay={i * 110}>
                <TiltCard className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primaryLight text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-textPrimary">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-textSecondary">
                    {description}
                  </p>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="relative scroll-mt-24 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-textPrimary md:text-4xl">
              Frequently asked{" "}
              <span className="text-gradient-brand italic">questions.</span>
            </h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 80}>
                <TiltCard
                  maxTilt={1}
                  hoverScale={1.01}
                  className="group rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md"
                >
                  <details className="[&_summary::-webkit-details-marker]:hidden">
                    <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-6 py-4 text-sm font-bold text-textPrimary">
                      <span className="min-w-0 break-words">{faq.q}</span>
                      <svg
                        className="h-5 w-5 shrink-0 text-textTertiary transition-transform duration-200 group-open:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 9l6 6 6-6"
                        />
                      </svg>
                    </summary>
                    <p className="border-t border-divider px-6 pb-5 pt-4 text-sm leading-relaxed text-textSecondary">
                      {faq.a}
                    </p>
                  </details>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────── */}
      <section className="relative py-20">
        <div className="mx-auto max-w-3xl px-6">
          <Reveal>
            <TiltCard
              maxTilt={1}
              hoverScale={1.01}
              className="space-y-6 rounded-3xl border border-border bg-card p-10 text-center shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-lg md:p-14"
            >
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-textPrimary md:text-5xl">
                Ready to join your{" "}
                <span className="text-gradient-brand italic pr-[0.2em] box-decoration-clone">campus network?</span>
              </h2>
              <p className="mx-auto max-w-xl text-sm leading-6 text-textSecondary">
                Create a free account in under two minutes and start renting or
                listing today.
              </p>
              <div className="pt-2">
                <Link href="/auth/register">
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="shadow-sm hover:shadow-lg hover:shadow-primary/30"
                  >
                    Get started for free
                  </Button>
                </Link>
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
