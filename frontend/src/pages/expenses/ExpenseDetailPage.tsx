import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getExpense,
  deleteExpense,
  deleteReceipt,
} from "../../api/expenses";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import type { Expense } from "../../types";

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getExpense(id)
      .then(setExpense)
      .catch(() => setError("Failed to load expense"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteExpense(id);
      navigate("/expenses", { replace: true });
    } catch {
      setError("Failed to delete expense");
    }
    setShowDelete(false);
  };

  const handleRemoveReceipt = async (receiptId: string) => {
    if (!id) return;
    try {
      await deleteReceipt(id, receiptId);
      setExpense((prev) =>
        prev
          ? { ...prev, receipts: prev.receipts?.filter((r) => r.id !== receiptId) }
          : prev,
      );
    } catch {
      setError("Failed to delete receipt");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!expense) return <p className="text-sm text-gray-500">Expense not found</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expense Detail</h1>
        <Link
          to="/expenses"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          &larr; Back to list
        </Link>
      </div>

      <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
              Amount
            </label>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              ${expense.amount.toFixed(2)}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
              Date
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(expense.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
              Category
            </label>
            <p className="mt-1 text-sm text-gray-900">{expense.categoryName}</p>
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
              Created
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(expense.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        {expense.notes && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
              Notes
            </label>
            <p className="mt-1 text-sm text-gray-700">{expense.notes}</p>
          </div>
        )}

        {(expense.receipts?.length ?? 0) > 0 && (
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">
              Receipts
            </label>
            <div className="mt-2 flex flex-wrap gap-3">
              {expense.receipts?.map((receipt) => (
                <div key={receipt.id} className="relative group">
                  {receipt.mimeType === "application/pdf" ? (
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg border bg-gray-50">
                      <span className="text-xs text-gray-500">PDF</span>
                    </div>
                  ) : (
                    <img
                      src={receipt.url || ""}
                      alt={receipt.fileName}
                      className="h-24 w-24 cursor-pointer rounded-lg border object-cover"
                      onClick={() => setShowFullImage(receipt.url || "")}
                    />
                  )}
                  <button
                    onClick={() => handleRemoveReceipt(receipt.id)}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Link
          to={`/expenses/${expense.id}/edit`}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Edit
        </Link>
        <button
          onClick={() => setShowDelete(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />

      {showFullImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowFullImage(null)}
        >
          <img
            src={showFullImage}
            alt="Receipt"
            className="max-h-full max-w-full rounded-lg object-contain"
          />
        </div>
      )}
    </div>
  );
}
