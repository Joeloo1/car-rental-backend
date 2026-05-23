import React, { useState } from "react";
import { Star, X, Loader2, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import type { ApiError } from "../../types/index";
import { reviewService } from "../../services/review.service.ts";
import "./ReviewModal.css";

interface ReviewModalProps {
  carId: string;
  carTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  carId,
  carTitle,
  onClose,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewService.create(carId, rating, comment);
      toast.success("Thank you for your review!");
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="review-modal-overlay">
      <div className="review-modal-content glass animate-slide-up">
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="review-modal-header">
          <div className="header-icon">
            <MessageSquare size={24} />
          </div>
          <h2>Share Your Experience</h2>
          <p>
            How was your trip with the <strong>{carTitle}</strong>?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-selector">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hover || rating) ? "active" : ""}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={32}
                  fill={star <= (hover || rating) ? "var(--warning)" : "none"}
                  color={
                    star <= (hover || rating)
                      ? "var(--warning)"
                      : "var(--text-muted)"
                  }
                />
              </button>
            ))}
            <span className="rating-label">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent!"}
            </span>
          </div>

          <div className="form-group">
            <label>Tell us more about it</label>
            <textarea
              placeholder="What did you like? How was the host? Any tips for other renters?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="btn-primary-lg w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="spin" size={18} /> Submitting...
              </>
            ) : (
              "Post Review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
