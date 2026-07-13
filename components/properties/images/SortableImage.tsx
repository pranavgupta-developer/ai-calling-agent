"use client";

import { Reorder, useDragControls } from "framer-motion";
import { GripVertical, Trash2 } from "lucide-react";
import { PropertyImage } from "@/lib/actions/properties/images/get-images";
import { Button } from "@/components/ui/button";

interface SortableImageProps {
  image: PropertyImage;
  index: number;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onDragEnd: () => void;
}

export function SortableImage({ image, index, onDelete, isDeleting, onDragEnd }: SortableImageProps) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={image}
      id={image.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="relative group aspect-video rounded-xl overflow-hidden border bg-muted"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={`Property Image ${index + 1}`}
        className="object-cover w-full h-full"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
        <div className="flex justify-between items-start">
          <div className="bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-md backdrop-blur-md">
            {index === 0 ? "Cover Image" : `#${index + 1}`}
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(image.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex justify-center">
          <div
            className="cursor-grab active:cursor-grabbing p-2 bg-black/50 hover:bg-black/70 rounded-md backdrop-blur-md text-white transition-colors"
            onPointerDown={(e) => controls.start(e)}
          >
            <GripVertical className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
