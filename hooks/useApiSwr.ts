import useSWR from "swr";

export function useApiSwr<T>(path: string, queryParams?: Record<string, string>, options?: any) {

  const fetcher = async (url: string): Promise<T> => {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  };

  const { data, error, isValidating, isLoading } = useSWR<T>(path, fetcher, {
    ...options,
    fallbackData: options?.fallbackData || []
  });

  return {
    data: data ? data : [],
    error,
    isLoading: isLoading,
    isValidating
  };

}
