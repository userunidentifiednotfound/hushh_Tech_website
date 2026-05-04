import type { HushhConversation } from "../../core/types";
import type { IConversationRepository } from "../repositories/IConversationRepository";
import type { IUserRepository } from "../repositories/IUserRepository";
import { UnauthorizedError } from "../../core/errors";

export class CreateConversationUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly userRepository: IUserRepository
  ) {}
  async execute(title?: string): Promise<HushhConversation> {
    const user = await this.userRepository.getCurrentUser();
    if (!user) throw new UnauthorizedError();
    return this.conversationRepository.create(user.id, title);
  }
}
