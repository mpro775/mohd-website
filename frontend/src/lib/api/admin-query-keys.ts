export const adminQueryKeys = {
  all: ["admin"] as const,
  
  // Dashboard stats query key
  dashboard: () => ["admin", "dashboard"] as const,
  
  // List resource query key (supports filters, pagination, search query options)
  resource: (name: string, params?: unknown) => ["admin", "list", name, params ?? {}] as const,
  
  // Detail resource query key (retrieves single item)
  detail: (name: string, id: string) => ["admin", "detail", name, id] as const,
};
