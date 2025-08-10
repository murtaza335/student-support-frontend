import z from 'zod';

export const issueOptionSchema = z.object({
    id: z.number(),
    name: z.string(),
});

export type IssueOption = z.infer<typeof issueOptionSchema>;