import { z } from "zod";

export const zodRule = {
  orgName: z.string().trim().max(30).min(5),
  adminName: z.string().trim().max(30).min(5),
  email: z.email().trim().toLowerCase(),
  password: z.string().trim().min(8, "Min 8 chars required").max(30),
  confirmPassword: z.string(),
};
