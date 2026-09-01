import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
  currentRating?: number;
  onRate: (rating: number) => Promise<void>;
  disabled?: boolean;
}

export default function RatingInput({ currentRating = 0, onRate, disabled = false }: RatingInputProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (rating: number) => {
    if (disabled || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRate(rating);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled || isSubmitting}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          onClick={() => handleRate(star)}
          className={`focus:outline-none transition-colors ${
            disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          }`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hoverRating || currentRating)
                ? 'fill-amber-500 text-amber-500'
                : 'text-fg-subtle'
            }`}
          />
        </button>
      ))}
      {isSubmitting && <span className="text-xs text-fg-subtle ml-2">Submitting...</span>}
    </div>
  );
}
