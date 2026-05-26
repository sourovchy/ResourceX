import Link from "next/link";
import { Facebook, Github, Instagram, Linkedin, Mail, Bug } from "lucide-react";

const socialLinks = [
	{ name: "Facebook", href: "https://www.facebook.com", icon: Facebook },
	{ name: "Instagram", href: "https://www.instagram.com", icon: Instagram },
	{ name: "GitHub", href: "https://github.com", icon: Github },
	{ name: "LinkedIn", href: "https://www.linkedin.com", icon: Linkedin },
];

const supportLinks = [
	{
		name: "Report a bug",
		href: "mailto:[REDACTED_MAIL_USERNAME]?subject=ResourceX%20Bug%20Report",
		icon: Bug,
	},
	{
		name: "Contact support",
		href: "mailto:[REDACTED_MAIL_USERNAME]",
		icon: Mail,
	},
];

export default function Footer() {
	return (
		<footer className="border-t border-borderLight bg-surface">
			<div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:px-8 lg:py-14">
				<div className="space-y-5 text-center lg:text-left">
					<div className="inline-flex items-center gap-3 justify-center lg:justify-start">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-black text-onPrimary shadow-sm">
							RX
						</div>
						<div className="text-left">
							<p className="text-lg font-black tracking-tight text-textPrimary">
								ResourceX
							</p>
							<p className="max-w-md text-sm leading-relaxed text-textSeconkary">
								Empowering campus communities with a trusted student-to-student rental marketplace.
							</p>
						</div>
					</div>

					<p className="text-sm text-textSecondary">
						© {new Date().getFullYear()} ResourceX. All rights reserved.
					</p>
				</div>

				<div className="text-center lg:text-left">
					<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textPrimary">
						Quick Links
					</h3>
					<div className="flex flex-wrap justify-center gap-x-5 gap-y-3 lg:justify-start">
						<Link href="/terms" className="text-sm text-textSecondary transition hover:text-primary">
							Terms & Conditions
						</Link>
						<Link href="/privacy" className="text-sm text-textSecondary transition hover:text-primary">
							Privacy Policy
						</Link>
						<Link href="/" className="text-sm text-textSecondary transition hover:text-primary">
							Home
						</Link>
					</div>
				</div>

				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
					<div className="text-center sm:text-left">
						<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textPrimary">
							Follow Us
						</h3>
						<div className="flex flex-wrap justify-center gap-3 sm:justify-start">
							{socialLinks.map(({ name, href, icon: Icon }) => (
								<a
									key={name}
									href={href}
									target="_blank"
									rel="noreferrer"
									aria-label={name}
									className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-borderLight bg-background text-textSecondary transition hover:border-primary hover:text-primary hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-primaryLight">
									<Icon className="h-4 w-4" />
								</a>
							))}
						</div>
					</div>

					<div className="text-center sm:text-left">
						<h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textPrimary">
							Support
						</h3>
						<div className="space-y-3">
							{supportLinks.map(({ name, href, icon: Icon }) => (
								<a
									key={name}
									href={href}
									className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-borderLight bg-background px-4 py-3 text-sm font-medium text-textSecondary transition hover:border-primary hover:text-primary hover:shadow-sm sm:justify-start">
									<Icon className="h-4 w-4 shrink-0" />
									<span>{name}</span>
								</a>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
