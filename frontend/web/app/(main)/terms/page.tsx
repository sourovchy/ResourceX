import React from "react";

export default function TermsAndConditions() {
    return (
        <main className="bg-background py-8 text-textPrimary sm:py-12">
            <div className="mx-auto max-w-3xl space-y-6 px-4 sm:space-y-8 sm:px-6">
                <div className="space-y-5 rounded-2xl border border-borderLight bg-surface p-5 shadow-sm sm:space-y-6 sm:p-8">
                    <h1 className="text-2xl font-black leading-tight sm:text-3xl">Terms and Conditions</h1>
                    <p className="text-sm text-textSecondary sm:text-base">Last updated: May 2026</p>
                    
                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-lg font-bold sm:text-xl">1. Introduction</h2>
                        <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
                            Welcome to ResourceX. By registering an account or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
                        </p>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-lg font-bold sm:text-xl">2. User Accounts and Verification</h2>
                        <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
                            Users must provide valid university credentials and a Student ID to access the platform. We reserve the right to suspend or terminate accounts that provide false information or violate our community guidelines.
                        </p>
                    </section>

                    <section className="space-y-3 sm:space-y-4">
                        <h2 className="text-lg font-bold sm:text-xl">3. Rental Agreements</h2>
                        <p className="text-sm leading-relaxed text-textSecondary sm:text-base">
                            ResourceX facilitates peer-to-peer rentals. The platform is not liable for damages, lost items, or disputes, though we provide a dispute resolution center and trust score system to mitigate these issues.
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
