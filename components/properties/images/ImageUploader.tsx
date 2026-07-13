"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { uploadPropertyImage } from "@/lib/actions/properties/images/upload-image";
import { PropertyImage } from "@/lib/actions/properties/images/get-images";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const MAX_IMAGES_PER_LISTING = 10;

interface ImageUploaderProps {
  propertyId: string;
  currentImageCount: number;
  onUploadSuccess: (newImage: PropertyImage) => void;
}

export function ImageUploader({ propertyId, currentImageCount, onUploadSuccess }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndUploadFiles = async (files: File[]) => {
    if (currentImageCount + files.length > MAX_IMAGES_PER_LISTING) {
      toast.error(`You can only upload up to ${MAX_IMAGES_PER_LISTING} images in total.`);
      return;
    }

    const validFiles: File[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a valid image format (JPG, PNG, WEBP).`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is larger than 5MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);

    for (const file of validFiles) {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadPropertyImage(propertyId, formData);
      if (result.error) {
        toast.error(`Failed to upload ${file.name}: ${result.error}`);
      } else if (result.data) {
        // Assume url is generated, but upload action doesn't return signed url directly
        // We'll just emit success, and parent might need to refetch
        // Or we can construct it if public. Since it's private, we should reload images.
        onUploadSuccess(result.data as PropertyImage);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUploadFiles(Array.from(e.target.files));
    }
  };

  const remainingSlots = MAX_IMAGES_PER_LISTING - currentImageCount;

  if (remainingSlots <= 0) {
    return (
      <div className="p-4 border-2 border-dashed rounded-xl bg-muted/50 text-center text-muted-foreground">
        Maximum image limit reached.
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
        isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileSelect}
      />

      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        {isUploading ? (
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        ) : (
          <UploadCloud className="w-6 h-6 text-primary" />
        )}
      </div>

      <h3 className="text-lg font-semibold mb-1">
        {isUploading ? "Uploading images..." : "Click or drag images to upload"}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
        Supports JPG, PNG, and WEBP up to 5MB. You can upload {remainingSlots} more image{remainingSlots !== 1 && 's'}.
      </p>

      <Button
        type="button"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        Select Files
      </Button>
    </div>
  );
}
