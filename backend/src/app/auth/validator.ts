// use zod for user data validation
import { z } from "zod";

export const signupSchema = z.object({
    fullname: z.string().min(3, "Full name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});
