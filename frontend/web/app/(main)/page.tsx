import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  Share2,
} from "lucide-react";

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
    a: "Yes. All users are verified students within your campus network. We track trust scores, manage automated deposits, and offer a dispute resolution centre to protect your items.",
  },
  {
    q: "How are payments handled?",
    a: "Payments are securely processed through our integrated payment gateway. We hold the rental fee in escrow until the item is successfully returned.",
  },
  {
    q: "What happens if an item is damaged?",
    a: "If an item is returned damaged, the owner can open a dispute. Our moderation team reviews the evidence and can penalise the borrower or deduct from their deposit.",
  },
];

export default function LandingPage() {
  return (
    <main className="bg-background text-textPrimary overflow-x-hidden">
      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-borderLight bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary text-onPrimary flex items-center justify-center font-black text-sm tracking-tight transition-transform group-hover:scale-105">
              RX
            </div>
            <span className="font-black text-lg tracking-tight text-textPrimary">
              ResourceX
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-semibold text-textSecondary transition hover:bg-surfaceVariant hover:text-textPrimary"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-onPrimary transition hover:bg-primaryDark active:scale-95"
            >
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
        {/* Left copy */}
        <div className="page-enter space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-borderLight bg-surface px-3.5 py-1.5 text-xs font-semibold text-textSecondary shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            Secure student-to-student resource sharing
          </div>

          <div className="space-y-5">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Rent peer items.{" "}
              <span className="text-primary">Share safely.</span>
            </h1>
            <p className="max-w-xl text-base text-textSecondary leading-7">
              ResourceX is a trusted peer-to-peer marketplace designed
              exclusively for students. Rent specialised equipment, share
              everyday essentials, and monetise your idle items within a
              verified campus network.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-onPrimary transition hover:bg-primaryDark active:scale-95"
            >
              Create account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-lg border border-borderLight bg-surface px-6 py-3 text-sm font-bold text-textPrimary transition hover:bg-surfaceVariant active:scale-95"
            >
              Browse marketplace
            </Link>
          </div>
        </div>

        {/* Right visual card */}
        <div className="animate-slide-left bg-surface border border-borderLight rounded-2xl p-7 shadow-sm space-y-5">
          <div className="flex items-center gap-4 border-b border-divider pb-5">
            <div className="w-11 h-11 rounded-xl bg-primaryLight text-primary flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-textPrimary">
                Smart Campus Economy
              </h3>
              <p className="text-sm text-textSecondary">
                Cut down expenses, reduce waste.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surfaceVariant border border-borderLight p-5">
              <div className="text-3xl font-black text-primary">100%</div>
              <div className="text-[11px] font-semibold text-textSecondary mt-1.5 uppercase tracking-wider">
                Verified Students
              </div>
            </div>
            <div className="rounded-xl bg-surfaceVariant border border-borderLight p-5">
              <div className="text-3xl font-black text-success">Zero</div>
              <div className="text-[11px] font-semibold text-textSecondary mt-1.5 uppercase tracking-wider">
                Hidden Fees
              </div>
            </div>
            <div className="col-span-2 rounded-xl bg-primaryLight/40 border border-primaryLight p-5">
              <div className="text-[11px] font-bold uppercase text-primary tracking-wider mb-2">
                How it works
              </div>
              <p className="text-sm font-medium text-textPrimary leading-relaxed">
                Verify identity → List or find resources → Securely book online
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="border-t border-borderLight bg-surfaceVariant/40 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 text-center animate-fade-in">
            <h2 className="text-2xl font-black tracking-tight text-textPrimary">
              Built for campus life
            </h2>
            <p className="mt-2 text-sm text-textSecondary">
              Everything you need, nothing you don't.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 stagger-children">
            {FEATURES.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="group rounded-xl border border-borderLight bg-surface p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="w-10 h-10 rounded-lg bg-primaryLight/60 flex items-center justify-center border border-primaryLight">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="mt-5 font-bold text-base text-textPrimary">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-textSecondary">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-10 text-center animate-fade-in">
            <h2 className="text-2xl font-black tracking-tight text-textPrimary">
              Frequently asked questions
            </h2>
            <p className="mt-2 text-sm text-textSecondary">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-3 stagger-children">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-borderLight bg-surface [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer select-none items-center justify-between gap-4 px-6 py-4 font-semibold text-sm text-textPrimary">
                  {faq.q}
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
                <p className="px-6 pb-5 text-sm leading-relaxed text-textSecondary border-t border-divider pt-4">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────── */}
      <section className="border-t border-borderLight bg-surface py-16">
        <div className="mx-auto max-w-2xl px-6 text-center animate-fade-in space-y-6">
          <h2 className="text-2xl font-black tracking-tight text-textPrimary">
            Ready to join your campus network?
          </h2>
          <p className="text-sm text-textSecondary leading-6">
            Create a free account in under two minutes and start renting or
            listing today.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-onPrimary transition hover:bg-primaryDark active:scale-95"
          >
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
