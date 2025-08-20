// import { url } from "inspector";
import { z } from "zod";

// now we will extend the complaint schema to include uploads
import ticketSchema from "~/types/tickets/ticket";
import { workerComplaintStatusEnum } from "../enums";

// extending the ticket schema to include uploads
export const ticketDetailsSchema = ticketSchema.extend({
  issueOptionId: z.number(),
  customDescription: z.string().optional().nullable(),
  device: z.string().optional().nullable(),
  issueOptionName: z.string(),
  escalationLevel: z.number().min(0).max(3).optional().nullable(),
  teamId: z.number().min(1),
  location: z.string(),
  assignedWorkers: z.object({
    workers: z.array(z.object({
      workerId: z.number(),
      workerName: z.string(),
      workerPic: z.string(),
      workerStatus: workerComplaintStatusEnum.optional(),
    })),
    currentWorkerStatus: workerComplaintStatusEnum.optional().nullable(),
  }).optional(),
  feedbackGiven: z.boolean().default(false),
  resolvedAt: z.string().optional().nullable(),

});

// type for the extended ticket schema
export type ticketDetails = z.infer<typeof ticketDetailsSchema>;
