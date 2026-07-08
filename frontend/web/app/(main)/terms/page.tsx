import React from "react";
import { TiltCard } from "@/components/ui/TiltCard";

export default function TermsAndConditions() {
  return (
    <main className="bg-background min-h-screen py-12 text-textPrimary sm:py-20 graph-grid">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Eyebrow & Page Heading */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl font-normal tracking-[-1.5px] text-textPrimary">
            Terms &amp; <span className="text-primary italic">Conditions.</span>
          </h1>
          <p className="mt-3 text-[10px] font-bold tracking-[1.5px] text-textTertiary uppercase">
            Last updated: May 2026
          </p>
        </div>

        <TiltCard
          maxTilt={3}
          glare={true}
          className="space-y-8 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
        >
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              1. <span className="text-primary italic">Introduction.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              Welcome to ResourceX. By registering an account or using our
              platform, you agree to be bound by these Terms and Conditions.
              Please read them carefully.
            </p>
          </section>

          <hr className="border-t border-divider" />

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              2. Accounts &amp;{" "}
              <span className="text-primary italic">Verification.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              Users must provide valid university credentials and a Student ID
              to access the platform. We reserve the right to suspend or
              terminate accounts that provide false information or violate our
              community guidelines.
            </p>
          </section>

          <hr className="border-t border-divider" />

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              3. Rental <span className="text-primary italic">Agreements.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              ResourceX facilitates peer-to-peer rentals. The platform is not
              liable for damages, lost items, or disagreements between users,
              though we provide a reporting and moderation system and a trust
              score system to mitigate these issues.
            </p>
          </section>
        </TiltCard>
      </div>
    </main>
  );
}
