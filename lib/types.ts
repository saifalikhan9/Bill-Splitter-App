// lib/validations/auth.ts
import { z } from "zod";

export const createAuthSchema = (type: "signup" | "signin") => {
  const baseSchema = {
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  };

  if (type === "signup") {
    return z
      .object({
        ...baseSchema,
        name: z.string().min(2, {
          message: "Name must be at least 2 characters.",
        }),
        confirmPassword: z.string().min(8, {
          message: "Confirm Password must be at least 8 characters.",
        }),
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      });
  }

  return z.object(baseSchema);
};

export const createFlatmateSchema = () => {
  return z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),

    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
  });
};

export interface billstype {
  id: number;
  createdAt: Date;
  ownerId: string;
  masterReading: number;
  actualBill: number;
  details: {
    name: string;
    id: number;
    billId: number;
    reading: number;
    Amount: number;
    userId: string;
  }[];
}

export interface userProfileType{
id : string;
name : string;
email : string;
role : "OWNER"|"FLATMATE";
}