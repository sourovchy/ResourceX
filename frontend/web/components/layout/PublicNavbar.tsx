import Link from "next/link";
import { LogoIcon } from "@/components/ui/Logo";
import { ArrowRight } from "lucide-react";

export default function PublicNavbar() {
    return (
      <header className="sticky top-0 z-[100] w-full pt-4 pb-2 px-4 md:px-6 pointer-events-none">
        <nav className="pointer-events-auto mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-full border border-primaryDark/20 bg-primary/90 px-3 py-2.5 shadow-lg backdrop-blur-md sm:px-5">
          <Link href="/" className="flex items-center gap-2 rounded-full px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onPrimary/40">
            <LogoIcon size={26} colorClass="text-onPrimary" />
            <span className="hidden text-sm font-extrabold tracking-tight text-onPrimary min-[400px]:inline">
              ResourceX
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/#features"
              className="hidden rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-onPrimary/85 transition-colors hover:bg-onPrimary/10 hover:text-onPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onPrimary/40 sm:inline-flex"
            >
              Features
            </Link>
            <Link
              href="/#faq"
              className="hidden rounded-full px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-onPrimary/85 transition-colors hover:bg-onPrimary/10 hover:text-onPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onPrimary/40 sm:inline-flex"
            >
              FAQ
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-onPrimary/85 transition-colors hover:bg-onPrimary/10 hover:text-onPrimary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onPrimary/40"
            >
              Login
            </Link>

            <Link
              href="/auth/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-primary shadow-sm transition-all hover:bg-surfaceVariant hover:shadow active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onPrimary/60"
            >
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </nav>
      </header>
    );
}
