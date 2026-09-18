"use client";
import * as React from "react";
import { apiFetch, ApiError } from "@/lib/api-client";
import { useToast } from "@/contexts/toast-context";
interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
export function useAdminCrud<T extends { id: number }>(basePath: string, pageSize = 10) {
  const { toast } = useToast();
  const [items, setItems] = React.useState<T[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const load = React.useCallback(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    if (search) params.set("search", search);
    apiFetch<PagedResult<T>>(`${basePath}?${params.toString()}`)
      .then((result) => {
        setItems(result.items);
        setTotal(result.total);
      })
      .catch((fetchError) => setError(fetchError instanceof ApiError ? fetchError.message : "Failed to load data"));
  }, [basePath, page, pageSize, search]);
  React.useEffect(() => { load(); }, [load]);
  const create = async (body: unknown) => {
    await apiFetch(basePath, { method: "POST", body });
    toast({ title: "Created successfully", variant: "success" });
    load();
  };
  const update = async (id: number, body: unknown) => {
    await apiFetch(`${basePath}/${id}`, { method: "PATCH", body });
    toast({ title: "Updated successfully", variant: "success" });
    load();
  };
  const remove = async (id: number) => {
    await apiFetch(`${basePath}/${id}`, { method: "DELETE" });
    toast({ title: "Deleted successfully", variant: "success" });
    load();
  };
  return { items, total, page, setPage, search, setSearch, error, load, create, update, remove, pageSize };
}
