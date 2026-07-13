import { getProperty } from "@/lib/actions/properties/get-property";
import { getPropertyImages } from "@/lib/actions/properties/images/get-images";
import { PropertyForm } from "@/components/properties/property-form";
import { notFound, redirect } from "next/navigation";

export const metadata = {
  title: "Edit Listing | Dashboard",
  description: "Edit your property listing.",
};

interface EditPropertyPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  const [propertyResult, imagesResult] = await Promise.all([
    getProperty(id),
    getPropertyImages(id)
  ]);

  const { data: property, error } = propertyResult;
  const initialImages = imagesResult.data || [];

  if (error || !property) {
    // If not found or unauthorized, redirect back to listings
    redirect("/dashboard/listings");
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PropertyForm initialData={property} initialImages={initialImages} />
    </div>
  );
}
