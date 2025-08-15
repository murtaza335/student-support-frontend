import { z } from "zod";
import { responseSchema } from "~/lib/responseSchema";

// Team schema
export const teamSchema = z.object({
  id: z.number(),
  name: z.string(),
  managerId: z.string(),
  description: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Status counts schema
export const statusCountsSchema = z.object({
  total_complaints: z.string().nullable(),
  waiting_assignment: z.string().nullable(),
  in_progress: z.string().nullable(),
  in_queue: z.string().nullable(),
  resolved: z.string().nullable(),
  closed: z.string().nullable(),
});

// Time metrics schema
export const timeMetricsSchema = z.object({
  totalResolved: z.number().nullable(),
  averageResolutionHours: z.number().nullable(),
});

// Ratings schema
export const ratingsSchema = z.object({
  totalRatings: z.number().nullable(),
  averageRating: z.number().nullable(),
});

// Reopen metrics schema
export const reopenMetricsSchema = z.object({
  totalResolved: z.number().nullable(),
  reopenedCount: z.number().nullable(),
  reopenPercentage: z.number().nullable(),
});

// Worker performance schema
export const workerPerformanceSchema = z.object({
  user_id: z.string(),
  worker_name: z.string(),
  team_worker_id: z.number(),
  points: z.number(),
  assigned_count: z.string(),
  resolved_count: z.string(),
  avg_hours: z.string().nullable(),
});

// Priority breakdown schema
export const priorityBreakdownSchema = z.object({
  priority: z.string(),
  count: z.string(),
  avg_hours: z.string().nullable(),
});

// Category breakdown schema
export const categoryBreakdownSchema = z.object({
  category_name: z.string(),
  count: z.string(),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// Main schema composing all parts
export const teamPerformanceDataSchema = z.object({
  team: teamSchema,
  statusCounts: statusCountsSchema,
  timeMetrics: timeMetricsSchema,
  ratings: ratingsSchema,
  reopenMetrics: reopenMetricsSchema,
  workerPerformance: z.array(workerPerformanceSchema),
  priorityBreakdown: z.array(priorityBreakdownSchema),
  categoryBreakdown: z.array(categoryBreakdownSchema),
  dateRange: dateRangeSchema,
});

export const singleTeamPerformanceSchema = responseSchema(teamPerformanceDataSchema);
