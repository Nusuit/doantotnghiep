export interface ApiError {
  code?: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  requestId?: string;
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = (await response.json()) as ApiResponse<T>;
  if (!json.success) {
    throw new Error(json.error?.message || "Request failed");
  }
  return json.data as T;
}
