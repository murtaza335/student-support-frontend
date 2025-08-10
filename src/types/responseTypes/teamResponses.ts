// import { stat } from "fs";
import {boolean, z} from "zod";
import { responseSchema } from "~/lib/responseSchema";
import { teamWorkerStatusEnum } from "../enums";
// import { P } from "node_modules/framer-motion/dist/types.d-Bq-Qm38R";

export const getTeamDataSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const getTeamResponseSchema = z.object({
    data: getTeamDataSchema,
    message: z.string(),
    success: z.boolean(),
});

export const getTeamWorkersDataSchema = z.object({
    workers : z.array(z.object({
        workerId: z.number(),
        workerUserId: z.string(),
        workerPic: z.string().nullable().optional(),
        teamId: z.number(),
        workerName: z.string(),
        status: teamWorkerStatusEnum,
        near: boolean().optional(),
        queueCount: z.string().optional(),
        isAssignedToThisComplaint: boolean().optional(),
        Points: z.number().optional(),
    }).optional()).optional(),

    manager: z.object({
        managerId: z.string(),
        managerName: z.string(),
    }).optional(),
});

export const getTeamsDataSchema = z.object({
 teams: z.array(z.object({
    id: z.number(),
    name: z.string(),
    managerId: z.string().nullable(),
    managerName: z.string().nullable(),
})) });


export const getTeamsResponseSchema = responseSchema(getTeamsDataSchema);
export const getTeamWorkersResponseSchema = responseSchema(getTeamWorkersDataSchema);

export type GetTeamResponse = z.infer<typeof getTeamResponseSchema>;
export type GetTeamData = z.infer<typeof getTeamDataSchema>;
export type GetTeamWorkersResponse = z.infer<typeof getTeamWorkersResponseSchema>;
export type GetTeamWorkersData = z.infer<typeof getTeamWorkersDataSchema>;
export type GetTeamsResponse = z.infer<typeof getTeamsResponseSchema>;
export type GetTeamsData = z.infer<typeof getTeamsDataSchema>;