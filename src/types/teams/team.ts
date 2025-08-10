import {z} from 'zod';

export const teamSchema = z.object({
    id: z.number(),
    name: z.string(),
    managerId: z.string(),
    managerName: z.string(),
    description: z.string().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// export const team = z.object({
//     id: z.number(),
//     name: z.string(),
//     managerId: z.number(),
//     managerName: z.string(),
//     description: z.string().optional(),
//     createdAt: z.string(),
//     updatedAt: z.string(),
// });



export type Team = z.infer<typeof teamSchema>;