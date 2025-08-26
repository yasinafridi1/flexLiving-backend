import { HOSTAWAY_CHANNEL_MAP } from "../config/Constants";

export function normalizeHostaway(rawData, userId) {
  if (!rawData) return [];

  return rawData.map((review) => {
    const categories = (review.reviewCategory || []).map((cat) => ({
      key: cat.category,
      rating: cat.rating ? cat.rating / 2 : null,
    }));

    return {
      id: review?.id,
      type: review?.type || "guest-to-host",
      status: review?.status || "awaiting",
      rating: review?.rating ? review.rating / 2 : null,
      comment: review?.publicReview || review?.privateFeedback || "",
      categories: categories,
      listingId:
        review?.listingMapId || review?.listingId || review?.reservationId,
      channel: HOSTAWAY_CHANNEL_MAP[review?.channelId] || "unknown",
      guestName: review?.guestName || "Anonymous",
      submittedAt: review?.submittedAt
        ? new Date(review?.submittedAt).toISOString()
        : review?.departureDate
        ? new Date(review?.departureDate).toISOString()
        : new Date().toISOString(),
      arrivalDate: review?.arrivalDate
        ? new Date(review?.arrivalDate).toISOString()
        : null,
      departureDate: review?.departureDate
        ? new Date(review?.departureDate).toISOString()
        : null,
      approved: false, // default false, manager can approve
      source: "hostaway",
      listingName: review?.listingName || "Unknown Listing",
      userId: userId,
    };
  });
}
