import type { HushhMessage } from "../../core/types";

export interface IMessageRepository {
  getByConversation(conversationId: string): Promise<HushhMessage[]>;
  add(conversationId: string, role: "user" | "assistant", content: string, mediaUrls?: string[]): Promise<HushhMessage>;
}
