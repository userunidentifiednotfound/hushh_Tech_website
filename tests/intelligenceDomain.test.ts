import { describe, it, expect, vi } from "vitest";
import type { HushhUser, HushhConversation, HushhMessage } from "../src/hushh-intelligence/core/types";
import type { IUserRepository } from "../src/hushh-intelligence/domain/repositories/IUserRepository";
import type { IConversationRepository } from "../src/hushh-intelligence/domain/repositories/IConversationRepository";
import type { IMessageRepository } from "../src/hushh-intelligence/domain/repositories/IMessageRepository";
import type { IMediaLimitsRepository } from "../src/hushh-intelligence/domain/repositories/IMediaLimitsRepository";
import { GetOrCreateUserUseCase } from "../src/hushh-intelligence/domain/usecases/GetOrCreateUserUseCase";
import { GetConversationsUseCase } from "../src/hushh-intelligence/domain/usecases/GetConversationsUseCase";
import { CreateConversationUseCase } from "../src/hushh-intelligence/domain/usecases/CreateConversationUseCase";
import { AddMessageUseCase } from "../src/hushh-intelligence/domain/usecases/AddMessageUseCase";
import { GetMessagesUseCase } from "../src/hushh-intelligence/domain/usecases/GetMessagesUseCase";
import { CheckMediaUploadUseCase } from "../src/hushh-intelligence/domain/usecases/CheckMediaUploadUseCase";
import { UnauthorizedError, ValidationError } from "../src/hushh-intelligence/core/errors";

const MOCK_LIMITS = { dailyUploads: 15, maxDailyUploads: 20, remainingUploads: 5, lastReset: new Date() };
const MOCK_USER: HushhUser = { id: "user-1", supabaseUserId: "sb-1", email: "t@t.com", displayName: null, avatarUrl: null, createdAt: new Date(), lastLoginAt: new Date(), totalMessages: 0, totalConversations: 0, isActive: true };
const MOCK_CONV: HushhConversation = { id: "conv-1", userId: "user-1", title: "Test", createdAt: new Date(), updatedAt: new Date() };
const MOCK_MSG: HushhMessage = { id: "msg-1", conversationId: "conv-1", role: "user", content: "Hello", mediaUrls: [], createdAt: new Date() };

