interface StarRatingProps {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, readonly = false }: StarRatingProps) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''} ${readonly ? 'readonly' : ''}`}
          onClick={() => !readonly && onChange?.(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
