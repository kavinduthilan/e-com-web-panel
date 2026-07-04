"use client";
import DataTable, { ColumnDef, FieldDef } from "../../../../components/table/DataTable.";
 
interface Category {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  createdBy?: string;
}
 
interface Props {
  initialCategories: Category[];
  initialTotal: number;
  initialPage: number;
  initialPageSize: number;
}
 
 
const columns: ColumnDef<Category>[] = [
  {
    key: "id",
    label: "Id",
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === "Active"
            ? "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400"
            : "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "createdBy",
    label: "Created By",
    render: (row) => row.createdBy ?? "Unknown",
  },
  {
    key: "createdAt",
    label: "Created At",
  },
];
 
 
const formFields: FieldDef[] = [
  {
    key: "name",
    label: "Category Name",
    placeholder: "e.g., Electronics, Clothing",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: ["Active", "Inactive"],
  },
];
 

export default function CategoriesTable({
  initialCategories,
  initialTotal,
  initialPage,
  initialPageSize,
}: Props) {
  const handleSave = async (
    data: Record<string, string>,
    editingId: number | null
  ): Promise<string | void> => {
    if (!data.name?.trim()) return "Please enter a category name.";
 
    try {
      const res = await fetch("/api/categories", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...data } : data
        ),
      });
      if (!res.ok) throw new Error("Failed to save category");
    } catch (err) {
      return err instanceof Error ? err.message : "An error occurred";
    }
  };
 
  return (
    <DataTable<Category>
      title="Categories List"
      subtitle="Manage your product categories efficiently"
      rows={initialCategories}
      totalRows={initialTotal}
      currentPage={initialPage}
      pageSize={initialPageSize}
      pageSizeOptions={[5, 10, 25, 50]}
      columns={columns}
      formFields={formFields}
      onSave={handleSave}
    />
  );
}