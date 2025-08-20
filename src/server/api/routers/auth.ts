
// imports
import { z } from "zod";
import { responseWithoutDataSchema } from "~/lib/responseSchema";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// schema imports 
import { generateCodesResponseSchema, loginCheckResponseSchema } from "~/types/responseTypes/authResponses";

// the auth router
// this router handles all the authentication related operations
export const authRouter = createTRPCRouter({  
  // this is to complete the profile of a user
  // this is called when a user signs in for the first time
  completeProfile: publicProcedure
    .input(z.object(
      {
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        locationId: z.string(),
        department: z.string(),
        designation: z.string(),
        officeNumber: z.string(),
        picUrl: z.string().optional(),
      }
    ))
    .mutation(async ({ ctx, input }) => {

      const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;

      const res = await fetch(`${BASE_URL}/addProfile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const json = await res.json() as unknown;
      console.log(json);
      const validated = responseWithoutDataSchema.parse(json);
      console.log("validated response of complete profile", validated);
      return validated;
    }),

  // this is to complete the profile for the staff member
  completeProfileStaff: publicProcedure
    .input(z.object(
      {
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        role: z.string(),
        teamId: z.string(),
        picUrl: z.string().optional(),
      }))
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;
      const res = await fetch(`${BASE_URL}/addProfileStaff`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error('Backend error:', err);
        throw new Error(`Failed to submit profile: ${res.status}`);
      }
      const json = await res.json() as unknown;
      const validated = responseWithoutDataSchema.parse(json);
      console.log("validated response of complete profile staff", validated);
      return validated;
    }),

  // this is to approve a user
  // calling this when the admin approves a user (from the admin dashboard)
  approveUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;
      const res = await fetch(`${BASE_URL}/approve-user/${input.id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.token}`,
        },
      });
      const json = await res.json() as unknown;
      console.log("raw response of approve user", json);
      const validated = responseWithoutDataSchema.parse(json);
      console.log("validated response of approve user", validated);
      return validated;
    }),


  // this is to login if the user forgots his password and uses the previously generated codes at the time of profile completion
  loginWithCode: publicProcedure
    .input(z.object({ code: z.string(), email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;
      const res = await fetch(`${BASE_URL}/login-with-code`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: input.code, email : input.email }),
        credentials: "include",
      });
      const json = await res.json() as unknown;
      console.log("raw response of login with code", json);
      const validated = responseWithoutDataSchema.parse(json);
      console.log("validated response of login with code", validated);
      return validated;
    }),


  // this is to update the password after the user logs in with the code
  updatePassword: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;
      const res = await fetch(`${BASE_URL}/update-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ctx.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        credentials: "include",
      });
      const json = await res.json() as unknown;
      console.log("raw response of update password", json);
      const validated = responseWithoutDataSchema.parse(json);
      console.log("validated response of update password", validated);
      return validated;
    }),

  // this is to check if the user exists and is approved
  // calling it when the user signs in
  // this will redirect the user to the appropriate page based on the response
  loginCheck: publicProcedure.query(async ({ ctx }) => {
    const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;
    const res = await fetch(`${BASE_URL}/login-check`, {
      headers: {
        Authorization: `Bearer ${ctx.token}`,
      },
    });

    const json = await res.json() as unknown;
    console.log('loginCheck raw response:', json); // Add this for debugging
    const validated = loginCheckResponseSchema.parse(json);
    // console.log('loginCheck response:', validated);
    return validated;
  }),


  // this is to generate codes for the user (when the user completes and submits his profile )
  generateCodes: publicProcedure.mutation(async ({ ctx }) => {
    const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth`;
    const res = await fetch(`${BASE_URL}/generate-codes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ctx.token}`,
      },
    });
    
    const json = await res.json() as unknown;
    console.log('generateCodes raw response:', json); // Add this for debugging
    const validated = generateCodesResponseSchema.parse(json);
    // console.log('generateCodes response:', validated);
    return validated;
  }),
});

