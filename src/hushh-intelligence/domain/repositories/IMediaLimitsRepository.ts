import type { MediaLimits } from "../../core/types";

export interface IMediaLimitsRepository {
  getLimits(userId: string): Promise<MediaLimits | null>;
  incrementUploadCount(userId: string): Promise<void>;
  ensureExists(userId: string): Promise<void>;
}
