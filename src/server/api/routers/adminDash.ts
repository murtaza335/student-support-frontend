
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { responseWithoutDataSchema } from "~/lib/responseSchema";
import { unapprovedRegistrationsResponseSchema } from "~/types/responseTypes/adminDashResponses/adminDashResponses";
import { getAllUsersResponseSchema } from "~/types/user/allUsersSchema";

export const adminDashRouter = createTRPCRouter({
    // Add your admin dashboard related procedures here

    // fetch all unapproved user registrations
    getUnapprovedRegistrations: publicProcedure.query(async ({ ctx }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dash`;
        const res = await fetch(`${BASE_URL}/getUnapprovedUsers`, {
            headers: {
                Authorization: `Bearer ${ctx.token}`,
                "Content-Type": "application/json",
            },
        });
        const json = await res.json() as unknown;
        console.log("raw response", json);
        console.log("unapproved registrations", json);
        const validated = unapprovedRegistrationsResponseSchema.parse(json);
        // if (!validated?.data?.success) {
        //     console.error("Validation error", validated.error);
        //     throw new Error("Invalid response from API");
        // }
        return validated;
    }),

    // approve the user 
    approveUser: publicProcedure
        .input(z.object({ USERID: z.string() }))
        .mutation(async ({ ctx, input }) => { 
            const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;
            const res = await fetch(`${BASE_URL}/approve-user`, {    
                method: "POST",
                headers: {
                    Authorization: `Bearer ${ctx.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ USERID: input.USERID }),
            });
            const json = await res.json() as unknown;
            console.log("raw response of approve user", json);
            const validated = responseWithoutDataSchema.parse(json);
            console.log("validated response of approve user", validated);
            return validated;

        }),


        // reject a user
    rejectUser: publicProcedure
        .input(z.object({ USERID: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;
            const res = await fetch(`${BASE_URL}/reject-user`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${ctx.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ USERID: input.USERID }),
            });
            const json = await res.json() as unknown;
            console.log("raw response of reject user", json);
            const validated = responseWithoutDataSchema.parse(json);
            console.log("validated response of reject user", validated);
            return validated;
        }),

        // getAll users 
    getAllUsers: publicProcedure.query(async ({ ctx }) => {
        const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dash`;
        const res = await fetch(`${BASE_URL}/getAllUsers`, {
            headers: {
                Authorization: `Bearer ${ctx.token}`,
                "Content-Type": "application/json",
            },
        });
        const json = await res.json() as unknown;
        console.log("raw response of get all users", json);
        const validated = getAllUsersResponseSchema.parse(json);
        console.log("validated response of get all users", validated);
        return validated;
    }),


});

