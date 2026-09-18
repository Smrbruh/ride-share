"use client";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}
export function StarRating({ value, onChange, readOnly }: StarRatingProps) {
  return (
    <div role="radiogroup" aria-label="Star rating" className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={cn("transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded", !readOnly && "hover:scale-110")}
        >
          <Star className={cn("h-6 w-6", star <= value ? "fill-accent text-accent" : "text-muted-foreground")} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
