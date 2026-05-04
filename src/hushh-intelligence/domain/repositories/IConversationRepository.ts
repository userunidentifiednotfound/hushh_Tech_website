import type { HushhConversation } from "../../core/types";

export interface IConversationRepository {
  getAll(userId: string): Promise<HushhConversation[]>;
  create(userId: string, title?: string): Promise<HushhConversation>;
  updateTitle(conversationId: string, title: string): Promise<void>;
  delete(conversationId: string): Promise<void>;
}
