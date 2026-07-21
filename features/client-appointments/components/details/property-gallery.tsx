"use client";

import { useState } from "react";
import Image from "next/image";
import { ClientAppointmentDetails } from "@/types/client-portal";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PropertyGallery({ appointment }: { appointment: ClientAppointmentDetails }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!appointment.property) {
    return (
      <div className="w-full h-[400px] rounded-xl bg-muted border border-dashed flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
        <p>No property associated</p>
      </div>
    );
  }

  const images = appointment.property.images && appointment.property.images.length > 0 
    ? appointment.property.images.map(img => img.url)
    : [];

  if (images.length === 0) {
    return (
      <div className="w-full h-[400px] rounded-xl bg-muted border flex flex-col items-center justify-center text-muted-foreground">
        <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
        <p>No images available</p>
      </div>
    );
  }

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden group border bg-muted">
        <Image
          src={images[currentIndex]}
          alt={`Property image ${currentIndex + 1}`}
          fill
          className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          priority
        />
        
        {images.length > 1 && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full shadow-md"
              onClick={prevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full shadow-md"
              onClick={nextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2.5 py-1 text-xs rounded-md backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                "relative h-20 w-28 rounded-md overflow-hidden shrink-0 border-2 transition-all",
                currentIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
