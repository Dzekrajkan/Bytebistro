import z from "zod";

export const SignInSchema = z.object({
    email: z.email(),
    password: z.string().min(8, "Minimum 8 characters")
})


export type SignInFormData = z.infer<typeof SignInSchema>