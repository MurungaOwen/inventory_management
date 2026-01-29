import { z } from "zod";

// Email schema - Entity validation rules
export const emailSchema = z
  .string()
  .min(1, { message: "Email is required" })
  .max(254, { message: "Email is too long (max 254 characters)" })
  .email({ message: "Invalid email format" })
  .transform((email) => email.toLowerCase().trim());

// Password schema - Entity validation rules
export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(128, { message: "Password is too long (max 128 characters)" })
  .refine((password) => /\d/.test(password) && /[a-zA-Z]/.test(password), {
    message: "Password must contain at least one letter and one number",
  });

// Role schema
export const roleSchema = z.enum(["Owner", "Manager", "Cashier"]);

// Member registration DTO
export const createUserSchema = z.object({
  email: emailSchema,
  phone: z.string().optional(),
  password: passwordSchema,
  fullName: z.string().min(1, { message: "Full name is required" }),
  role: roleSchema,
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

// Login DTO
export const loginUserSchema = z.object({
  email: z.string().min(1, { message: "Email or phone is required" }), // Email or Phone
  password: z.string().min(1, { message: "Password is required" }),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;

// Correction DTO (all fields optional)
export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
