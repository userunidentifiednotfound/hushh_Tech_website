import type { HushhMessage } from "../../core/types";
import type { IMessageRepository } from "../repositories/IMessageRepository";

export class GetMessagesUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}
  async execute(conversationId: string): Promise<HushhMessage[]> {
    if (!conversationId.trim()) throw new Error("conversationId is required");
    return this.messageRepository.getByConversation(conversationId);
  }
}
