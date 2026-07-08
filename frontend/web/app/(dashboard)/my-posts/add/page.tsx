"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UploadCloud, CheckCircle2, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Select } from "@/components/ui/Select";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { TiltCard } from "@/components/ui/TiltCard";

type FormState = {
  title: string;
  category: string;
  condition: string;
  description: string;
  price: string;
  availability: string;
};

export default function AddItemPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [form, setForm] = useState<FormState>({
    title: "",
    category: "",
    condition: "",
    description: "",
    price: "",
    availability: "CAMPUS_ONLY",
  });
  const [categories, setCategories] = useState<
    { id: string | number; name: string }[]
  >([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");

  const {
    previews,
    addFiles,
    removeFile,
    uploadAll,
    uploading,
    error: uploadError,
  } = useImageUpload({ purpose: "ITEM_IMAGE", maxFiles: 5, maxSizeMB: 5 });

  React.useEffect(() => {
    let active = true;

    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories");
        if (!active) return;

        const raw = res.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.content)
              ? raw.content
              : [];

        const normalizedCategories = list.map((c: any) => ({
          id: c.id ?? c.categoryId ?? c.name,
          name: c.name ?? "",
        }));
        setCategories(normalizedCategories);
      } catch (err) {
        if (active) {
          console.error("Failed to fetch categories:", err);
          setCategoriesError("Failed to load categories.");
        }
      } finally {
        if (active) setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
    return () => {
      active = false;
    };
  }, []);

  const validate = (): boolean => {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim() || form.title.trim().length < 3)
      errors.title = "Title must be at least 3 characters.";
    if (!form.category) errors.category = "Please select a category.";
    if (!form.condition) errors.condition = "Please select a condition.";
    if (!form.description.trim() || form.description.trim().length < 20)
      errors.description = "Description must be at least 20 characters.";
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price <= 0)
      errors.price = "Enter a valid daily price greater than 0.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setIsLoading(true);

    try {
      const uploadedImageUrls = await uploadAll();

      const payload = {
        title: form.title,
        category: form.category,
        itemCondition: form.condition,
        description: form.description,
        dailyRate: parseFloat(form.price),
        imageUrls: uploadedImageUrls,
        availabilityScope: form.availability || "CAMPUS_ONLY",
      };

      await api.post("/items", payload);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Failed to create item", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to create item",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormState]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl space-y-5 px-3 py-16 text-center sm:px-4 sm:py-20">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-successLight text-success sm:h-20 sm:w-20">
          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" />
        </div>

        <h1 className="text-2xl font-extrabold text-textPrimary sm:text-3xl">
          Item Published!
        </h1>

        <p className="text-sm text-textSecondary sm:text-base">
          Your item is now live in the ResourceX catalog and available for users
          to view right away.
        </p>

        <Link href="/my-posts" className="mt-4 inline-block">
          <Button className="px-5 py-3 sm:px-6">Back to My Posts</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16 sm:px-6 sm:pb-20 lg:space-y-8 lg:px-8 w-full">
      <div className="mb-2">
        <h1 className="mt-1 text-3xl font-normal italic leading-tight text-textPrimary sm:text-4xl">
          Publish <span className="text-primary font-bold">item.</span>
        </h1>
      </div>

      {(error || uploadError) && (
        <div className="rounded-xl bg-errorLight p-4 text-sm font-semibold text-error">
          {error || uploadError}
        </div>
      )}

      <TiltCard
        maxTilt={2}
        glare={true}
        className="rounded-2xl border border-borderLight bg-surface shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md"
      >
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-6 lg:gap-8 p-5 sm:p-8 lg:p-10"
      >
        <div className="space-y-6 sm:space-y-8">
        {/* Basic Info */}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="border-b border-borderLight pb-3 text-sm font-bold uppercase tracking-wider text-textSecondary sm:text-base">
            Basic Info
          </h2>

          <Field label="Title" error={fieldErrors.title}>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              type="text"
              placeholder="e.g. Sony Alpha A7III"
              maxLength={100}
              error={!!fieldErrors.title}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Category" error={categoriesError || fieldErrors.category}>
              <SearchableCombobox
                value={form.category}
                onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                options={categories.map((c) => ({ value: c.name, label: c.name }))}
                placeholder={isCategoriesLoading ? "Loading categories..." : "Select Category"}
                searchPlaceholder="Search categories..."
                error={!!categoriesError || !!fieldErrors.category}
                required
                loading={isCategoriesLoading}
              />
            </Field>

            <Field label="Condition" error={fieldErrors.condition}>
              <Select
                value={form.condition}
                onChange={(val) => setForm((prev) => ({ ...prev, condition: val }))}
                options={[
                  { value: "New", label: "New" },
                  { value: "Good", label: "Good" },
                  { value: "Fair", label: "Fair" },
                ]}
                placeholder="Select Condition"
                error={!!fieldErrors.condition}
                required
              />
            </Field>
          </div>

          <Field label="Description" error={fieldErrors.description}>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the item, what is included, and any important rules..."
              maxLength={1000}
              error={!!fieldErrors.description}
            />
          </Field>
        </div>
        </div>

        <div className="space-y-6 sm:space-y-8 lg:pl-6 lg:border-l lg:border-borderLight">
        
        {/* Rental Availability */}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="border-b border-borderLight pb-3 text-sm font-bold uppercase tracking-wider text-textSecondary sm:text-base">
            Rental Availability
          </h2>

          <div className="space-y-3">
            <label className="text-sm font-bold text-textPrimary block">Where are you willing to rent this item?</label>
            
            <div className="space-y-3">
              <label className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-all ${form.availability === "CAMPUS_ONLY" || !form.availability ? "border-primary bg-primaryLight/30" : "border-borderLight hover:border-primary/50"}`}>
                <div className="flex h-5 items-center">
                  <input
                    type="radio"
                    name="availability"
                    value="CAMPUS_ONLY"
                    checked={form.availability === "CAMPUS_ONLY" || !form.availability}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <span className="block text-sm font-bold text-textPrimary">Campus Only</span>
                  <span className="block text-xs text-textSecondary mt-0.5">You will only meet renters inside university campus.</span>
                </div>
              </label>

              <label className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-all ${form.availability === "CAMPUS_AND_OUTSIDE" ? "border-primary bg-primaryLight/30" : "border-borderLight hover:border-primary/50"}`}>
                <div className="flex h-5 items-center">
                  <input
                    type="radio"
                    name="availability"
                    value="CAMPUS_AND_OUTSIDE"
                    checked={form.availability === "CAMPUS_AND_OUTSIDE"}
                    onChange={handleChange}
                    className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                <div>
                  <span className="block text-sm font-bold text-textPrimary">Campus & Outside Campus</span>
                  <span className="block text-xs text-textSecondary mt-0.5">You are willing to meet renters both inside and outside campus.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="border-b border-borderLight pb-3 text-sm font-bold uppercase tracking-wider text-textSecondary sm:text-base">
            Pricing
          </h2>

          <Field label="Daily Rental Price" error={fieldErrors.price}>
            <Input
              name="price"
              value={form.price}
              onChange={handleChange}
              type="number"
              min="0"
              max="100000"
              placeholder="Rental cost per day e.g. 500"
              error={!!fieldErrors.price}
            />
          </Field>
        </div>

        {/* Photos */}
        <div className="space-y-4 sm:space-y-5">
          <h2 className="border-b border-borderLight pb-3 text-sm font-bold uppercase tracking-wider text-textSecondary sm:text-base">
            Photos
          </h2>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight bg-surfaceVariant p-5 text-center transition-colors hover:border-primary sm:p-8">
            <UploadCloud className="mb-3 h-8 w-8 text-primary sm:h-10 sm:w-10" />
            <p className="mb-1 text-sm font-bold text-textPrimary">
              Click to upload photos
            </p>
            <p className="text-xs text-textSecondary">
              JPEG, PNG, WEBP · up to 5 MB each · max 5 images
            </p>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </label>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
              {previews.map((p, i) => (
                <div
                  key={i}
                  className="relative aspect-square overflow-hidden rounded-xl border border-borderLight bg-surfaceVariant"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- blob/object-URL preview; next/image cannot optimize these */}
                  <img
                    src={p.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-error"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || uploading}
          loading={uploading || isLoading}
          className="mt-8 w-full py-4 text-base font-bold shadow-sm sm:mt-10 sm:py-5 lg:text-lg"
        >
          {uploading ? "Uploading images..." : isLoading ? "Publishing..." : "Publish Listing"}
        </Button>
        </div>
      </form>
      </TiltCard>
    </div>
  );
}
