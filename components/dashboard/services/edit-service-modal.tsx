"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ServiceForm } from "./service-form";
import { UpdateServiceValues } from "@/lib/validations/service";
import { updateService } from "@/lib/actions/services/update-service";
import { MergedService } from "@/types/service";

interface EditServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: MergedService | null;
  onSuccess?: () => void;
}

export function EditServiceModal({ open, onOpenChange, service, onSuccess }: EditServiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: UpdateServiceValues) => {
    if (!service) return;
    setIsSubmitting(true);
    try {
      const result = await updateService(service.id, data, service.source, service.templateId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Service updated successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update service");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
          <DialogDescription>
            Update the details of your service.
          </DialogDescription>
        </DialogHeader>
        <ServiceForm initialData={service} onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
