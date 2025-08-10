import z from 'zod';

export const subCategorySchema = z.object({
    id: z.number(),
    name: z.string(),
});

export type SubCategory = z.infer<typeof subCategorySchema>;
