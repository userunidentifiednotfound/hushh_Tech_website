import type { IMediaLimitsRepository } from "../repositories/IMediaLimitsRepository";
import type { IUserRepository } from "../repositories/IUserRepository";
import { UnauthorizedError } from "../../core/errors";

export class CheckMediaUploadUseCase {
  constructor(
    private readonly mediaLimitsRepository: IMediaLimitsRepository,
    private readonly userRepository: IUserRepository
  ) {}
  async execute(): Promise<boolean> {
    const user = await this.userRepository.getCurrentUser();
    if (!user) throw new UnauthorizedError();
    const limits = await this.mediaLimitsRepository.getLimits(user.id);
    if (!limits) return false;
    return limits.remainingUploads > 0;
  }
}
