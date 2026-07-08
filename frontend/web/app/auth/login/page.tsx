"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { LogoIcon } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { PageLoader } from "@/components/ui/PageLoader";

type ErrorResponse = {
  message?: string;
};

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect already-authenticated users away from login
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  // Render PageLoader while auth is hydrating or redirecting
  if (authLoading || user) return <PageLoader message="Verifying session..." fullScreen />;

  const validate = () => {
    if (!form.email.includes("@")) return "Invalid email address";
    if (form.password.length < 6)
      return "Password must be at least 6 characters";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(form.email.trim(), form.password);
    } catch (err) {
      const axiosError = err as AxiosError<ErrorResponse>;

      if (!axiosError.response) {
        setError("Network error. Please check your connection.");
      } else if (axiosError.response.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (
        axiosError.response.status === 401 ||
        axiosError.response.status === 403 ||
        axiosError.response.status === 404
      ) {
        const errorMsg = axiosError.response?.data?.message;

        if (errorMsg === "Your account is pending admin review.") {
          router.push("/auth/pending-approval");
          return;
        }

        setError(errorMsg || "Invalid email or password.");
      } else {
        setError(
          axiosError.response?.data?.message || "Invalid email or password.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="graph-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <Reveal className="relative z-10 w-full max-w-md px-1 sm:px-0">
        <TiltCard className="glass-surface rounded-2xl p-5 shadow-md sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="mb-4 flex justify-center">
              <LogoIcon size={48} priority />
            </div>

            <h1 className="text-3xl font-bold text-textPrimary sm:text-4xl">
              Welcome <span className="text-gradient-brand italic">back.</span>
            </h1>

            <p className="mt-2 text-sm text-textSecondary">
              Enter your credentials to access your account.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-error/40 bg-errorLight px-3 py-2 text-sm font-medium text-errorDark"
              >
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary"
              >
                Email <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-4 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
                  placeholder="yourname@university.edu"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="login-password"
                  className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary"
                >
                  Password <span className="text-error">*</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-primary transition-colors hover:text-primaryDark"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-10 text-textPrimary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-textTertiary"
                  placeholder="••••••••"
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-textTertiary transition-colors hover:text-primary"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-1.5 pb-1 pt-1 sm:pt-2">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-outlineVariant bg-card accent-primary focus-visible:ring-2 focus-visible:ring-primary"
                  required
                />
                <span className="text-sm leading-relaxed text-textSecondary">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Terms &amp; Conditions
                  </Link>{" "}
                  and Privacy Policy.
                </span>
              </label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              loading={loading}
              fullWidth
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-textSecondary sm:mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-primary transition-colors hover:text-primaryDark"
            >
              Sign up
            </Link>
          </p>
        </TiltCard>

        {/* Security footnote */}
        <p className="mt-5 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-textTertiary">
          <ShieldCheck className="h-3.5 w-3.5" />
          Encrypted Session · ResourceX
        </p>
      </Reveal>
    </div>
  );
}
