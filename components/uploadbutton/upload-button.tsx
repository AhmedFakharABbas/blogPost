"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  onUploadSuccess: (url: string) => void;
  onUploadError: (error: Error) => void;
}

export function UploadButton({ onUploadSuccess, onUploadError }: UploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "blog_featured";
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate Cloudinary configuration
    if (!cloudName) {
      onUploadError(new Error("Cloudinary cloud name is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable."));
      return;
    }

    // Validate file type/size
    if (!file.type.startsWith("image/")) {
      onUploadError(new Error("Please select an image file"));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      onUploadError(new Error("Image must be smaller than 10MB"));
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // Provide more specific error messages
        if (data.error?.message) {
          throw new Error(data.error.message);
        }
        if (res.status === 400) {
          throw new Error(`Invalid request. Check if preset "${uploadPreset}" exists in your Cloudinary account.`);
        }
        if (res.status === 401) {
          throw new Error("Cloudinary authentication failed. Check your cloud name.");
        }
        throw new Error(`Upload failed with status ${res.status}`);
      }

      if (!data.secure_url) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      onUploadSuccess(data.secure_url);
    } catch (err) {
      if (err instanceof TypeError && err.message.includes("fetch")) {
        onUploadError(new Error("Network error. Please check your internet connection and try again."));
      } else {
        onUploadError(err instanceof Error ? err : new Error("Upload failed. Please try again."));
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading && <p className="mt-2 text-sm">Uploading...</p>}
      </label>
    </div>
  );
}