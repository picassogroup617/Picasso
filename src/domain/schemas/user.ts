import { z } from "zod";
import { Role } from "@/domain/entities/role";

const nameSchema = z.string().trim().min(1, "Name is required").max(120);
const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email").max(254);
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");
const roleSchema = z.enum([Role.ADMIN, Role.EDITOR, Role.VIEWER]);

export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: nameSchema,
  role: roleSchema,
  isActive: z.boolean(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const adminResetPasswordSchema = z.object({
  newPassword: passwordSchema,
});
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ChangeOwnPasswordInput = z.infer<typeof changeOwnPasswordSchema>;

export const updateOwnProfileSchema = z.object({
  name: nameSchema,
});
export type UpdateOwnProfileInput = z.infer<typeof updateOwnProfileSchema>;
