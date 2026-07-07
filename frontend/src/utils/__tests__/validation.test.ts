import { describe, it, expect } from "vitest";
import { expenseFormSchema, validateReceiptFile } from "../validation";

describe("expenseFormSchema", () => {
  it("validates a valid expense", () => {
    const result = expenseFormSchema.safeParse({
      category_id: "123",
      amount: "42.50",
      date: "2026-07-01",
      notes: "Lunch",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing amount", () => {
    const result = expenseFormSchema.safeParse({
      category_id: "123",
      amount: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("Amount is required"))).toBe(true);
    }
  });

  it("rejects non-numeric amount", () => {
    const result = expenseFormSchema.safeParse({
      category_id: "123",
      amount: "abc",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("Amount must be a number"))).toBe(true);
    }
  });

  it("rejects negative amount", () => {
    const result = expenseFormSchema.safeParse({
      category_id: "123",
      amount: "-5",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("Amount must be positive"))).toBe(true);
    }
  });

  it("rejects missing category", () => {
    const result = expenseFormSchema.safeParse({
      category_id: "",
      amount: "10",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.message.includes("Please select a category"))).toBe(true);
    }
  });
});

describe("validateReceiptFile", () => {
  it("returns null for valid jpeg", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 1024 });
    expect(validateReceiptFile(file)).toBeNull();
  });

  it("returns null for valid png", () => {
    const file = new File([""], "test.png", { type: "image/png" });
    Object.defineProperty(file, "size", { value: 1024 });
    expect(validateReceiptFile(file)).toBeNull();
  });

  it("returns null for valid pdf", () => {
    const file = new File([""], "test.pdf", { type: "application/pdf" });
    Object.defineProperty(file, "size", { value: 1024 });
    expect(validateReceiptFile(file)).toBeNull();
  });

  it("rejects unsupported file type", () => {
    const file = new File([""], "test.gif", { type: "image/gif" });
    Object.defineProperty(file, "size", { value: 1024 });
    expect(validateReceiptFile(file)).toBe("Only JPG, PNG, and PDF files are supported");
  });

  it("rejects oversized file", () => {
    const file = new File([""], "test.jpg", { type: "image/jpeg" });
    Object.defineProperty(file, "size", { value: 6 * 1024 * 1024 });
    expect(validateReceiptFile(file)).toBe("File size must be under 5MB");
  });
});
