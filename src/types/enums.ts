import { z } from "zod";

export const userRolesEnum = z.enum(["admin", "employee", "manager", "worker", "user"]);
export type UserRoles = z.infer<typeof userRolesEnum>;

export const supportStaffRolesEnum = z.enum([ "manager", "worker"]);
export type supportStaffRoles = z.infer<typeof supportStaffRolesEnum>;

export const submissionPreferenceEnum = z.enum(["remote", "on_site", "call_back"]);
export type SubmissionPreference = z.infer<typeof submissionPreferenceEnum>;

export const complaintStatusEnum = z.enum(["waiting_assignment", "assigned", "in_progress", "resolved", "closed", "escalated_level_1",
  "escalated_level_2","reopened", "in_queue", "change_worker"]);
export type ComplaintStatus = z.infer<typeof complaintStatusEnum>;

export const priorityEnum = z.enum(["low", "medium", "high", "urgent"]);
export type Priority = z.infer<typeof priorityEnum>;

export const teamWorkerStatusEnum = z.enum(["active", "busy"]);
export type TeamWorkerStatus = z.infer<typeof teamWorkerStatusEnum>;

export const notificationStatusEnum = z.enum(["sent", "delivered", "read"]);
export type NotificationStatus = z.infer<typeof notificationStatusEnum>;

export const attachmentRoleEnum = z.enum(["worker", "employee"]);
export type AttachmentRole = z.infer<typeof attachmentRoleEnum>;

export const attachmentExtensionEnum = z.enum(["jpg", "jpeg", "png", "pdf", ".mp4", "mp3", "docx", "xlsx"]);
export type AttachmentExtension = z.infer<typeof attachmentExtensionEnum>;

export const workerComplaintStatusEnum = z.enum(["active","in_queue", "resolved"]);
export type WorkerComplaintStatus = z.infer<typeof workerComplaintStatusEnum>;
