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

    let limits = await this.mediaLimitsRepository.getLimits(user.id);

    // If no limits record exists yet (first-time user), create it so the
    // user is not incorrectly blocked from making their first upload.
    if (!limits) {
      await this.mediaLimitsRepository.ensureExists(user.id);
      limits = await this.mediaLimitsRepository.getLimits(user.id);
    }

    // If still null after ensureExists (storage error), fail open with false
    // rather than throwing — the caller can surface a friendly message.
    if (!limits) return false;

    return limits.remainingUploads > 0;
  }
}
