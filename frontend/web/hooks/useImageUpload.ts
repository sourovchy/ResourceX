"use client";

import { useState, useCallback } from "react";
import api from "@/lib/api";

type Purpose = "ITEM_IMAGE" | "PROFILE_IMAGE" | "DISPUTE_EVIDENCE" | "ID_CARD";

export type ImagePreview = {
  file?: File;
  url: string;
  storedName?: string;
};

type UseImageUploadOptions = {
  purpose: Purpose;
  maxFiles?: number;
  maxSizeMB?: number;
};

export type UseImageUploadReturn = {
  previews: ImagePreview[];
  setPreviews: React.Dispatch<React.SetStateAction<ImagePreview[]>>;
  addFiles: (files: FileList) => void;
  removeFile: (index: number) => Promise<void>;
  uploadAll: () => Promise<string[]>;
  uploading: boolean;
  error: string | null;
};

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_PURPOSES: Purpose[] = ["ITEM_IMAGE", "PROFILE_IMAGE"];

export function useImageUpload({
  purpose,
  maxFiles = 5,
  maxSizeMB = 5,
}: UseImageUploadOptions): UseImageUploadReturn {
  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback(
    (files: FileList) => {
      setError(null);
      const incoming = Array.from(files);

      if (previews.length + incoming.length > maxFiles) {
        setError(`Maximum ${maxFiles} images allowed`);
        return;
      }

      const newPreviews: ImagePreview[] = [];
      for (const file of incoming) {
        if (IMAGE_PURPOSES.includes(purpose) && !IMAGE_MIME_TYPES.includes(file.type)) {
          setError("Only JPEG, PNG, and WEBP images are allowed");
          return;
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`"${file.name}" exceeds the ${maxSizeMB} MB limit`);
          return;
        }
        newPreviews.push({ file, url: URL.createObjectURL(file) });
      }

      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [previews.length, purpose, maxFiles, maxSizeMB],
  );

  const removeFile = useCallback(
    async (index: number) => {
      const target = previews[index];
      if (!target) return;

      if (target.storedName) {
        try {
          await api.delete(`/files/${target.storedName}`);
        } catch {
          // best-effort — remove from UI regardless
        }
      }

      if (target.file && target.url.startsWith("blob:")) {
        URL.revokeObjectURL(target.url);
      }

      setPreviews((prev) => prev.filter((_, i) => i !== index));
    },
    [previews],
  );

  const uploadAll = useCallback(async (): Promise<string[]> => {
    setError(null);
    setUploading(true);

    try {
      const urls: string[] = [];

      for (const preview of previews) {
        if (!preview.file) {
          // Already uploaded — pass through existing URL
          if (preview.url) urls.push(preview.url);
          continue;
        }

        const formData = new FormData();
        formData.append("file", preview.file);

        const res = await api.post(`/files/upload?purpose=${purpose}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data?.fileUrl) {
          urls.push(res.data.fileUrl);
        }
      }

      return urls;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Upload failed";
      setError(msg);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [previews, purpose]);

  return { previews, setPreviews, addFiles, removeFile, uploadAll, uploading, error };
}
