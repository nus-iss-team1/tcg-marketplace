import {
  signUp,
  confirmSignUp,
  resendConfirmationCode,
  signIn,
  signOut,
  getCurrentSession,
  refreshSession,
  getCurrentUser,
  getUserAttributes,
  updateUserAttributes,
  changePassword,
} from "@/lib/cognito";

// Mock amazon-cognito-identity-js
const mockSignUp = jest.fn();
const mockGetCurrentUser = jest.fn();
const mockAuthenticateUser = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockConfirmRegistration = jest.fn();
const mockResendConfirmationCode = jest.fn();
const mockRefreshSession = jest.fn();
const mockGetUserAttributes = jest.fn();
const mockUpdateAttributes = jest.fn();
const mockChangePassword = jest.fn();

jest.mock("amazon-cognito-identity-js", () => {
  return {
    CognitoUserPool: jest.fn().mockImplementation(() => ({
      signUp: mockSignUp,
      getCurrentUser: mockGetCurrentUser,
    })),
    CognitoUser: jest.fn().mockImplementation(() => ({
      authenticateUser: mockAuthenticateUser,
      signOut: mockSignOut,
      getSession: mockGetSession,
      confirmRegistration: mockConfirmRegistration,
      resendConfirmationCode: mockResendConfirmationCode,
      refreshSession: mockRefreshSession,
      getUserAttributes: mockGetUserAttributes,
      updateAttributes: mockUpdateAttributes,
      changePassword: mockChangePassword,
    })),
    AuthenticationDetails: jest.fn(),
    CognitoUserAttribute: jest.fn().mockImplementation((data) => data),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("signUp", () => {
  it("resolves with user on success", async () => {
    const mockUser = { username: "testuser" };
    mockSignUp.mockImplementation((_u, _p, _a, _v, cb) => {
      cb(null, { user: mockUser });
    });

    const result = await signUp("testuser", "Password1", {
      email: "test@test.com",
      givenName: "Test",
      familyName: "User",
    });

    expect(result).toBe(mockUser);
  });

  it("includes address attribute when provided", async () => {
    const mockUser = { username: "testuser" };
    mockSignUp.mockImplementation((_u, _p, attrs, _v, cb) => {
      cb(null, { user: mockUser });
    });

    await signUp("testuser", "Password1", {
      email: "test@test.com",
      givenName: "Test",
      familyName: "User",
      address: "123 Street",
    });

    const attrs = mockSignUp.mock.calls[0][2];
    expect(attrs).toHaveLength(4);
  });

  it("rejects on error", async () => {
    mockSignUp.mockImplementation((_u, _p, _a, _v, cb) => {
      cb(new Error("User already exists"), null);
    });

    await expect(
      signUp("testuser", "Password1", {
        email: "test@test.com",
        givenName: "Test",
        familyName: "User",
      })
    ).rejects.toThrow("User already exists");
  });
});

describe("confirmSignUp", () => {
  it("resolves on success", async () => {
    mockConfirmRegistration.mockImplementation((_code, _force, cb) => {
      cb(null);
    });

    await expect(confirmSignUp("testuser", "123456")).resolves.toBeUndefined();
  });

  it("rejects on error", async () => {
    mockConfirmRegistration.mockImplementation((_code, _force, cb) => {
      cb(new Error("Invalid code"));
    });

    await expect(confirmSignUp("testuser", "000000")).rejects.toThrow("Invalid code");
  });
});

describe("resendConfirmationCode", () => {
  it("resolves on success", async () => {
    mockResendConfirmationCode.mockImplementation((cb) => {
      cb(null);
    });

    await expect(resendConfirmationCode("testuser")).resolves.toBeUndefined();
  });

  it("rejects on error", async () => {
    mockResendConfirmationCode.mockImplementation((cb) => {
      cb(new Error("Too many attempts"));
    });

    await expect(resendConfirmationCode("testuser")).rejects.toThrow("Too many attempts");
  });
});

describe("signIn", () => {
  it("resolves with session on success", async () => {
    const mockSession = { getIdToken: jest.fn() };
    mockAuthenticateUser.mockImplementation((_details, callbacks) => {
      callbacks.onSuccess(mockSession);
    });

    const result = await signIn("testuser", "Password1");
    expect(result).toBe(mockSession);
  });

  it("rejects on failure", async () => {
    mockAuthenticateUser.mockImplementation((_details, callbacks) => {
      callbacks.onFailure(new Error("Incorrect password"));
    });

    await expect(signIn("testuser", "wrong")).rejects.toThrow("Incorrect password");
  });
});

describe("signOut", () => {
  it("calls signOut on current user", () => {
    const mockUser = { signOut: mockSignOut };
    mockGetCurrentUser.mockReturnValue(mockUser);

    signOut();
    expect(mockUser.signOut).toHaveBeenCalled();
  });

  it("does nothing when no current user", () => {
    mockGetCurrentUser.mockReturnValue(null);
    expect(() => signOut()).not.toThrow();
  });
});

describe("getCurrentSession", () => {
  it("returns null when no current user", async () => {
    mockGetCurrentUser.mockReturnValue(null);
    const result = await getCurrentSession();
    expect(result).toBeNull();
  });

  it("returns session when user exists", async () => {
    const mockSession = { getIdToken: jest.fn() };
    const mockUser = {
      getSession: (cb: (err: Error | null, session: unknown) => void) => {
        cb(null, mockSession);
      },
    };
    mockGetCurrentUser.mockReturnValue(mockUser);

    const result = await getCurrentSession();
    expect(result).toBe(mockSession);
  });

  it("rejects on session error", async () => {
    const mockUser = {
      getSession: (cb: (err: Error | null, session: unknown) => void) => {
        cb(new Error("Session expired"), null);
      },
    };
    mockGetCurrentUser.mockReturnValue(mockUser);

    await expect(getCurrentSession()).rejects.toThrow("Session expired");
  });
});

describe("refreshSession", () => {
  it("rejects when no current user", async () => {
    mockGetCurrentUser.mockReturnValue(null);
    await expect(refreshSession()).rejects.toThrow("No user");
  });

  it("returns new session on success", async () => {
    const mockRefreshToken = { token: "refresh" };
    const mockNewSession = { getIdToken: jest.fn() };
    const mockUser = {
      getSession: (cb: (err: Error | null, session: unknown) => void) => {
        cb(null, { getRefreshToken: () => mockRefreshToken });
      },
      refreshSession: (_token: unknown, cb: (err: Error | null, session: unknown) => void) => {
        cb(null, mockNewSession);
      },
    };
    mockGetCurrentUser.mockReturnValue(mockUser);

    const result = await refreshSession();
    expect(result).toBe(mockNewSession);
  });
});

describe("getCurrentUser", () => {
  it("returns current user from pool", () => {
    const mockUser = { username: "test" };
    mockGetCurrentUser.mockReturnValue(mockUser);

    const result = getCurrentUser();
    expect(result).toBe(mockUser);
  });

  it("returns null when no user", () => {
    mockGetCurrentUser.mockReturnValue(null);
    expect(getCurrentUser()).toBeNull();
  });
});

describe("getUserAttributes", () => {
  it("rejects when no current user", async () => {
    mockGetCurrentUser.mockReturnValue(null);
    await expect(getUserAttributes()).rejects.toThrow("No user");
  });

  it("returns attributes as record", async () => {
    const mockAttrs = [
      { getName: () => "email", getValue: () => "test@test.com" },
      { getName: () => "given_name", getValue: () => "Test" },
    ];
    const mockUser = {
      getSession: (cb: (err: Error | null) => void) => cb(null),
      getUserAttributes: (cb: (err: Error | null, attrs: unknown[]) => void) => cb(null, mockAttrs),
    };
    mockGetCurrentUser.mockReturnValue(mockUser);

    const result = await getUserAttributes();
    expect(result).toEqual({
      email: "test@test.com",
      given_name: "Test",
    });
  });
});

describe("updateUserAttributes", () => {
  it("rejects when no current user", async () => {
    mockGetCurrentUser.mockReturnValue(null);
    await expect(updateUserAttributes({ given_name: "New" })).rejects.toThrow("No user");
  });

  it("resolves on success", async () => {
    const mockUser = {
      getSession: (cb: (err: Error | null) => void) => cb(null),
      updateAttributes: (_attrs: unknown, cb: (err: Error | null) => void) => cb(null),
    };
    mockGetCurrentUser.mockReturnValue(mockUser);

    await expect(updateUserAttributes({ given_name: "New" })).resolves.toBeUndefined();
  });
});

describe("changePassword", () => {
  it("rejects when no current user", async () => {
    mockGetCurrentUser.mockReturnValue(null);
    await expect(changePassword("old", "new")).rejects.toThrow("No user");
  });

  it("resolves on success", async () => {
    const mockUser = {
      getSession: (cb: (err: Error | null) => void) => cb(null),
      changePassword: (_old: string, _new: string, cb: (err: Error | null) => void) => cb(null),
    };
    mockGetCurrentUser.mockReturnValue(mockUser);

    await expect(changePassword("OldPass1", "NewPass1")).resolves.toBeUndefined();
  });

  it("rejects on error", async () => {
    const mockUser = {
      getSession: (cb: (err: Error | null) => void) => cb(null),
      changePassword: (_old: string, _new: string, cb: (err: Error | null) => void) =>
        cb(new Error("Incorrect old password")),
    };
    mockGetCurrentUser.mockReturnValue(mockUser);

    await expect(changePassword("wrong", "NewPass1")).rejects.toThrow("Incorrect old password");
  });
});
