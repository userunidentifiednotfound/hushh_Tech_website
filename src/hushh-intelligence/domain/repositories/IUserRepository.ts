import type { HushhUser } from "../../core/types";

export interface IUserRepository {
  getCurrentUser(): Promise<HushhUser | null>;
  getOrCreate(): Promise<HushhUser | null>;
  touchLastLogin(userId: string): Promise<void>;
}
