"use client";

import { useEffect, useState, useRef } from "react";
import { Reorder } from "framer-motion";
import { PropertyImage } from "@/lib/actions/properties/images/get-images";
import { SortableImage } from "./SortableImage";
import { reorderPropertyImages } from "@/lib/actions/properties/images/reorder-images";
import { deletePropertyImage } from "@/lib/actions/properties/images/delete-image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ImageGalleryProps {
  propertyId: string;
  images: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
}

export function ImageGallery({ propertyId, images, onImagesChange }: ImageGalleryProps) {
  const [items, setItems] = useState<PropertyImage[]>(images);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  
  // To track original order to avoid unnecessary saves
  const initialOrderRef = useRef<string>(items.map((i) => i.id).join(","));

  useEffect(() => {
    setItems(images);
    initialOrderRef.current = images.map((i) => i.id).join(",");
  }, [images]);

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    const result = await deletePropertyImage(id);
    setIsDeleting(null);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Image deleted successfully.");
      const updatedImages = items.filter((img) => img.id !== id);
      setItems(updatedImages);
      onImagesChange(updatedImages);
    }
  };

  const handleDragEnd = async () => {
    const currentOrder = items.map((i) => i.id).join(",");
    if (currentOrder !== initialOrderRef.current) {
      // Order has changed
      setIsSavingOrder(true);
      const result = await reorderPropertyImages(propertyId, items.map((i) => i.id));
      setIsSavingOrder(false);

      if (result.error) {
        toast.error("Failed to save new image order.");
        // Revert to initial order? For now, just let user try again
      } else {
        toast.success("Image order saved.");
        initialOrderRef.current = currentOrder;
        onImagesChange(items);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground bg-muted/50 rounded-xl border border-dashed">
        No images uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>{items.length} / 10 images uploaded</span>
        {isSavingOrder && (
          <span className="flex items-center text-primary">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving order...
          </span>
        )}
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        style={{ listStyleType: "none", padding: 0 }}
      >
        {items.map((image, index) => (
          <SortableImage
            key={image.id}
            image={image}
            index={index}
            onDelete={handleDelete}
            isDeleting={isDeleting === image.id}
            onDragEnd={handleDragEnd}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
