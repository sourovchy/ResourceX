import React from "react";
import { TiltCard } from "@/components/ui/TiltCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ResourceX",
  description:
    "Learn how ResourceX collects, uses, and protects your personal information on our student-to-student rental marketplace.",
};

export default function PrivacyPolicy() {
  return (
    <main className="bg-background min-h-screen py-12 text-textPrimary sm:py-20 graph-grid">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Page Heading */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-5xl font-normal tracking-[-1.5px] text-textPrimary">
            Privacy <span className="text-primary italic">Policy.</span>
          </h1>
          <p className="mt-3 text-[10px] font-bold tracking-[1.5px] text-textTertiary uppercase">
            Last updated: June 2026
          </p>
        </div>

        <TiltCard
          maxTilt={1}
          className="space-y-8 rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
        >
          {/* 1. Introduction */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              1. <span className="text-primary italic">Introduction.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              ResourceX (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
              &ldquo;us&rdquo;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our student-to-student
              campus rental marketplace platform.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 2. Information We Collect */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              2. Information We{" "}
              <span className="text-primary italic">Collect.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              We collect information you provide directly, including:
            </p>
            <ul className="list-none space-y-2 text-sm text-textSecondary sm:text-base">
              {[
                "Account registration data: name, university email, student ID, department, and password.",
                "Profile information: avatar image and contact preferences.",
                "Listing content: item titles, descriptions, images, pricing, and availability.",
                "Booking data: rental dates, transaction history, and status updates.",
                "Communications: messages exchanged with other users via our inbox feature.",
                "Reviews and ratings you submit for completed rentals.",
              ].map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-t border-divider" />

          {/* 3. How We Use Your Information */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              3. How We Use Your{" "}
              <span className="text-primary italic">Information.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              We use your information to:
            </p>
            <ul className="list-none space-y-2 text-sm text-textSecondary sm:text-base">
              {[
                "Verify your student identity and maintain account security.",
                "Facilitate item listings, rental bookings, and peer-to-peer transactions.",
                "Operate our trust score and community reputation system.",
                "Review reports submitted through our moderation system.",
                "Send transactional notifications about bookings and account activity.",
                "Improve our platform features and user experience.",
              ].map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-t border-divider" />

          {/* 4. Data Sharing */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              4. Data{" "}
              <span className="text-primary italic">Sharing.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              We do not sell, trade, or rent your personal information to third
              parties. Your profile information (name, listings, and public
              reviews) is visible to other verified students on the platform.
              We may share data with:
            </p>
            <ul className="list-none space-y-2 text-sm text-textSecondary sm:text-base">
              {[
                "Platform administrators for moderation and dispute resolution purposes.",
                "Service providers who assist us in operating the platform (e.g., hosting and analytics), under strict confidentiality obligations.",
                "Law enforcement or regulatory bodies if required by applicable law.",
              ].map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <hr className="border-t border-divider" />

          {/* 5. Data Retention */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              5. Data{" "}
              <span className="text-primary italic">Retention.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              We retain your personal data for as long as your account is
              active or as needed to provide our services. You may request
              account deletion at any time by contacting our support team.
              Certain records (such as completed booking history) may be
              retained for up to 3 years for dispute resolution and audit
              purposes.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 6. Security */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              6.{" "}
              <span className="text-primary italic">Security.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              We implement industry-standard security measures including
              encrypted data transmission (HTTPS), hashed password storage, and
              role-based access controls. While we strive to protect your
              personal information, no method of transmission over the internet
              is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 7. Your Rights */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              7. Your{" "}
              <span className="text-primary italic">Rights.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              You have the right to access, correct, or delete your personal
              data. You may update your profile information at any time from
              your account settings. For data deletion requests or other privacy
              concerns, contact us at{" "}
              <a
                href="mailto:[REDACTED_MAIL_USERNAME]"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                [REDACTED_MAIL_USERNAME]
              </a>
              .
            </p>
          </section>

          <hr className="border-t border-divider" />

          {/* 8. Changes */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-normal text-textPrimary">
              8. Changes to This{" "}
              <span className="text-primary italic">Policy.</span>
            </h2>
            <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
              We may update this Privacy Policy from time to time. We will
              notify you of any significant changes by posting a notice on the
              platform or by emailing your registered address. Continued use of
              ResourceX after updates constitutes your acceptance of the revised
              policy.
            </p>
          </section>
        </TiltCard>
      </div>
    </main>
  );
}
