import z from "zod";

export const createAccountSchema = z
  .object({
    name: z
      .string()
      .min(2, "Display name must be at least 2 characters.")
      .max(50),
    email: z.string().email("Invalid email address."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(50),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(50),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

export type CreateAccountValues = z.infer<typeof createAccountSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .max(50),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Display name must be at least 2 characters.")
    .max(50),
  email: z.string().email("Invalid email address."),
  image: z.string().optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
