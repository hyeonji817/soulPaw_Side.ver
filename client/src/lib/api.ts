const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = typeof payload.message === "string" ? payload.message : "API 요청에 실패했습니다.";
    throw new Error(message);
  }

  return payload as T;
};