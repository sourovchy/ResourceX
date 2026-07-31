import Link from "next/link";
import { Facebook, Github, Instagram, Linkedin, Mail, Bug, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const socialLinks = [
	{ name: "Facebook",  href: "https://www.facebook.com",  icon: Facebook  },
	{ name: "Instagram", href: "https://www.instagram.com", icon: Instagram },
	{ name: "GitHub",    href: "https://github.com/sourovchy/ResourceX", icon: Github },
	{ name: "LinkedIn",  href: "https://www.linkedin.com",  icon: Linkedin  },
];

const supportLinks = [
	{
		name: "Report a bug",
		href: "mailto:support.resourcex@gmail.com?subject=ResourceX%20Bug%20Report",
		icon: Bug,
	},
	{
		name: "Contact support",
		href: "mailto:support.resourcex@gmail.com",
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
		<footer className="border-t border-border bg-surface">
			<div className="mx-auto max-w-7xl px-6 py-12 lg:py-14">

				{/* Top grid */}
				<div className="grid gap-10 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr]">

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
						<h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-textTertiary">
							Quick links
						</h3>
						<ul className="-mx-3 space-y-0.5">
							{quickLinks.map(({ name, href }) => (
								<li key={name}>
									<Link
										href={href}
										className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium text-textSecondary transition-colors hover:bg-surfaceVariant/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
										<span>{name}</span>
										<ArrowUpRight className="h-4 w-4 shrink-0 text-textTertiary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Support */}
					<div>
						<h3 className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[1.5px] text-textTertiary">
							Support
						</h3>
						<div className="-mx-3 space-y-0.5">
							{supportLinks.map(({ name, href, icon: Icon }) => (
								<a
									key={name}
									href={href}
									className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-textSecondary transition-colors hover:bg-surfaceVariant/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
									<Icon className="h-4 w-4 shrink-0 text-textTertiary transition-colors group-hover:text-primary" />
									<span>{name}</span>
								</a>
							))}
						</div>
					</div>
				</div>

				{/* Divider */}
				<div className="my-8 border-t border-divider" />

				{/* Bottom row */}
				<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
					<p className="text-xs text-textTertiary flex items-center gap-2">
						<span>© {new Date().getFullYear()} ResourceX</span>
						<span className="text-primary/40">✦</span>
						<span>All rights reserved.</span>
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
								className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-textTertiary transition-all hover:scale-105 hover:border-primary/40 hover:bg-primaryLight hover:text-primary active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
								<Icon className="h-3.5 w-3.5" />
							</a>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}