import { useQuery } from "@tanstack/react-query";

export function useApiQuery(key: string, fetcher: () => Promise<any>) {
  return useQuery({ queryKey: [key], queryFn: fetcher });
}
