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

export default function LandingPage() {
	return (
		<main className="bg-background text-textPrimary">
			{/* Navigation Header */}
			<section className="border-b border-borderLight bg-surface">
				<div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
					<Link href="/" className="flex items-center gap-3">
						<div className="w-9 h-9 rounded-lg bg-primary text-onPrimary flex items-center justify-center font-black">
							RX
						</div>
						<span className="font-black text-xl tracking-tight">ResourceX</span>
					</Link>
					<div className="flex items-center gap-4">
						<Link
							href="/auth/login"
							className="text-sm font-semibold text-textSecondary hover:text-primary transition">
							Login
						</Link>
						<Link
							href="/auth/register"
							className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-onPrimary hover:bg-primaryDark transition">
							Get started <ArrowRight className="w-4 h-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* Hero Section */}
			<section className="mx-auto max-w-7xl px-6 py-16 lg:py-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
				<div className="space-y-7">
					<div className="inline-flex items-center gap-2 rounded-full border border-borderLight bg-surface px-3 py-1 text-sm font-semibold text-textSecondary">
						<Sparkles className="w-4 h-4 text-primary" />
						Secure student-to-student resource sharing
					</div>
					<div className="space-y-5">
						<h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
							Rent peer items. <br />
							<span className="text-primary">Share safely.</span>
						</h1>
						<p className="max-w-2xl text-lg text-textSecondary leading-8">
							ResourceX is a trusted peer-to-peer marketplace designed
							exclusively for students. Rent specialized equipment, share
							everyday essentials, and monetize your idle items within a
							verified campus network.
						</p>
					</div>
					<div className="flex flex-col sm:flex-row gap-3">
						<Link
							href="/auth/register"
							className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-bold text-onPrimary hover:bg-primaryDark transition">
							Create account <ArrowRight className="w-4 h-4" />
						</Link>
						<Link
							href="/auth/login"
							className="inline-flex items-center justify-center rounded-lg border border-borderLight bg-surface px-6 py-3.5 font-bold text-textPrimary hover:bg-surfaceVariant transition">
							Browse marketplace
						</Link>
					</div>
				</div>

				{/* Hero Feature Visual Block */}
				<div className="bg-surface border border-borderLight rounded-2xl p-8 shadow-sm space-y-6">
					<div className="flex items-center gap-4 border-b border-borderLight pb-4">
						<div className="w-12 h-12 rounded-xl bg-primaryLight text-primary flex items-center justify-center">
							<Share2 className="w-6 h-6" />
						</div>
						<div>
							<h3 className="font-bold text-lg">Smart Campus Economy</h3>
							<p className="text-sm text-textSecondary">
								Cut down expenses, reduce waste.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="rounded-xl bg-surfaceVariant p-5 border border-borderLight">
							<div className="text-3xl font-black text-primary">100%</div>
							<div className="text-xs font-semibold text-textSecondary mt-2 uppercase tracking-wider">
								Verified Students
							</div>
						</div>
						<div className="rounded-xl bg-surfaceVariant p-5 border border-borderLight">
							<div className="text-3xl font-black text-success">Zero</div>
							<div className="text-xs font-semibold text-textSecondary mt-2 uppercase tracking-wider">
								Hidden Fees
							</div>
						</div>
						<div className="col-span-2 rounded-xl bg-primaryLight/30 p-5 border border-primaryLight/50">
							<div className="text-xs font-bold uppercase text-primary tracking-wide">
								How it works
							</div>
							<div className="mt-2 text-md font-medium text-textPrimary">
								Verify your identity → List or find resources → Securely book
								online
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Grid */}
			<section className="mx-auto max-w-7xl px-6 pb-24 grid md:grid-cols-3 gap-6">
				{FEATURES.map(({ title, description, icon: Icon }) => (
					<div
						key={title}
						className="rounded-xl border border-borderLight bg-surface p-6 hover:shadow-md transition">
						<div className="w-10 h-10 rounded-lg bg-surfaceVariant flex items-center justify-center border border-borderLight">
							<Icon className="w-5 h-5 text-primary" />
						</div>
						<h2 className="mt-5 font-bold text-lg text-textPrimary">{title}</h2>
						<p className="mt-2 text-sm leading-6 text-textSecondary">
							{description}
						</p>
					</div>
				))}
			</section>
			{/* FAQ Section */}
			<section className="border-t border-borderLight bg-surfaceVariant/30 py-24">
				<div className="mx-auto max-w-4xl px-6">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-black text-textPrimary tracking-tight">
							Frequently Asked Questions
						</h2>
						<p className="mt-4 text-textSecondary text-lg">
							Got questions? We've got answers.
						</p>
					</div>
					<div className="space-y-4">
						{[
							{
								q: "How do I verify my student account?",
								a: "To verify your account, register with your official university email address and provide your valid Student ID during sign up. Our automated system will handle the rest.",
							},
							{
								q: "Is it safe to rent my items?",
								a: "Yes. All users are verified students within your campus network. We track trust scores, manage automated deposits, and offer a dispute resolution center to protect your items.",
							},
							{
								q: "How are payments handled?",
								a: "Payments are securely processed through our integrated payment gateway. We hold the rental fee in escrow until the item is successfully returned.",
							},
							{
								q: "What happens if an item is damaged?",
								a: "If an item is returned damaged, the owner can open a dispute. Our moderation team will review the evidence and can penalize the borrower or deduct from their deposit.",
							},
						].map((faq, i) => (
							<details
								key={i}
								className="group rounded-xl border border-borderLight bg-surface p-6 [&_summary::-webkit-details-marker]:hidden">
								<summary className="flex cursor-pointer items-center justify-between font-bold text-textPrimary">
									{faq.q}
									<span className="transition group-open:-rotate-180">
										<svg
											fill="none"
											height="24"
											shapeRendering="geometricPrecision"
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="1.5"
											viewBox="0 0 24 24"
											width="24">
											<path d="M6 9l6 6 6-6"></path>
										</svg>
									</span>
								</summary>
								<p className="mt-4 text-textSecondary leading-relaxed">
									{faq.a}
								</p>
							</details>
						))}
					</div>
				</div>
			</section>
		</main>
	);
}
