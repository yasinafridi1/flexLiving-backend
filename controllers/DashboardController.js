import HostawayModel from "../models/HostawayModel.js";
import ReviewModel from "../models/ReviewModel.js";
import AsyncWrapper from "../utils/AsyncWrapper.js";
import SuccessMessage from "../utils/SuccessMessage.js";

export const dashboardAnalytics = AsyncWrapper(async (req, res, next) => {
  const hostaway = await HostawayModel.findOne({ userId: req.user._id });
  if (!hostaway || hostaway.dataStatus !== "completed") {
    return next(new Error("Hostaway data is not completed", 400));
  }

  const analytics = await ReviewModel.aggregate([
    { $match: { userId: req.user._id } },

    // Floor the rating to nearest integer
    {
      $addFields: {
        flooredRating: { $floor: "$rating" },
      },
    },

    {
      $facet: {
        totalReviews: [{ $count: "count" }],
        approvedReviews: [{ $match: { approved: true } }, { $count: "count" }],
        notApprovedReviews: [
          { $match: { approved: false } },
          { $count: "count" },
        ],
        statusCount: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],

        // Channels chart data
        channelsChart: [
          {
            $group: {
              _id: "$channel",
              count: { $sum: 1 },
            },
          },
        ],

        // Ratings chart data
        ratingsChart: [
          {
            $group: {
              _id: "$flooredRating",
              count: { $sum: 1 },
            },
          },
        ],
      },
    },

    {
      $project: {
        totalReviews: { $arrayElemAt: ["$totalReviews.count", 0] },
        approvedReviews: { $arrayElemAt: ["$approvedReviews.count", 0] },
        notApprovedReviews: { $arrayElemAt: ["$notApprovedReviews.count", 0] },
        statusCount: 1,
        channelsChart: 1,
        ratingsChart: 1,
      },
    },
  ]);

  const result = analytics[0];

  // Fill 0 for missing counts
  result.totalReviews = result.totalReviews || 0;
  result.approvedReviews = result.approvedReviews || 0;
  result.notApprovedReviews = result.notApprovedReviews || 0;
  result.statusCount = result.statusCount || [];
  result.channelsChart = result.channelsChart || [];
  result.ratingsChart = result.ratingsChart || [];

  // Optional: compute percentages for charts
  const total = result.totalReviews || 1; // avoid division by zero

  result.channelsChart = result.channelsChart.map((c) => ({
    channel: c._id,
    count: c.count,
    percentage: ((c.count / total) * 100).toFixed(2),
  }));

  result.ratingsChart = result.ratingsChart.map((r) => ({
    rating: r._id,
    count: r.count,
    percentage: ((r.count / total) * 100).toFixed(2),
  }));

  return SuccessMessage(res, "Dashboard data fetched successfully", { result });
});
