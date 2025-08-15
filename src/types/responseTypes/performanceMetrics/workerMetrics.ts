import { z } from "zod";
import { responseSchema } from "~/lib/responseSchema";

const workerSchema = z.object({
  teamWorkerId: z.number(),
  teamId: z.number(),
  points: z.number(),
  currentStatus: z.string(),
});

const timeMetricsSchema = z.object({
  totalCompleted: z.number().nullable(),
  averageResolutionHours: z.number().nullable(),
  minResolutionHours: z.number().nullable(),
  maxResolutionHours: z.number().nullable(),
});

const statusCountsSchema = z.object({
  totalAssigned: z.number().nullable(),
  active: z.number().nullable(),
  inQueue: z.number().nullable(),
  resolved: z.number().nullable(),
});

const ratingsSchema = z.object({
  totalRatings: z.number().nullable(),
  averageRating: z.number().nullable(),
  minRating: z.number().nullable(),
  maxRating: z.number().nullable(),
});

const reopenMetricsSchema = z.object({
  totalResolved: z.number().nullable(),
  reopenedCount: z.number().nullable(),
  reopenPercentage: z.number().nullable(),
});

const priorityBreakdownSchema = z.array(
  z.object({
    priority: z.string(),
    count: z.string(),
    avg_hours: z.string().nullable(),
  })
);

const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const workerMetricsDataSchema = z.object({
  worker: workerSchema,
  timeMetrics: timeMetricsSchema,
  statusCounts: statusCountsSchema,
  ratings: ratingsSchema,
  reopenMetrics: reopenMetricsSchema,
  priorityBreakdown: priorityBreakdownSchema,
  dateRange: dateRangeSchema,
});

export const workerMetricsResponseSchema = responseSchema(workerMetricsDataSchema);

