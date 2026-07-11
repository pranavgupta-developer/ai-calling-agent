import { PropertyForm } from "@/components/properties/property-form";

export const metadata = {
  title: "Create Listing | Dashboard",
  description: "Create a new property listing.",
};

export default function CreatePropertyPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PropertyForm />
    </div>
  );
}
