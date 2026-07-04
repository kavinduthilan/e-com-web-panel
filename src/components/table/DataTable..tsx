"use client";
 
import { useState, useTransition, ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, Edit2 } from "lucide-react";
 
 
export interface ColumnDef<T> {
  key: string;
  label: string;
  filterable?: boolean;
  render?: (row: T) => ReactNode;
}
 
export interface FieldDef {
  key: string;
  label: string;
  type?: "text" | "select";
  options?: string[];        
  placeholder?: string;
}
 
 
interface DataTableProps<T extends { id: number }> {
  title?: string;
  subtitle?: string;
 
  rows: T[];
  totalRows: number;
  currentPage: number;
  pageSize: number;
 
  columns: ColumnDef<T>[];
 
  pageSizeOptions?: number[];
 
  formFields?: FieldDef[];
  onSave?: (data: Record<string, string>, editingId: number | null) => Promise<string | void>;
}



export default function DataTable<T extends { id: number }>({
  title = "Items",
  subtitle = "Manage your items efficiently",
  rows,
  totalRows,
  currentPage,
  pageSize,
  columns,
  pageSizeOptions = [5, 10, 25, 50],
  formFields = [],
  onSave,
}: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
 
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
 
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
 
  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val) params.set(key, val);
      else params.delete(key);
    });
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  };
 
  const handleFilterChange = (key: string, value: string) =>
    updateParams({ [key]: value, page: "1" });
 
  const handlePageChange = (newPage: number) =>
    updateParams({ page: newPage.toString() });
 
  const handlePageSizeChange = (newSize: number) =>
    updateParams({ pageSize: newSize.toString(), page: "1" });
 
  const openAddModal = () => {
    const defaults: Record<string, string> = {};
    formFields.forEach((f) => {
      defaults[f.key] = f.type === "select" && f.options?.length ? f.options[0] : "";
    });
    setFormData(defaults);
    setEditingId(null);
    setError("");
    setShowModal(true);
  };
 
  const openEditModal = (row: T) => {
    const values: Record<string, string> = {};
    formFields.forEach((f) => {
      values[f.key] = String((row as Record<string, unknown>)[f.key] ?? "");
    });
    setFormData(values);
    setEditingId(row.id);
    setError("");
    setShowModal(true);
  };
 
  const closeModal = () => {
    setShowModal(false);
    setFormData({});
    setEditingId(null);
    setError("");
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSave) return;
    const result = await onSave(formData, editingId);
    if (result) {
      setError(result);
      return;
    }
    closeModal();
    startTransition(() => router.refresh());
  };
 
  const hasModal = formFields.length > 0 && !!onSave;
 
  return (
    <div className="p-6 min-h-screen bg-white dark:bg-[#0f172a] rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        {hasModal && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg text-sm"
          >
            <Plus size={16} /> Add Item
          </button>
        )}
      </div>
 
      {/* Error banner (outside modal) */}
      {error && !showModal && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}
 
      {/* Table */}
      <div
        className={`overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 ${
          isPending ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {/* Column headers */}
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="text-left px-4 py-3 font-medium whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                {hasModal && <th className="px-4 py-3 text-center font-medium">Actions</th>}
              </tr>
 
              {/* Filter row */}
              <tr className="bg-gray-50 dark:bg-gray-800">
                {columns.map((col) => (
                  <th key={col.key} className="p-2">
                    {col.filterable !== false ? (
                      <input
                        type="text"
                        placeholder={`Search ${col.label}`}
                        defaultValue={searchParams.get(col.key) || ""}
                        onChange={(e) => handleFilterChange(col.key, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 font-normal"
                      />
                    ) : null}
                  </th>
                ))}
                {hasModal && <th className="p-2" />}
              </tr>
            </thead>
 
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (hasModal ? 1 : 0)}
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-gray-600 dark:text-gray-300">
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                    {hasModal && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => openEditModal(row)}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
 
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
          {/* Page-size selector */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
 
          {/* Page info + controls */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {Math.min((currentPage - 1) * pageSize + 1, totalRows)}–
              {Math.min(currentPage * pageSize, totalRows)} of {totalRows}
            </span>
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
              className="px-2 py-1 border rounded border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              «
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1 border rounded border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="px-3 py-1 text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1 border rounded border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
              className="px-2 py-1 border rounded border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>
 
      {/* Modal */}
      {showModal && hasModal && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg"
          >
            <h2 className="text-lg font-semibold mb-4 dark:text-white">
              {editingId ? "Edit Item" : "Add Item"}
            </h2>
 
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}
 
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {field.label}
                  </label>
                  {field.type === "select" ? (
                    <select
                      className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 w-full text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={formData[field.key] ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    >
                      {(field.options ?? []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={field.placeholder ?? `Enter ${field.label}`}
                      className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 w-full text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                      value={formData[field.key] ?? ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}
 
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  {editingId ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}