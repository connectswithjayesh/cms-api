import { z } from 'zod';

export const adminUserAddSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  userName: z.string().min(1, "Username is required"),
  userMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  userEmail: z
    .string()
    .email("Invalid email format"),
  userPass: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  userPass1: z
    .string()
    .min(6, "Confirm Password must be at least 6 characters"),
  orgID: z.number(),
  roleID: z.number(),
}).refine((data) => data.userPass === data.userPass1, {
  path: ['userPass1'], // Point the error to the confirm password
  message: "Passwords do not match",
});
export type adminUserAddSchemaT = z.infer<typeof adminUserAddSchema>;

export const adminUserUpdateSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  userName: z.string().min(1, "Username is required"),
  userMobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  userEmail: z
    .string()
    .email("Invalid email format"),
  userPass: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal('')),  // Allow empty string
  userPass1: z
    .string()
    .min(6, "Confirm Password must be at least 6 characters")
    .optional()
    .or(z.literal('')),  // Allow empty string
  orgID: z.number(),
  roleID: z.number(),
}).refine(
  (data) => {
    // If one or both passwords are empty or undefined, skip validation
    if (!data.userPass || !data.userPass1 || data.userPass === '' || data.userPass1 === '') {
      return true;
    }
    // Otherwise, check if passwords match
    return data.userPass === data.userPass1;
  }, 
  {
    path: ['userPass1'],
    message: "Passwords do not match",
  }
);

export type adminUserUpdateSchemaT = z.infer<typeof adminUserUpdateSchema>;

export const adminUserLoginSchema = z.object({
  userName: z.string().min(1, "UserName is required"),
  password: z.string().min(1, "Password is required"),

});

export type adminUserLoginSchemaT = z.infer<typeof adminUserLoginSchema>;
