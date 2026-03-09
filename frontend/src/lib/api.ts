import { getCurrentSession } from "@/lib/cognito";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestParams {
  baseUrl: string;
  path: string;
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

interface HttpResponse<T> {
  data: T;
  status: number;
}

export class RequestError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "RequestError";
    this.status = status;
    this.data = data;
  }
}

async function getAccessToken(): Promise<string | null> {
  const session = await getCurrentSession();
  if (!session) return null;
  return session.getAccessToken().getJwtToken();
}

export async function request<T>(params: RequestParams): Promise<HttpResponse<T>> {
  const { baseUrl, path, method, body, headers: customHeaders } = params;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...customHeaders,
  };

  const token = await getAccessToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new RequestError(
      data?.message ?? response.statusText,
      response.status,
      data
    );
  }

  return { data: data as T, status: response.status };
}
