export interface HushhUser {
  id: string;
  supabaseUserId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  lastLoginAt: Date;
  totalMessages: number;
  totalConversations: number;
  isActive: boolean;
}

export interface HushhConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HushhMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  mediaUrls: string[];
  createdAt: Date;
}

export interface MediaLimits {
  dailyUploads: number;
  maxDailyUploads: number;
  remainingUploads: number;
  lastReset: Date;
}

export const HUSHH_LIMITS = {
  MAX_DAILY_UPLOADS: 20,
} as const;