function makeUserRepo(user: HushhUser | null = MOCK_USER): IUserRepository {
  return {
    getCurrentUser: vi.fn().mockResolvedValue(user),
    getOrCreate: vi.fn().mockResolvedValue(user),
    touchLastLogin: vi.fn().mockResolvedValue(undefined),
  };
}
function makeConvRepo(): IConversationRepository {
  return {
    getAll: vi.fn().mockResolvedValue([MOCK_CONV]),
    create: vi.fn().mockResolvedValue(MOCK_CONV),
    updateTitle: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}
function makeMsgRepo(): IMessageRepository {
  return {
    getByConversation: vi.fn().mockResolvedValue([MOCK_MSG]),
    add: vi.fn().mockResolvedValue(MOCK_MSG),
  };
}
function makeMediaRepo(remaining = 5): IMediaLimitsRepository {
  return {
    getLimits: vi.fn().mockResolvedValue({ ...MOCK_LIMITS, remainingUploads: remaining }),
    incrementUploadCount: vi.fn().mockResolvedValue(undefined),
    ensureExists: vi.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// GetOrCreateUserUseCase
// ---------------------------------------------------------------------------

describe("GetOrCreateUserUseCase", () => {
  it("returns the user from the repository", async () => {
    expect(await new GetOrCreateUserUseCase(makeUserRepo()).execute()).toEqual(MOCK_USER);
  });

  it("returns null when no user exists", async () => {
    expect(await new GetOrCreateUserUseCase(makeUserRepo(null)).execute()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// GetConversationsUseCase
// ---------------------------------------------------------------------------

describe("GetConversationsUseCase", () => {
  it("returns conversations for the authenticated user", async () => {
    const result = await new GetConversationsUseCase(makeConvRepo(), makeUserRepo()).execute();
    expect(result[0].id).toBe("conv-1");
  });

  it("throws UnauthorizedError when unauthenticated", async () => {
    await expect(
      new GetConversationsUseCase(makeConvRepo(), makeUserRepo(null)).execute()
    ).rejects.toThrow(UnauthorizedError);
  });
});

// ---------------------------------------------------------------------------
// CreateConversationUseCase
// ---------------------------------------------------------------------------

describe("CreateConversationUseCase", () => {
  it("creates a conversation for the authenticated user", async () => {
    expect(
      (await new CreateConversationUseCase(makeConvRepo(), makeUserRepo()).execute("Chat")).id
    ).toBe("conv-1");
  });

  it("throws UnauthorizedError when unauthenticated", async () => {
    await expect(
      new CreateConversationUseCase(makeConvRepo(), makeUserRepo(null)).execute()
    ).rejects.toThrow(UnauthorizedError);
  });
});

// ---------------------------------------------------------------------------
// AddMessageUseCase
// ---------------------------------------------------------------------------

describe("AddMessageUseCase", () => {
  it("adds a message to the given conversation", async () => {
    expect(
      (await new AddMessageUseCase(makeMsgRepo()).execute("conv-1", "user", "Hello")).id
    ).toBe("msg-1");
  });

  it("throws ValidationError (not generic Error) when conversationId is empty", async () => {
    await expect(
      new AddMessageUseCase(makeMsgRepo()).execute("", "user", "Hi")
    ).rejects.toThrow(ValidationError);
  });

  it("throws ValidationError (not generic Error) when content is empty", async () => {
    await expect(
      new AddMessageUseCase(makeMsgRepo()).execute("conv-1", "user", "  ")
    ).rejects.toThrow(ValidationError);
  });

  it("ValidationError is an IntelligenceError subclass", async () => {
    const err = await new AddMessageUseCase(makeMsgRepo())
      .execute("", "user", "Hi")
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).name).toBe("ValidationError");
  });
});

// ---------------------------------------------------------------------------
// GetMessagesUseCase
// ---------------------------------------------------------------------------

describe("GetMessagesUseCase", () => {
  it("returns messages for the given conversation", async () => {
    expect(
      (await new GetMessagesUseCase(makeMsgRepo()).execute("conv-1"))[0].content
    ).toBe("Hello");
  });

  it("throws ValidationError when conversationId is empty", async () => {
    await expect(
      new GetMessagesUseCase(makeMsgRepo()).execute("  ")
    ).rejects.toThrow(ValidationError);
  });
});

// ---------------------------------------------------------------------------
// CheckMediaUploadUseCase
// ---------------------------------------------------------------------------

describe("CheckMediaUploadUseCase", () => {
  it("returns true when uploads remain", async () => {
    expect(await new CheckMediaUploadUseCase(makeMediaRepo(5), makeUserRepo()).execute()).toBe(true);
  });

  it("returns false when no uploads remain", async () => {
    expect(await new CheckMediaUploadUseCase(makeMediaRepo(0), makeUserRepo()).execute()).toBe(false);
  });

  it("throws UnauthorizedError when unauthenticated", async () => {
    await expect(
      new CheckMediaUploadUseCase(makeMediaRepo(), makeUserRepo(null)).execute()
    ).rejects.toThrow(UnauthorizedError);
  });

  it("calls ensureExists and retries getLimits when limits record is missing (first-time user)", async () => {
    // First call returns null (no record), second call returns limits after ensureExists.
    const getLimits = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ ...MOCK_LIMITS, remainingUploads: 20 });
    const ensureExists = vi.fn().mockResolvedValue(undefined);
    const repo: IMediaLimitsRepository = { getLimits, ensureExists, incrementUploadCount: vi.fn() };

    const result = await new CheckMediaUploadUseCase(repo, makeUserRepo()).execute();

    expect(ensureExists).toHaveBeenCalledWith("user-1");
    expect(getLimits).toHaveBeenCalledTimes(2);
    expect(result).toBe(true); // first-time user is NOT blocked
  });

  it("returns false gracefully when getLimits returns null even after ensureExists", async () => {
    // Both calls return null — storage error scenario.
    const repo: IMediaLimitsRepository = {
      getLimits: vi.fn().mockResolvedValue(null),
      ensureExists: vi.fn().mockResolvedValue(undefined),
      incrementUploadCount: vi.fn(),
    };
    expect(await new CheckMediaUploadUseCase(repo, makeUserRepo()).execute()).toBe(false);
  });
});
