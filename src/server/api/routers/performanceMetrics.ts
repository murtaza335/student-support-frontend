import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { workerMetricsResponseSchema } from "~/types/responseTypes/performanceMetrics/workerMetrics";
import { getTeamPerformanceSchema } from "~/types/responseTypes/performanceMetrics/teamMetrics";
import { singleTeamPerformanceSchema } from "~/types/responseTypes/performanceMetrics/singleTeamPerformance";
import { overallComplaintsStatsSchema } from "~/types/responseTypes/performanceMetrics/overallStats";

export const performanceMetricsRouter = createTRPCRouter({
  // Define your API routes here

  getWorkerPerformanceMetrics: publicProcedure
    .input(z.object({ workerId: z.string(), 
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable() }))
    .query(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/performance`;
        // now we send the startdate and endDate as query parameters
        const queryParams = new URLSearchParams();
        if (input.startDate && input.startDate !== '') {
            queryParams.append('startDate', input.startDate);
        }
        if (input.endDate && input.endDate !== '') {
            queryParams.append('endDate', input.endDate);
        }
        const url = `${BASE_URL}/worker/${input.workerId}?${queryParams.toString()}`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
            Authorization: `Bearer ${ctx.token}`,
            "Content-Type": "application/json",
            },
        });
    
        if (!res.ok) {
            throw new Error("Failed to fetch worker performance metrics");
        }
    
        const json = await res.json() as unknown;
        console.log("raw response of worker metrics: ", json);
        return workerMetricsResponseSchema.parse(json);
        }),

    getTeamComparisonStats: publicProcedure
    .input(z.object({
        startDate: z.string().optional().nullable(),
        endDate: z.string().optional().nullable()
    }))
    .query(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/performance`;
        const queryParams = new URLSearchParams();
        if (input.startDate && input.startDate !== '') {
            queryParams.append('startDate', input.startDate);
        }
        if (input.endDate && input.endDate !== '') {
            queryParams.append('endDate', input.endDate);
        }
        const url = `${BASE_URL}/stats/team-comparison?${queryParams.toString()}`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${ctx.token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch team comparison stats");
        }

        const json = await res.json() as unknown;
        console.log("raw response of team comparison stats: ", json);
        const validated = getTeamPerformanceSchema.parse(json);
        return validated;
    }),


    getSingleTeamPerformanceMetric : publicProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/performance`;
        const url = `${BASE_URL}/team/${input.teamId}`;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${ctx.token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) {
            throw new Error("Failed to fetch single team performance metric");
        }

        const json = await res.json() as unknown;
        console.log("raw response of single team performance metric: ", json);
        const validated = singleTeamPerformanceSchema.parse(json);
        return validated;
    }),

        getOverallStats: publicProcedure
        .query(async ({ctx}) => {
            const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/performance`;
            const url = `${BASE_URL}/stats/overall`;
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${ctx.token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                throw new Error("Failed to fetch overall stats");
            }

            const json = await res.json() as unknown;
            console.log("raw response of overall stats: ", json);
            const validated = overallComplaintsStatsSchema.parse(json);
            return validated;

        }),


        // getLocationBasedStats: publicProcedure
        // .input(z.object({
        //     locationId: z.string()
        // }))
        // .query(async ({ ctx, input }) => {
        //     const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/performance`;
        //     const url = `${BASE_URL}/stats/location/${input.locationId}`;
        //     const res = await fetch(url, {
        //         method: "GET",
        //         headers: {
        //             Authorization: `Bearer ${ctx.token}`,
        //             "Content-Type": "application/json",
        //         },
        //     });

        //     if (!res.ok) {
        //         throw new Error("Failed to fetch location-based stats");
        //     }

        //     const json = await res.json() as unknown;
        //     console.log("raw response of location-based stats: ", json);
        //     const validated = locationBasedStatsSchema.parse(json);
        //     return validated;
        // })
});
