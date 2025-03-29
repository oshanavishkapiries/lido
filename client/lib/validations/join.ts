import * as z from "zod";

export const joinFormSchema = z.object({
  code: z
    .string()
    .min(6, { message: "Code must be at least 6 characters" })
    .max(10, { message: "Code cannot exceed 10 characters" })
    .regex(/^[A-Za-z0-9]+$/, { message: "Code must contain only letters and numbers" }),
}); 