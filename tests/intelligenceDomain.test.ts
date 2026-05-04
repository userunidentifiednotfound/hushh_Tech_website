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
import { UnauthorizedError } from "../src/hushh-intelligence/core/errors";

const MOCK_USER: HushhUser = { id: "user-1", supabaseUserId: "sb-1", email: "t@t.com", displayName: null, avatarUrl: null, createdAt: new Date(), lastLoginAt: new Date(), totalMessages: 0, totalConversations: 0, isActive: true };
const MOCK_CONV: HushhConversation = { id: "conv-1", userId: "user-1", title: "Test", createdAt: new Date(), updatedAt: new Date() };
const MOCK_MSG: HushhMessage = { id: "msg-1", conversationId: "conv-1", role: "user", content: "Hello", mediaUrls: [], createdAt: new Date() };

function makeUserRepo(user: HushhUser | null = MOCK_USER): IUserRepository {
  return { getCurrentUser: vi.fn().mockResolvedValue(user), getOrCreate: vi.fn().mockResolvedValue(user), touchLastLogin: vi.fn().mockResolvedValue(undefined) };
}
function makeConvRepo(): IConversationRepository {
  return { getAll: vi.fn().mockResolvedValue([MOCK_CONV]), create: vi.fn().mockResolvedValue(MOCK_CONV), updateTitle: vi.fn().mockResolvedValue(undefined), delete: vi.fn().mockResolvedValue(undefined) };
}
function makeMsgRepo(): IMessageRepository {
  return { getByConversation: vi.fn().mockResolvedValue([MOCK_MSG]), add: vi.fn().mockResolvedValue(MOCK_MSG) };
}
function makeMediaRepo(remaining = 5): IMediaLimitsRepository {
  return { getLimits: vi.fn().mockResolvedValue({ dailyUploads: 15, maxDailyUploads: 20, remainingUploads: remaining, lastReset: new Date() }), incrementUploadCount: vi.fn(), ensureExists: vi.fn() };
}

describe("GetOrCreateUserUseCase", () => {
  it("returns the user", async () => { expect(await new GetOrCreateUserUseCase(makeUserRepo()).execute()).toEqual(MOCK_USER); });
  it("returns null when no user", async () => { expect(await new GetOrCreateUserUseCase(makeUserRepo(null)).execute()).toBeNull(); });
});

describe("GetConversationsUseCase", () => {
  it("returns conversations for authenticated user", async () => { const r = await new GetConversationsUseCase(makeConvRepo(), makeUserRepo()).execute(); expect(r[0].id).toBe("conv-1"); });
  it("throws UnauthorizedError when unauthenticated", async () => { await expect(new GetConversationsUseCase(makeConvRepo(), makeUserRepo(null)).execute()).rejects.toThrow(UnauthorizedError); });
});

describe("CreateConversationUseCase", () => {
  it("creates a conversation", async () => { expect((await new CreateConversationUseCase(makeConvRepo(), makeUserRepo()).execute("Chat")).id).toBe("conv-1"); });
  it("throws UnauthorizedError when unauthenticated", async () => { await expect(new CreateConversationUseCase(makeConvRepo(), makeUserRepo(null)).execute()).rejects.toThrow(UnauthorizedError); });
});

describe("AddMessageUseCase", () => {
  it("adds a message", async () => { expect((await new AddMessageUseCase(makeMsgRepo()).execute("conv-1", "user", "Hello")).id).toBe("msg-1"); });
  it("throws when conversationId is empty", async () => { await expect(new AddMessageUseCase(makeMsgRepo()).execute("", "user", "Hi")).rejects.toThrow("conversationId is required"); });
  it("throws when content is empty", async () => { await expect(new AddMessageUseCase(makeMsgRepo()).execute("conv-1", "user", "  ")).rejects.toThrow("content must not be empty"); });
});

describe("GetMessagesUseCase", () => {
  it("returns messages", async () => { expect((await new GetMessagesUseCase(makeMsgRepo()).execute("conv-1"))[0].content).toBe("Hello"); });
  it("throws when conversationId is empty", async () => { await expect(new GetMessagesUseCase(makeMsgRepo()).execute("  ")).rejects.toThrow("conversationId is required"); });
});

describe("CheckMediaUploadUseCase", () => {
  it("returns true when uploads remain", async () => { expect(await new CheckMediaUploadUseCase(makeMediaRepo(5), makeUserRepo()).execute()).toBe(true); });
  it("returns false when no uploads remain", async () => { expect(await new CheckMediaUploadUseCase(makeMediaRepo(0), makeUserRepo()).execute()).toBe(false); });
  it("throws UnauthorizedError when unauthenticated", async () => { await expect(new CheckMediaUploadUseCase(makeMediaRepo(), makeUserRepo(null)).execute()).rejects.toThrow(UnauthorizedError); });
  it("returns false when limits record missing", async () => { const r: IMediaLimitsRepository = { getLimits: vi.fn().mockResolvedValue(null), incrementUploadCount: vi.fn(), ensureExists: vi.fn() }; expect(await new CheckMediaUploadUseCase(r, makeUserRepo()).execute()).toBe(false); });
});
