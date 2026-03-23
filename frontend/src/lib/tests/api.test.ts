import { request, RequestError } from "@/lib/api";

// Mock the cognito module
jest.mock("@/lib/cognito", () => ({
  getCurrentSession: jest.fn(),
}));

import { getCurrentSession } from "@/lib/cognito";
const mockedGetCurrentSession = getCurrentSession as jest.MockedFunction<typeof getCurrentSession>;

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("request", () => {
  it("makes a GET request with correct URL", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ items: [] }),
    });

    await request({
      baseUrl: "http://localhost:3001",
      path: "/listing/marketplace",
      method: "GET",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/listing/marketplace",
      expect.objectContaining({ method: "GET" })
    );
  });

  it("includes Authorization header when session exists", async () => {
    const mockSession = {
      getAccessToken: () => ({
        getJwtToken: () => "mock-jwt-token",
      }),
    };
    mockedGetCurrentSession.mockResolvedValue(mockSession as never);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await request({
      baseUrl: "http://localhost:3001",
      path: "/api/test",
      method: "GET",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock-jwt-token",
        }),
      })
    );
  });

  it("does not include Authorization header when no session", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await request({
      baseUrl: "http://localhost:3001",
      path: "/api/test",
      method: "GET",
    });

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders).not.toHaveProperty("Authorization");
  });

  it("sends JSON body for POST requests", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: "123" }),
    });

    const body = { gameName: "Pokemon TCG", cardName: "Pikachu" };
    await request({
      baseUrl: "http://localhost:3001",
      path: "/listing/marketplace",
      method: "POST",
      body,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(body),
      })
    );
  });

  it("does not send body for GET requests", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await request({
      baseUrl: "http://localhost:3001",
      path: "/api/test",
      method: "GET",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: undefined })
    );
  });

  it("returns data and status on success", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    const responseData = { items: [{ id: 1 }] };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(responseData),
    });

    const result = await request<{ items: { id: number }[] }>({
      baseUrl: "http://localhost:3001",
      path: "/api/test",
      method: "GET",
    });

    expect(result.data).toEqual(responseData);
    expect(result.status).toBe(200);
  });

  it("throws RequestError on non-ok response", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: () => Promise.resolve({ message: "Listing not found" }),
    });

    await expect(
      request({
        baseUrl: "http://localhost:3001",
        path: "/listing/marketplace/xyz",
        method: "GET",
      })
    ).rejects.toThrow(RequestError);
  });

  it("RequestError contains status and data", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    const errorData = { message: "Validation failed", errors: ["price required"] };
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: () => Promise.resolve(errorData),
    });

    try {
      await request({
        baseUrl: "http://localhost:3001",
        path: "/listing/marketplace",
        method: "POST",
        body: {},
      });
    } catch (err) {
      expect(err).toBeInstanceOf(RequestError);
      const reqErr = err as RequestError;
      expect(reqErr.status).toBe(400);
      expect(reqErr.data).toEqual(errorData);
      expect(reqErr.message).toBe("Validation failed");
    }
  });

  it("falls back to statusText when response has no message", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: () => Promise.resolve(null),
    });

    try {
      await request({
        baseUrl: "http://localhost:3001",
        path: "/api/test",
        method: "GET",
      });
    } catch (err) {
      expect((err as RequestError).message).toBe("Internal Server Error");
    }
  });

  it("merges custom headers", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await request({
      baseUrl: "http://localhost:3001",
      path: "/api/test",
      method: "GET",
      headers: { "X-Custom": "value" },
    });

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders["X-Custom"]).toBe("value");
    expect(callHeaders["Content-Type"]).toBe("application/json");
  });

  it("supports PATCH method", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await request({
      baseUrl: "http://localhost:3001",
      path: "/listing/marketplace/123",
      method: "PATCH",
      body: { price: 10 },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("supports DELETE method", async () => {
    mockedGetCurrentSession.mockResolvedValue(null);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });

    await request({
      baseUrl: "http://localhost:3001",
      path: "/listing/marketplace/123",
      method: "DELETE",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: "DELETE", body: undefined })
    );
  });
});
