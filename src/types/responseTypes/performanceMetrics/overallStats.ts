import { z } from "zod";
import { responseSchema } from "~/lib/responseSchema";

const overallComplaintsStatsDataSchema = z.object({
    total: z.string(),
    reopened: z.string(),
    resolved: z.string(),
    closed: z.string(),
    waiting_assignment: z.string(),
    in_progress: z.string(),
    in_queue: z.string(),
    escalated_level_1: z.string(),
    escalated_level_2: z.string(),
    reopened_transitions: z.string(),
    date_range: z.object({
      start_date: z.string().datetime(), // Validates ISO 8601 datetime format
      end_date: z.string().datetime(),
    }),
  });

export const overallComplaintsStatsSchema = responseSchema(overallComplaintsStatsDataSchema);  
