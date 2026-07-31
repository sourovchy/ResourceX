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
            Last updated: July 2026
          </p>
        </div>

        <TiltCard
          maxTilt={1}
          className="space-y-8 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
        >
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              1. Platform <span className="text-primary italic">Purpose.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              ResourceX serves as an intermediary platform where students can coordinate resource sharing. We do not own, inspect, or manage the items listed on the platform. ResourceX acts solely as a platform that connects members of the university community. All borrowing and lending exchanges are conducted directly between users at their own risk.
            </p>
          </section>

          <hr className="border-t border-divider" />

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              2. Eligibility &amp;{" "}
              <span className="text-primary italic">Verification.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              To register for ResourceX, you must be an active student or staff member at a participating university. You are required to register using your official university email address and verify your identity by uploading a valid student ID card. Accounts are manually reviewed by administrators to ensure community safety. We reserve the right to approve, deny, or restrict access to any registration request at our discretion.
            </p>
          </section>

          <hr className="border-t border-divider" />

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              3. Account <span className="text-primary italic">Responsibilities.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              You are responsible for keeping your login credentials confidential and for all activity that occurs under your account. Your account is for your personal use only and should not be shared.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 4. Listings and Item Ownership */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              4. Listings &amp; <span className="text-primary italic">Ownership.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              Lenders retain full ownership of their listed items. Lenders must provide accurate descriptions, conditions, and rates for their listings. Borrowers receive a temporary right to use the item for the agreed duration and must return it in the same condition. Listing illegal, hazardous, or university-prohibited items is strictly forbidden.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 5. Swaps and Booking System */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              5. Swaps &amp; <span className="text-primary italic">Booking.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              All requests, approvals, and returns must be routed through our booking system. When a booking is approved, any conflicting requests for the same item during that period are automatically declined. Both parties are expected to communicate and coordinate exchanges in a timely and respectful manner. The actual exchange of resources is coordinated directly between users.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 6. Reviews and Ratings */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              6. Reviews &amp; <span className="text-primary italic">Ratings.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              After a completed swap, borrowers can rate their experience and leave a review. Reviews must be honest, respectful, and reflect the actual transaction. We do not allow self-reviews or rating manipulation. We reserve the right to remove reviews that violate our community standards.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 7. Trust Standing and Community Guidelines */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              7. Standing &amp; <span className="text-primary italic">Guidelines.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              To keep our network safe, ResourceX uses a standing system. Your account standing adjusts dynamically based on your activity, including successful swaps, on-time returns, booking cancellations, and reports. Maintaining good standing keeps your account fully active. If your standing drops due to negative behavior, you may experience restrictions, such as the inability to create new listings or initiate requests. Severe or repeated violations can lead to suspension.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 8. Block System */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              8. Block <span className="text-primary italic">System.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              You can choose to block another user. Blocking another user prevents both parties from communicating through the platform.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 9. Reporting and Moderation */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              9. Reporting &amp; <span className="text-primary italic">Moderation.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              If you see a listing or behavior that violates these terms, you can report it. Our team reviews all reports. False reporting, harassment, or other violations of these terms may result in warnings, restrictions, suspension, or permanent account termination.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 10. Suspension and Account Deletion */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              10. Suspension &amp; <span className="text-primary italic">Deletion.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              We reserve the right to temporarily suspend or permanently terminate accounts for policy violations or low standing. We may retain certain records for security, moderation, administrative, and legal purposes before permanently deleting an account.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 11. Intellectual Property */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              11. Intellectual <span className="text-primary italic">Property.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              All code, designs, content, logos, and layouts on ResourceX are owned by us or our partners. You may not copy, modify, or distribute any part of the platform without our permission.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 12. Limitation of Liability */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              12. Limitation of <span className="text-primary italic">Liability.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              To the fullest extent permitted by applicable law, ResourceX is not responsible for lost, stolen, or damaged items, personal injury, or financial loss arising from transactions, communications, or interactions coordinated through the platform.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 13. Changes to These Terms */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              13. Changes to <span className="text-primary italic">Terms.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              We may update these terms as our service changes. If we make major updates, we will notify you through the platform or via email. Continuing to use ResourceX after updates are posted indicates your acceptance of the new terms.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 14. Contact Us */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              14. Contact <span className="text-primary italic">Us.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              If you have any questions or need help with your account, please reach out to our support team.
            </p>
          </section>
        </TiltCard>
      </div>
    </main>
  );
}
