
import { createTRPCRouter } from "../trpc";
import { publicProcedure } from "../trpc";
import { z } from "zod";
import { priorityEnum, submissionPreferenceEnum } from "~/types/enums";
import { getCategoryResponseSchema, getIssueOptionResponseSchema, getSubCategoryResponseSchema } from "~/types/responseTypes/categories";
import { getComplainInfoResponseSchema } from "~/types/responseTypes/ticketResponses";
import { attachmentSchema } from "~/types/attachments";
import { generateComplainResponseSchema } from "~/types/responseTypes/ticketResponses";
import { responseWithoutDataSchema } from "~/lib/responseSchema";
import { getComplaintLogsResponseSchema } from "~/types/responseTypes/ticketResponses";

export const complaintsRouter = createTRPCRouter({

    // get all categories
    // validated response
    getCategories: publicProcedure.query(async ({ ctx }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/getCategories`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
        });
        const json = await res.json() as unknown;
        console.log("raw response", json);
        const validated = getCategoryResponseSchema.parse(json);
        console.log("validated response", validated);
        return validated;
    }),

    // get subcategories by category ID
    getSubCategories: publicProcedure.input(z.object({ categoryId: z.string() })).query(async ({ ctx, input }) => {
            const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
            const res = await fetch(`${BASE_URL}/getSubCategories/${input.categoryId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ctx.token}`,
                },
            });
            const json = await res.json() as unknown;
            console.log("raw response", json);
            const validated = getSubCategoryResponseSchema.parse(json);
            console.log("validated response", validated);
            return validated;
        }),

    // get issue options by subcategory ID
    getIssueOptions: publicProcedure.input(z.object({ subCategoryId: z.string() })).query(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/getIssueOption/${input.subCategoryId}`, {
            headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${ctx.token}`,
                },
            });
            const json = await res.json() as unknown;
            console.log("raw response", json);
            const validated = getIssueOptionResponseSchema.parse(json);
            console.log("validated response", validated);
            return validated;
        }),

    // get complaint info by complaint ID
    // validated response
    getComplainInfo: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/getComplainInfo/${input.id}`, {
            headers: {
                Authorization: `Bearer ${ctx.token}`,
                },
                cache: "no-store",
            });
            const json = await res.json() as unknown;
            console.log("raw response of complaint info", json);
            const validated = getComplainInfoResponseSchema.parse(json);
            console.log("validated response of complaint info", validated);
            console.log("workers assigned to this complaint", validated.data?.complaint?.assignedWorkers);
            return validated;
        }),


    // registrering a new complaint 
    generateComplain: publicProcedure.input(z.object({
        categoryId: z.string(),
        subCategoryId: z.string(),
        issueOptionId: z.string(),
        customDescription: z.string().optional(),
        submissionPreference: submissionPreferenceEnum,
        priority: priorityEnum,
        title: z.string().min(1, "Title is required"),
        device: z.string().min(1, "Device is required"),
        uploads: z.array(attachmentSchema).optional().default([]),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/generate`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of generate complain", json);
        const validated = generateComplainResponseSchema.parse(json);
        console.log("validated response of generate complain", validated);
        return validated;
    }),

    // assign complaint to a worker 
    assignComplainToWorkers: publicProcedure.input(z.object({
        complaintId: z.number(),
        workerId: z.array(z.number()),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/assignWorker`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of assign complain to worker", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of assign complain to worker", validated);
        return validated;
    }),


    // forward complaint to a team
    forwardComplainToTeam: publicProcedure.input(z.object({
        teamId: z.number(), 
        complaintId: z.string(),
        comment: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/forwardComplaint`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of forward complain to team", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of forward complain to team", validated);
        // const validated = forwardComplainToTeamResponseSchema.parse(json);
        // console.log("validated response of forward complain to team", validated);
        return validated;
    }),

    // get complaint logs
    getComplaintLogs: publicProcedure.input(z.object({ complaintId: z.string() })).query(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/getComplainLogs/${input.complaintId}`, {
            headers: {
                Authorization: `Bearer ${ctx.token}`,
            },
        });
        const json = await res.json() as unknown;
        console.log("raw response of get complaint logs", json);
        const validated = getComplaintLogsResponseSchema.parse(json);
        console.log("validated response of get complaint logs", validated);
        return validated;
    }),

    // delete a complaint
    deleteComplaint: publicProcedure.input(z.object({ complaintId: z.string() })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/deleteComplaint/${input.complaintId}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
        });
        const json = await res.json() as unknown;
        console.log("raw response of delete complaint", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of delete complaint", validated);
        return validated;
    }),

    // resolve a complaint 
    resolveComplaint: publicProcedure.input(z.object({
        complaintId: z.string(),
        resolvedSummary: z.string().min(1, "Resolution summary is required"),
        uploads: z.array(attachmentSchema).optional().default([]),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/resolveComplaint`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of resolve complaint", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of resolve complaint", validated);
        return validated;
    }),

    // add worker to existing assignment of ticket
    addWorkerToAssignment: publicProcedure.input(z.object({
        complaintId: z.number(),
        workerId: z.array(z.number()),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/addWorker`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of add worker to assignment", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of add worker to assignment", validated);
        return validated;
    }),

    // give feedback on a complaint
    giveFeedback: publicProcedure.input(z.object({
        complaintId: z.string(),
        feedback: z.string().min(1, "Feedback is required"),    
        score: z.number().min(1, "Score must be at least 1").max(5, "Score must be at most 5"),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/feedback`;
        const res = await fetch(`${BASE_URL}/submitFeedback`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of give feedback", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of give feedback", validated);
        return validated;
    }),

    // close ticket 
    closeTicket: publicProcedure.input(z.object({
        complaintId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/closeComplaint`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of close ticket", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of close ticket", validated);
        return validated;
    }),

    // reopen ticket
    reopenTicket: publicProcedure.input(z.object({
    complaintId: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/reopenComplaint`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of reopen ticket", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of reopen ticket", validated);
        return validated;
    }),

    // activate a ticket in queue
    activateTicketInQueue: publicProcedure.input(z.object({
        complaintId: z.number(),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/activateComplaint`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of activate ticket in queue", json);
        const validated = responseWithoutDataSchema.parse(json);
        console.log("validated response of activate ticket in queue", validated);
        return validated;
    }),


    // replace assignment of a ticket
    replaceAssignment: publicProcedure.input(z.object({
        complaintId: z.number(),
        currentWorkerId: z.number(),
        newWorkerId: z.number(),
        reason: z.string(),
    })).mutation(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/complain`;
        const res = await fetch(`${BASE_URL}/changeWorker`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${ctx.token}`,
            },
            body: JSON.stringify(input),
        });
        const json = await res.json() as unknown;
        console.log("raw response of replace assignment", json);
        // const validated = responseWithoutDataSchema.parse(json);
        // console.log("validated response of replace assignment", validated);
        return json;
    }),
});
