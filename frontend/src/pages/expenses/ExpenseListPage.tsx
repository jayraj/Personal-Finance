import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useExpenses, useDeleteExpense } from "../../hooks/useExpenses";
import { useCategories } from "../../hooks/useCategories";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import type { ExpensesQuery } from "../../api/expenses";

export default function ExpenseListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ExpensesQuery>({
    sort_by: "date",
    sort_order: "desc",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, error: queryError } = useExpenses(filters);
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteExpense();

  const expenses = data?.pages.flatMap((p) => p.items) ?? [];
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: field,
      sort_order:
        prev.sort_by === field && prev.sort_order === "asc" ? "desc" : "asc",
    }));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onError: () => {},
    });
    setDeleteId(null);
  };

  const sortIndicator = (field: string) => {
    if (filters.sort_by !== field) return "";
    return filters.sort_order === "asc" ? " \u2191" : " \u2193";
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
        <div className="flex gap-3">
          <Link
            to="/categories"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Manage Categories
          </Link>
          <Link
            to="/expenses/new"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Add Expense
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg bg-white p-4 shadow-sm">
        <select
          value={filters.category_id || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              category_id: e.target.value || undefined,
            }))
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.date_from || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              date_from: e.target.value || undefined,
            }))
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="From"
        />

        <input
          type="date"
          value={filters.date_to || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              date_to: e.target.value || undefined,
            }))
          }
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="To"
        />

        <input
          type="number"
          placeholder="Min amount"
          value={filters.amount_min || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              amount_min: e.target.value ? parseFloat(e.target.value) : undefined,
            }))
          }
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <input
          type="number"
          placeholder="Max amount"
          value={filters.amount_max || ""}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              amount_max: e.target.value ? parseFloat(e.target.value) : undefined,
            }))
          }
          className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {queryError && <p className="text-sm text-red-600">Failed to load expenses</p>}
      {deleteMutation.isError && <p className="text-sm text-red-600">Failed to delete expense</p>}

      {expenses.length === 0 && !isLoading && (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">No expenses yet</p>
          <Link
            to="/expenses/new"
            className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Add your first expense
          </Link>
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["date", "amount", "category"].map((field) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                  {sortIndicator(field)}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Notes
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/expenses/${expense.id}`)}
              >
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                  ${expense.amount.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {expense.categoryName}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-500">
                  {expense.notes || "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/expenses/${expense.id}/edit`);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(expense.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && <LoadingSpinner />}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
