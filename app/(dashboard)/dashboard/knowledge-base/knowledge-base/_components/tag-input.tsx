"use client";

import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function TagInput({ tags, onChange, maxTags = 20 }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;
    if (trimmedValue.length < 2 || trimmedValue.length > 30) return;
    
    if (tags.length >= maxTags) return;
    if (tags.includes(trimmedValue)) {
      setInputValue("");
      return; // prevent duplicates
    }

    onChange([...tags, trimmedValue]);
    setInputValue("");
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    onChange(newTags);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 p-2 min-h-[42px] border rounded-md focus-within:ring-1 focus-within:ring-ring focus-within:border-input bg-background items-center">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1 text-sm">
            {tag}
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground rounded-full"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {tags.length < maxTags && (
          <input
            type="text"
            className="flex-1 min-w-[120px] bg-transparent outline-none border-none text-sm px-1 py-0.5 focus:ring-0"
            placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={addTag}
          />
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        {tags.length} / {maxTags} tags. Press Enter or comma to add. 2-30 chars.
      </div>
    </div>
  );
}
