import React, { useState } from 'react';
import { Review } from '../types/restaurant';
import { Star, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

interface ReviewsViewProps {
  reviews: Review[];
  onReviewSubmitted: (review: Review) => void;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({
  reviews,
  onReviewSubmitted,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [dishOrdered, setDishOrdered] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const approvedReviews = reviews.filter((r) => r.status === 'approved');
  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setErrorMessage('Please write a review of at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const newReview = await api.submitReview({
        customerName: customerName.trim(),
        rating,
        dishOrdered: dishOrdered.trim() || undefined,
        comment: comment.trim(),
      });

      onReviewSubmitted(newReview);
      setSuccessMessage(true);
      setCustomerName('');
      setComment('');
      setDishOrdered('');
      setRating(5);
      setTimeout(() => setSuccessMessage(false), 5000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c59b27]">
          Guest Experiences
        </span>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0e3824]">
          Customer Reviews & Testimonials
        </h1>
        <p className="text-sm sm:text-base text-[#4d5e53]">
          Read verified feedback from our guests or share your personal dining experience at The Future Kitchen.
        </p>
      </div>

      {/* Rating Overview Strip */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#2a5e42]/10 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div className="text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <span className="font-display text-5xl font-extrabold text-[#0e3824] tabular-nums">
              {avgRating}
            </span>
            <div>
              <div className="flex items-center text-[#c59b27]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-[#c59b27]" />
                ))}
              </div>
              <span className="text-xs text-[#52645a] block mt-0.5">
                Based on {approvedReviews.length} verified dining reviews
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-wrap items-center justify-center md:justify-end gap-6 text-xs text-[#4b5c51]">
          <div className="text-center">
            <span className="block font-bold text-lg text-[#0e3824] tabular-nums">98%</span>
            <span>Food Quality Score</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-lg text-[#0e3824] tabular-nums">96%</span>
            <span>Packaging & Heat Retention</span>
          </div>
          <div className="text-center">
            <span className="block font-bold text-lg text-[#0e3824] tabular-nums">99%</span>
            <span>Would Recommend</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Reviews List (left 7 cols) & Submit Form (right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Reviews List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display text-2xl font-bold text-[#0e3824]">
            Recent Diner Feedback ({approvedReviews.length})
          </h2>

          <div className="space-y-4">
            {approvedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white p-6 rounded-xl border border-[#2a5e42]/10 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0e3824]">{review.customerName}</h3>
                    {review.dishOrdered && (
                      <span className="text-[11px] text-[#c59b27] font-semibold block mt-0.5">
                        Ordered: {review.dishOrdered}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-[#c59b27]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating ? 'fill-[#c59b27]' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#3e5046] leading-relaxed">
                  "{review.comment}"
                </p>

                <div className="text-[11px] text-slate-400 pt-1">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Submit Review Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-[#2a5e42]/15 shadow-sm space-y-5 sticky top-24">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c59b27]">
              Share Your Opinion
            </span>
            <h2 className="font-display text-xl font-bold text-[#0e3824]">
              Leave a Restaurant Review
            </h2>
            <p className="text-xs text-[#52645a]">
              Your genuine feedback helps us continuously perfect our flavours and service.
            </p>
          </div>

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! Your review has been submitted and published.</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                Overall Rating:
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`Rate ${star} star`}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || rating)
                          ? 'fill-[#c59b27] text-[#c59b27]'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-[#0e3824] ml-2">
                  {rating} of 5 Stars
                </span>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1">
              <label htmlFor="rev-name" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                Your Full Name *
              </label>
              <input
                id="rev-name"
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Dr. Ngozi Okonjo"
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
              />
            </div>

            {/* Dish Ordered */}
            <div className="space-y-1">
              <label htmlFor="rev-dish" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                Dish You Enjoyed (Optional)
              </label>
              <input
                id="rev-dish"
                type="text"
                value={dishOrdered}
                onChange={(e) => setDishOrdered(e.target.value)}
                placeholder="e.g. Party Jollof Rice, Suya, Egusi Soup..."
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
              />
            </div>

            {/* Review Comment */}
            <div className="space-y-1">
              <label htmlFor="rev-comment" className="block text-xs font-semibold text-[#0e3824] uppercase tracking-wider">
                Your Review & Comments *
              </label>
              <textarea
                id="rev-comment"
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on food flavour, portion size, delivery speed..."
                className="w-full p-2.5 text-xs sm:text-sm rounded-md border border-[#2a5e42]/20 bg-[#faf8f5] text-[#1e2d24] focus:outline-none focus:ring-1 focus:ring-[#0e3824]"
                maxLength={500}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#0e3824] hover:bg-[#154e33] text-white font-semibold text-xs uppercase tracking-wider rounded-md transition-colors shadow-sm"
            >
              {submitting ? 'Submitting Review...' : 'Post Customer Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
