"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { StarRating } from "@/components/ui/StarRating";

interface PendingReview {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  user: { firstName: string; lastName: string };
  product: { name: string; slug: string };
}

export default function AdminReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<PendingReview[]>("/reviews/admin/pending", { token })
      .then(setReviews)
      .catch(() => setError("Couldn't reach the backend API. Start the Express server to moderate live reviews."));
  }, [token]);

  async function moderate(id: string, approve: boolean) {
    if (!token) return;
    try {
      await apiFetch(`/reviews/admin/${id}/moderate`, { method: "PATCH", token, body: JSON.stringify({ approve }) });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to moderate review.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Review Moderation</h1>

      {error && <p className="mt-4 rounded-lg bg-beige-100 p-4 text-sm text-ink-700 dark:bg-ink-700 dark:text-beige-100/80">{error}</p>}

      {!error && reviews.length === 0 && <p className="mt-6 text-sm text-ink-700/60 dark:text-beige-100/50">No pending reviews to moderate.</p>}

      <div className="mt-6 space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="card-luxe p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  {r.user.firstName} {r.user.lastName} on <span className="text-gold-600">{r.product.name}</span>
                </p>
                <StarRating rating={r.rating} />
                {r.title && <p className="mt-1 text-sm font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-ink-700/75 dark:text-beige-100/70">{r.comment}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => moderate(r.id, true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                  <Check size={16} />
                </button>
                <button onClick={() => moderate(r.id, false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
