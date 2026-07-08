"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Eye,
  EyeOff,
  Upload,
  FileCheck2,
} from "lucide-react";
import api from "@/lib/api";
import { PENDING_EMAIL_KEY, setOtpLastSendTimestamp } from "@/lib/auth";
import { Logo, LogoIcon } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import AuthProgressOverlay, {
  AuthProgress,
} from "@/components/auth/AuthProgressOverlay";
import { PageLoader } from "@/components/ui/PageLoader";

import {
  validatePasswordChecks,
  isPasswordStrong,
  validateEmail,
  validatePhone,
  normalizePhone,
} from "@/lib/validation";

const universityOptions = [
  {
    value: "Chittagong University of Engineering and Technology",
    label: "Chittagong University of Engineering and Technology",
  },
  { value: "North South University", label: "North South University" },
  { value: "BRAC University", label: "BRAC University" },
  { value: "Dhaka University", label: "Dhaka University" },
];

const departmentOptions = [
  {
    value: "Computer Science and Engineering",
    label: "Computer Science and Engineering",
  },
  { value: "Electrical Engineering", label: "Electrical Engineering" },
  { value: "Business Administration", label: "Business Administration" },
  { value: "English", label: "English" },
];

type AuthResponse = {
  message: string;
  token: string;
  user: {
    userId: number;
    studentId: string;
    name: string;
    email: string;
    phone: string;
    trustScore: number;
    verified: boolean;
  };
};

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    phone: "",
    department: "",
    university: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [progress, setProgress] = useState<AuthProgress | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [idCardFileName, setIdCardFileName] = useState("");
  const [idCardDataUrl, setIdCardDataUrl] = useState("");
  const [idCardFile, setIdCardFile] = useState<File | null>(null);

  const passwordChecks = useMemo(
    () => validatePasswordChecks(form.password),
    [form.password],
  );
  const passwordIsStrong = useMemo(
    () => isPasswordStrong(form.password),
    [form.password],
  );

  // Redirect already-authenticated users away from register
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  if (authLoading || user) return <PageLoader message="Opening registration portal..." fullScreen />;

  const validate = () => {
    if (!form.name.trim()) return "Full name is required";
    if (form.name.length > 50) return "Full name must be under 50 characters";
    if (!form.studentId.trim()) return "Student ID is required";
    if (form.studentId.length > 20)
      return "Student ID must be under 20 characters";
    if (!validatePhone(form.phone))
      return "Please enter a valid Bangladesh mobile number (e.g., 01XXXXXXXXX)";
    if (!form.university.trim()) return "University is required";
    if (form.university.length > 100)
      return "University name must be under 100 characters";
    if (!form.department.trim()) return "Department is required";
    if (form.department.length > 100)
      return "Department name must be under 100 characters";
    if (!idCardDataUrl) return "Upload your student ID card";
    if (!validateEmail(form.email)) return "Invalid email address";
    if (form.email.length > 100) return "Email must be under 100 characters";
    if (!passwordIsStrong)
      return "Please ensure your password meets all requirements";
    return "";
  };

  const handleIdCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Student ID card must be an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Student ID card image must be under 2 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setError("");
      setIdCardFileName(file.name);
      setIdCardDataUrl(String(reader.result));
      setIdCardFile(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return; // guard against double-submit

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    submittingRef.current = true;
    setError("");
    setLoading(true);

    try {
      let uploadedIdCardFileId: number | null = null;

      if (idCardFile) {
        setProgress({ message: "Uploading your ID card…", state: "loading" });
        const formData = new FormData();
        formData.append("file", idCardFile);

        const uploadRes = await api.post(
          "/files/upload?purpose=ID_CARD",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        if (uploadRes.data && uploadRes.data.fileId != null) {
          uploadedIdCardFileId = uploadRes.data.fileId;
        } else {
          throw new Error("Failed to upload ID card. Please try again.");
        }
      } else {
        throw new Error("Please select an ID card image");
      }

      setProgress({ message: "Creating your account…", state: "loading" });
      await api.post<AuthResponse>("/auth/register", {
        studentId: form.studentId.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: normalizePhone(form.phone),
        university: form.university.trim(),
        department: form.department.trim(),
        idCardFileId: uploadedIdCardFileId,
      });

      localStorage.setItem(PENDING_EMAIL_KEY, form.email.trim());

      setProgress({ message: "Sending verification code…", state: "loading" });
      try {
        await api.post("/otp/request", { email: form.email.trim() });
        setOtpLastSendTimestamp(Date.now());
      } catch {
        // Non-fatal
      }

      // Brief success confirmation before navigating, so the flow reads as intentional.
      setProgress({ message: "Verification code sent", state: "success" });
      await new Promise((r) => setTimeout(r, 850));

      router.push("/auth/verify-email");
    } catch (err: any) {
      setProgress(null);
      console.error("Registration error:", err?.response?.data ?? err);

      const responseData = err?.response?.data;
      const rawMessage: string =
        responseData?.message || responseData?.error || err?.message || "";

      const lower = rawMessage.toLowerCase();
      const friendlyMessage =
        lower.includes("duplicate") && lower.includes("phone")
          ? "Phone number already exists"
          : lower.includes("duplicate") && lower.includes("email")
            ? "Email already registered"
            : lower.includes("duplicate") && lower.includes("studentid")
              ? "Student ID already registered"
              : rawMessage;

      setError(
        friendlyMessage || "Could not create your account. Please try again.",
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-textPrimary outline-none transition placeholder:text-textTertiary focus:border-primary focus:ring-2 focus:ring-primary/20";

  return (
    <div className="graph-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6 lg:px-8">
      <AuthProgressOverlay progress={progress} />

      <Reveal className="relative z-10 w-full max-w-6xl px-1 sm:px-0">
        <TiltCard className="glass-surface grid overflow-hidden rounded-3xl shadow-lg lg:grid-cols-[0.75fr_1.25fr]">
          <div className="graph-grid hidden flex-col justify-between border-r border-border bg-surfaceVariant/40 p-10 lg:flex">
            <div>
              <Logo size={36} priority />

              <h1 className="mt-3 text-5xl font-bold leading-tight text-textPrimary">
                Rent. Share.{" "}
                <span className="text-gradient-brand italic">Exchange.</span>
              </h1>

              <p className="mt-5 max-w-md text-lg leading-8 text-textSecondary">
                Rent, share and exchange resources securely within your
                university community.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-textTertiary">
                  Verified students only
                </p>
                <h3 className="mt-1 text-lg font-bold text-textPrimary">
                  Safe university-based access
                </h3>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-textTertiary">
                  Quick onboarding
                </p>
                <h3 className="mt-1 text-lg font-bold text-textPrimary">
                  Create account in minutes
                </h3>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 md:p-8 lg:p-10">
            <div className="mx-auto w-full max-w-xl px-1 sm:px-0">
              <div className="mb-6 sm:mb-8">
                <div className="mb-4 flex justify-start lg:hidden">
                  <LogoIcon size={36} />
                </div>
                <h2 className="text-2xl font-bold leading-tight text-textPrimary sm:text-3xl">
                  Join <span className="text-gradient-brand italic">ResourceX.</span>
                </h2>
                <p className="mt-2 text-sm text-textSecondary">
                  Register with your university details.
                </p>
              </div>

              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-error/40 bg-errorLight px-4 py-3 text-sm leading-relaxed font-medium text-errorDark"
                  >
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value.replace(/[^a-zA-Z.\s]/g, ""),
                          })
                        }
                        className={`${inputBase} pl-10`}
                        placeholder="John Doe"
                        maxLength={50}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                      Student ID
                    </label>
                    <input
                      type="text"
                      value={form.studentId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          studentId: e.target.value.replace(
                            /[^a-zA-Z0-9]/g,
                            "",
                          ),
                        })
                      }
                      className={inputBase}
                      placeholder="CSE2304082"
                      maxLength={20}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            phone: e.target.value
                              .replace(/[^\d+]/g, "")
                              .slice(0, 14),
                          })
                        }
                        className={inputBase}
                        placeholder="+8801XXXXXXXXX"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                      University
                    </label>
                    <Select
                      value={form.university}
                      onChange={(val) =>
                        setForm({
                          ...form,
                          university: val,
                        })
                      }
                      options={universityOptions}
                      placeholder="Select University"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                      Department
                    </label>
                    <Select
                      value={form.department}
                      onChange={(val) =>
                        setForm({
                          ...form,
                          department: val,
                        })
                      }
                      options={departmentOptions}
                      placeholder="Select Department"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            email: e.target.value,
                          })
                        }
                        className={`${inputBase} pl-10`}
                        placeholder="yourname@university.edu"
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-textTertiary" />

                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                      className={`${inputBase} pl-10 pr-10`}
                      placeholder="Strong password"
                      minLength={8}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-textTertiary transition hover:text-textPrimary"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-border bg-surfaceVariant px-4 py-4 text-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-textTertiary">
                      Password requirements
                    </p>
                    <ul className="space-y-1 text-textSecondary">
                      {passwordChecks.map((check) => (
                        <li
                          key={check.label}
                          className="flex items-center gap-2"
                        >
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                              check.valid
                                ? "bg-successLight text-successDark"
                                : "bg-surfaceVariant text-textTertiary"
                            }`}
                            aria-hidden="true"
                          >
                            {check.valid ? "✓" : "•"}
                          </span>
                          <span>{check.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-primary">
                    Student ID Card
                  </label>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-dashed border-outlineVariant bg-surface px-4 py-4 text-sm text-textSecondary transition hover:border-primary hover:bg-primaryLight sm:items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-11 sm:w-11">
                      {idCardDataUrl ? (
                        <FileCheck2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-textPrimary">
                        {idCardFileName || "Upload ID card image"}
                      </div>
                      <div className="text-xs text-textTertiary">
                        JPG or PNG, up to 2 MB
                      </div>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdCardChange}
                      className="hidden"
                      required
                    />
                  </label>

                  {idCardDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element -- data-URL preview; next/image cannot optimize data URLs
                    <img
                      src={idCardDataUrl}
                      alt="Student ID card preview"
                      className="h-32 w-full rounded-2xl border border-borderLight bg-surface object-cover shadow-sm sm:h-40"
                    />
                  )}
                </div>

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
                        className="font-semibold text-primary hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and Privacy Policy. I confirm that all provided
                      information is accurate.
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  loading={loading}
                  fullWidth
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="mt-2"
                >
                  {loading ? "Creating account…" : "Sign Up"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-textSecondary sm:mt-8">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary hover:text-primaryDark"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </TiltCard>
      </Reveal>
    </div>
  );
}
