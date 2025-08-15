import { z } from "zod";
import { responseSchema } from "~/lib/responseSchema";

const teamComparisonSchema = z.object({
  team_id: z.number(),
  team_name: z.string(),
  total_complaints: z.string(), // comes as string in your data
  resolved_complaints: z.string(),
  avg_resolution_hours: z.string().nullable(), // can be null
  total_ratings: z.string(),
  avg_rating: z.string().nullable(), // can be null
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime(), // ISO datetime string
  endDate: z.string().datetime(),
});

export const getTeamPerformanceDataSchema = z.object({
  teamComparison: z.array(teamComparisonSchema),
  dateRange: dateRangeSchema,
});

export const getTeamPerformanceSchema = responseSchema(getTeamPerformanceDataSchema);