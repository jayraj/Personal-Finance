import { z } from "zod/v4";

export const expenseFormSchema = z.object({
  category_id: z.string({ message: "Please select a category" }).min(1, "Please select a category"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((v) => !isNaN(Number(v)), "Amount must be a number")
    .refine((v) => Number(v) > 0, "Amount must be positive"),
  date: z.string().optional(),
  notes: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export const ALLOWED_RECEIPT_TYPES = ["image/jpeg", "image/png", "application/pdf"];
export const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;

export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
    return "Only JPG, PNG, and PDF files are supported";
  }
  if (file.size > MAX_RECEIPT_SIZE) {
    return "File size must be under 5MB";
  }
  return null;
}

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50, "Category name too long"),
});

export const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(100),
  preferredCurrency: z.string().min(1).max(3),
});
