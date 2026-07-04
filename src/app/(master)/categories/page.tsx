// app/categories/page.tsx
import CategoriesTable from "./categories-table/page";

interface SearchParams {
  page?: string;
  pageSize?: string;
  id?: string;
  name?: string;
  status?: string;
  createdBy?: string;
  createdAt?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const page     = Number(params.page     ?? 1);
  const pageSize = Number(params.pageSize ?? 10);

  const query = new URLSearchParams({
    page:      String(page),
    pageSize:  String(pageSize),
    ...(params.id        && { id:        params.id        }),
    ...(params.name      && { name:      params.name      }),
    ...(params.status    && { status:    params.status    }),
    ...(params.createdBy && { createdBy: params.createdBy }),
    ...(params.createdAt && { createdAt: params.createdAt }),
  });

  

  const result: {
    data: {
      id: number;
      name: string;
      status: string;
      createdAt: string;
      createdBy?: string;
    }[];
    total: number;
    page: number;
    pageSize: number;
  } = await res.json();

  return (
    <CategoriesTable
      initialCategories={result.data}
      initialTotal={result.total}
      initialPage={result.page}
      initialPageSize={result.pageSize}
    />
  );
}