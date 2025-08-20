import z from "zod";
import { responseSchema } from "~/lib/responseSchema";
import { userRolesEnum } from "~/types/enums";

const getMyInfoDataSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    picUrl: z.string().optional().nullable(),
    officeNumber: z.string().optional().nullable(),
    department: z.string().optional().nullable(),
    designation: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    role: userRolesEnum,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    locationName: z.string().max(100).optional().nullable(),
});

const getUserInfoDataSchema = z.object({
    userId: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    picUrl: z.string().nullable(),
    phone: z.string(),
    role: userRolesEnum,
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

export const getMyInfoResponseSchema = responseSchema(getMyInfoDataSchema);
export const getUserInfoResponseSchema = responseSchema(getUserInfoDataSchema);
