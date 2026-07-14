"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createServiceSchema, type CreateServiceValues, pricingTypeEnum } from "@/lib/validations/service";
import { MergedService } from "@/types/service";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";

interface ServiceFormProps {
  initialData?: MergedService | null;
  onSubmit: (data: CreateServiceValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ServiceForm({ initialData, onSubmit, isSubmitting }: ServiceFormProps) {
  const form = useForm<CreateServiceValues>({
    resolver: zodResolver(createServiceSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      pricing_type: initialData?.pricing_type || "FIXED",
      fixed_price: initialData?.fixed_price ?? null,
      min_price: initialData?.min_price ?? null,
      max_price: initialData?.max_price ?? null,
      currency: initialData?.currency || "INR",
      duration_minutes: initialData?.duration_minutes ?? null,
      active: initialData?.active ?? true,
    },
  });

  const pricingType = form.watch("pricing_type");

  // Reset relevant fields when pricing type changes
  useEffect(() => {
    if (pricingType !== "RANGE") {
      form.setValue("min_price", null);
      form.setValue("max_price", null);
    }
    if (pricingType !== "FIXED" && pricingType !== "HOURLY") {
      form.setValue("fixed_price", null);
    }
  }, [pricingType, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g. Buyer Consultation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Consultation" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the service..." 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pricing_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing Type <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pricing type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pricingTypeEnum.options.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duration_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (Minutes)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="e.g. 60" 
                    {...field} 
                    value={field.value ?? ""} 
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {(pricingType === "FIXED" || pricingType === "HOURLY") && (
          <FormField
            control={form.control}
            name="fixed_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ({form.watch("currency")}) <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="e.g. 500" 
                    {...field} 
                    value={field.value ?? ""} 
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {pricingType === "RANGE" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="min_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Price ({form.watch("currency")}) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g. 100" 
                      {...field} 
                      value={field.value ?? ""} 
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="max_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Price ({form.watch("currency")}) <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="e.g. 500" 
                      {...field} 
                      value={field.value ?? ""} 
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Active services are offered by your agency and can be discussed by your AI agents.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialData ? "Save Changes" : "Create Service"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
