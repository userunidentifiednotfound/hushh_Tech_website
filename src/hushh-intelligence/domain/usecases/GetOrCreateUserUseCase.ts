import type { HushhUser } from "../../core/types";
import type { IUserRepository } from "../repositories/IUserRepository";

export class GetOrCreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(): Promise<HushhUser | null> {
    return this.userRepository.getOrCreate();
  }
}
