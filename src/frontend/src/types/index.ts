import type { Difficulty, Role } from "../backend";

export type { Difficulty, Role };

export interface UserProfile {
  displayName: string;
  userId: string;
  createdAt: bigint;
  photoCount: bigint;
}

export interface PoseIdea {
  id: bigint;
  name: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  isFavorite: boolean;
  savedAt: bigint;
}

export interface ShootPlan {
  id: bigint;
  name: string;
  location: string;
  scheduledDate?: string;
  poseIds: bigint[];
  shotList: string[];
  notes: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface ChatMessage {
  id: bigint;
  content: string;
  role: Role;
  timestamp: bigint;
}

export type NavItem = {
  label: string;
  path: string;
  icon: string;
};
