import z from "zod";
export const signUpValidate = z.object({
  email: z.string().email({ message: "Enter a valid email" }),
  password: z.string().min(6, { message: "Password length < 8" }),
  name: z.string().min(1, { message: "Enter a valid name" }),
});
