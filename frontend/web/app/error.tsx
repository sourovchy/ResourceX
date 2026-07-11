"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import { TiltCard } from "@/components/ui/TiltCard";
import { Background } from "@/components/ui/Background";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to console
    console.error("[Global Error Exception]:", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <Background />
      <div className="relative z-10 w-full max-w-md">
        {/* Brand Logo Header */}
        <div className="mb-8 flex justify-center">
          <Logo size={44} />
        </div>

        {/* Error status card */}
        <TiltCard
          maxTilt={1}
          className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm transition hover:border-primary/20"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-errorLight text-error">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-normal tracking-[-1px] text-textPrimary">
            Something went <span className="text-primary italic">wrong.</span>
          </h1>

          <p className="mt-4 text-sm leading-relaxed text-textSecondary">
            An unexpected application error has occurred. Our team has been
            notified.
          </p>

          {error && error.message && (
            <div className="mt-4 rounded-xl border border-error/20 bg-errorLight px-4 py-3 text-left text-xs font-mono text-error break-all">
              {error.message}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:justify-center">
            <Button
              onClick={reset}
              variant="primary"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Try Again
            </Button>
            <Link
              href="/"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full font-bold italic bg-primary text-onPrimary hover:bg-primaryDark focus-visible:ring-2 focus-visible:ring-primary/40 outline-none px-6 py-3 text-sm transition-colors duration-300"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}
