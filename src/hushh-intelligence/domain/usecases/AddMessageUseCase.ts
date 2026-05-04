import type { HushhMessage } from "../../core/types";
import type { IMessageRepository } from "../repositories/IMessageRepository";
import { ValidationError } from "../../core/errors";

export class AddMessageUseCase {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(
    conversationId: string,
    role: "user" | "assistant",
    content: string,
    mediaUrls?: string[]
  ): Promise<HushhMessage> {
    if (!conversationId.trim()) {
      throw new ValidationError("conversationId is required");
    }
    if (!content.trim()) {
      throw new ValidationError("content must not be empty");
    }
    return this.messageRepository.add(conversationId, role, content, mediaUrls);
  }
}
