import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategories } from "../../hooks/useCategories";
import { useExpense, useCreateExpense, useUpdateExpense } from "../../hooks/useExpenses";
import { useUploadReceipt } from "../../hooks/useReceipts";
import { expenseFormSchema, validateReceiptFile, type ExpenseFormValues } from "../../utils/validation";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: expense, isLoading: expLoading } = useExpense(id || "");
  const createMutation = useCreateExpense();
  const updateMutation = useUpdateExpense();
  const uploadMutation = useUploadReceipt();
  const [receiptFiles, setReceiptFiles] = useState<File[]>([]);
  const [receiptError, setReceiptError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category_id: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  useEffect(() => {
    if (isEdit && expense && categories.length > 0) {
      reset({
        category_id: expense.categoryId,
        amount: String(expense.amount),
        date: expense.date,
        notes: expense.notes || "",
      });
    } else if (!isEdit && categories.length > 0) {
      reset((prev) => ({ ...prev, category_id: categories[0]?.id || "" }));
    }
  }, [expense, categories, isEdit, reset]);

  const onSubmit = async (values: ExpenseFormValues) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          body: {
            category_id: values.category_id,
            amount: parseFloat(values.amount),
            date: values.date || undefined,
            notes: values.notes || null,
          },
        });
      } else {
        const newExpense = await createMutation.mutateAsync({
          category_id: values.category_id,
          amount: parseFloat(values.amount),
          date: values.date || undefined,
          notes: values.notes || null,
        });

        for (const file of receiptFiles) {
          await uploadMutation.mutateAsync({ expenseId: newExpense.id, file });
        }
      }
      navigate("/expenses");
    } catch {
      // Error handled by mutation state
    }
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReceiptError("");
    for (const file of files) {
      const error = validateReceiptFile(file);
      if (error) {
        setReceiptError(error);
        return;
      }
    }
    setReceiptFiles((prev) => [...prev, ...files]);
  };

  const isLoading = (isEdit && expLoading) || catLoading;
  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isEdit ? "Edit Expense" : "Add Expense"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            {...register("amount")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category *
          </label>
          <select
            id="category"
            {...register("category_id")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            id="date"
            type="date"
            {...register("date")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            {...register("notes")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Optional notes..."
          />
        </div>

        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Receipt Images
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,application/pdf"
              onChange={handleReceiptChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
            />
            {receiptError && <p className="mt-1 text-sm text-red-600">{receiptError}</p>}
            {receiptFiles.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">{receiptFiles.length} file(s) selected</p>
            )}
            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG, or PDF. Max 5MB each.
            </p>
          </div>
        )}

        {(errors.root || createMutation.isError || updateMutation.isError) && (
          <p className="text-sm text-red-600">Failed to save expense</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : isEdit ? "Save Changes" : "Add Expense"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/expenses")}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
