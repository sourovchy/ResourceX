import Link from "next/link";
import { Facebook, Github, Instagram, Linkedin, Mail, Bug } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const socialLinks = [
	{ name: "Facebook",  href: "https://www.facebook.com",  icon: Facebook  },
	{ name: "Instagram", href: "https://www.instagram.com", icon: Instagram },
	{ name: "GitHub",    href: "https://github.com",        icon: Github    },
	{ name: "LinkedIn",  href: "https://www.linkedin.com",  icon: Linkedin  },
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

const quickLinks = [
	{ name: "Home",               href: "/"        },
	{ name: "Terms & Conditions", href: "/terms"   },
	{ name: "Privacy Policy",     href: "/privacy" },
];

export default function Footer() {
	return (
		<footer className="border-t border-borderLight bg-surface">
			<div className="mx-auto max-w-7xl px-6 py-12 lg:py-14">

				{/* Top grid */}
				<div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr]">

					{/* Brand */}
					<div className="space-y-4">
						<Link href="/" className="inline-flex items-center group">
							<Logo size={36} className="transition-transform group-hover:scale-105" />
						</Link>
						<p className="max-w-xs text-sm leading-relaxed text-textSecondary">
							Empowering campus communities with a trusted student-to-student
							rental marketplace.
						</p>
					</div>

					{/* Quick links */}
					<div>
						<h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-textTertiary">
							Quick links
						</h3>
						<ul className="space-y-2.5">
							{quickLinks.map(({ name, href }) => (
								<li key={name}>
									<Link
										href={href}
										className="text-sm text-textSecondary transition-colors hover:text-primary">
										{name}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support */}
					<div>
						<h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-textTertiary">
							Support
						</h3>
						<div className="space-y-2.5">
							{supportLinks.map(({ name, href, icon: Icon }) => (
								<a
									key={name}
									href={href}
									className="flex items-center gap-2.5 text-sm text-textSecondary transition-colors hover:text-primary">
									<Icon className="h-4 w-4 shrink-0" />
									{name}
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="my-8 border-t border-divider" />

				{/* Bottom row */}
				<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
					<p className="text-xs text-textTertiary">
						© {new Date().getFullYear()} ResourceX. All rights reserved.
					</p>

					{/* Social icons */}
					<div className="flex items-center gap-2">
						{socialLinks.map(({ name, href, icon: Icon }) => (
							<a
								key={name}
								href={href}
								target="_blank"
								rel="noreferrer"
								aria-label={name}
								className="flex h-8 w-8 items-center justify-center rounded-lg border border-borderLight bg-background text-textTertiary transition hover:border-primary/40 hover:bg-primaryLight/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
								<Icon className="h-3.5 w-3.5" />
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}