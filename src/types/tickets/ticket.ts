import {z} from "zod";
import {submissionPreferenceEnum, complaintStatusEnum, priorityEnum, workerComplaintStatusEnum} from "../enums";


export const ticketSchema = z.object({
  id: z.number(),
  title: z.string().max(200),
  employeeId: z.string().min(1),
  employeeName: z.string().max(150),
  categoryId: z.number(),
  subCategoryId: z.number(),
  submissionPreference: submissionPreferenceEnum,
  status: complaintStatusEnum,
  priority: priorityEnum,
  createdAt: z.string(),
  categoryName: z.string(),
  subCategoryName: z.string(),
  feedbackGiven: z.boolean().optional().nullable(),
  currentWorkerStatus: workerComplaintStatusEnum.optional(),

});

export const workerTicketSchema = ticketSchema.extend({
  currentWorkerStatus: workerComplaintStatusEnum,
});

export const EmployeeTicketSchema = ticketSchema.extend({
  feedbackGiven: z.boolean(),
});

export default ticketSchema;

export type ticket = z.infer<typeof ticketSchema>;
export type employeeticket = z.infer<typeof EmployeeTicketSchema>;
