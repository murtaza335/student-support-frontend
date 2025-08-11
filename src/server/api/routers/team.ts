import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getTeamsResponseSchema, getTeamWorkersResponseSchema } from "~/types/responseTypes/teamResponses";
import { getTeamHierarchyResponseSchema } from "~/types/responseTypes/adminDashResponses/adminDashResponses";

export const teamsRouter = createTRPCRouter({
    // This procedure fetches all teams
    getTeams: publicProcedure.query(async ({ ctx }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/team`;
        const res = await fetch(`${BASE_URL}/getTeams`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${ctx.token}`,
                "Content-Type": "application/json",
            },
        });
        const json = await res.json() as unknown;
        console.log("raw TEAM GET response", json);
        const validated = getTeamsResponseSchema.parse(json);
        console.log("validated response", validated);
        return validated;
    }),


    // to fetch the worker of a team
    getWorkersWhileAssignment: publicProcedure
        .input(z.object({ complaintId: z.number() }))
        .query(async ({ ctx, input }) => {
            const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/team`;
            const res = await fetch(`${BASE_URL}/getWorkers/${input.complaintId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${ctx.token}`,
                    "Content-Type": "application/json",
                },
            });
            const json = await res.json() as unknown;
            console.log("raw response workers", json);
            const validated = getTeamWorkersResponseSchema.parse(json);
            console.log("validated response", validated);
            return validated;
        }),



    myTeam: publicProcedure
        .query(async ({ ctx }) => {
            const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/team`;
            const res = await fetch(`${BASE_URL}/myTeam`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${ctx.token}`,
                    "Content-Type": "application/json",
                },
            });
            const json = await res.json() as unknown;
            console.log("raw response", json);
            const validated = getTeamWorkersResponseSchema.parse(json);
            console.log("validated response", validated);
            console.log("my team workers", validated?.data?.workers);
            return validated;
        }),

    getTeamHierarchy: publicProcedure
        .query(async ({ ctx }) => {
            const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/team`;
            const res = await fetch(`${BASE_URL}/getTeamHierarchy`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${ctx.token}`,
                    "Content-Type": "application/json",
                },
            });
            const json = await res.json() as unknown;
            console.log("raw response", json);
            const validated = getTeamHierarchyResponseSchema.parse(json);
            console.log("validated response", validated);
            return validated;
        }),
});