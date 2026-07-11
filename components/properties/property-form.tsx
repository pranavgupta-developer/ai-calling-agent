"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyFormSchema, PropertyFormValues } from "@/lib/validations/property";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createProperty } from "@/lib/actions/properties/create-property";
import { updateProperty } from "@/lib/actions/properties/update-property";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Garden",
  "Balcony",
  "Security",
  "Lift",
  "Parking",
  "Club House",
  "Air Conditioning",
  "Power Backup",
  "Children's Play Area",
  "CCTV",
];

interface PropertyFormProps {
  initialData?: PropertyFormValues & { id?: string };
}

export function PropertyForm({ initialData }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema) as any,
    defaultValues: initialData
      ? {
          ...initialData,
          property_type: initialData.property_type?.toLowerCase() as any,
          listing_type: initialData.listing_type?.toLowerCase() as any,
          price_type: initialData.price_type?.toLowerCase() as any,
          status: initialData.status?.toLowerCase() as any,
        }
      : {
          title: "",
          description: "",
          property_type: "apartment",
          listing_type: "sale",
          status: "available",
          price: 0,
          price_type: "fixed",
          bedrooms: 0,
          bathrooms: 0,
          parking: 0,
          square_feet: 0,
          year_built: new Date().getFullYear(),
          amenities: [],
        },
  });

  async function onSubmit(data: PropertyFormValues) {
    setIsSubmitting(true);
    try {
      if (initialData?.id) {
        const response = await updateProperty(initialData.id, data);
        if (response.error) {
          toast.error(response.error);
        } else {
          toast.success("Listing updated successfully.");
          router.push("/dashboard/listings");
        }
      } else {
        const response = await createProperty(data);
        if (response.error) {
          toast.error(response.error);
        } else {
          toast.success("Listing created successfully.");
          router.push("/dashboard/listings");
        }
      }
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="p-8 max-w-4xl mx-auto rounded-3xl bg-background/50 backdrop-blur-xl border border-white/10 shadow-2xl"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          {initialData ? "Edit Listing" : "Create New Listing"}
        </h2>
        <p className="text-muted-foreground">
          {initialData
            ? "Update the details of your property listing below."
            : "Fill in the details to publish a new property listing."}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8 col-span-1 md:col-span-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">
                  Basic Information
                </h3>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Modern Apartment in Downtown"
                          {...field}
                          className="bg-white/5 border-white/10 focus-visible:ring-primary/50"
                        />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the property in detail..."
                          className="min-h-[120px] bg-white/5 border-white/10 focus-visible:ring-primary/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Property Details */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">
                  Property Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="property_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="listing_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Select listing type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sale">Sale</SelectItem>
                            <SelectItem value="rental">Rental</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10">
                              <SelectValue placeholder="Select price type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Specs */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="parking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parking Spots</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="square_feet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Square Feet</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="year_built"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Built</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            className="bg-white/5 border-white/10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold border-b pb-2">
                  Amenities
                </h3>
                <FormField
                  control={form.control}
                  name="amenities"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormDescription>
                          Select all the amenities available at the property.
                        </FormDescription>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
                        {AMENITIES.map((item) => (
                          <FormField
                            key={item}
                            control={form.control}
                            name="amenities"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {item}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[200px]"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : initialData ? (
                "Save Changes"
              ) : (
                "Create Listing"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
