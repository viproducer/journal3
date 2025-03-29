import { ReactNode } from 'react';
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'creator' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  subscribedTemplates: string[]; // IDs of marketplace templates user has subscribed to
  settings: {
    theme?: string;
    notifications?: boolean;
    privacy?: {
      shareJournals?: boolean;
      allowAnalytics?: boolean;
    };
  };
}

export interface Journal {
  id?: string;
  userId: string;
  name: string;
  description?: string;
  templateId?: string;
  isActive: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  color?: string;
  entries?: JournalEntry[];
  settings?: {
    isPrivate: boolean;
    allowComments: boolean;
    allowSharing: boolean;
    customFields?: Record<string, any>;
  };
  stats?: {
    totalEntries: number;
    lastEntryDate?: Date;
    streakCount?: number;
  };
  metadata?: Record<string, any>;
}

export interface JournalEntry {
  id?: string;
  userId: string;
  journalId: string;
  content: string;
  category: string;
  type: string;
  mood?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
  metadata?: Record<string, any>;
  startTime?: Date;
  endTime?: Date;
  timeSpent?: number;
  relatedGoals?: string[];
}

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  isActive: boolean;
  isPublic: boolean;
  features: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  users?: number;
  rating?: number;
  settings: {
    allowCustomization: boolean;
    requireApproval: boolean;
    maxEntries: number;
  };
  fields: {
    id: string;
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    description?: string;
  }[];
}

export interface UserSubscription {
  id: string;
  userId: string;
  templateId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  settings?: Record<string, any>;
}

export type UnitType = "count" | "distance" | "time" | "weight" | "percentage" | "money" | "volume" | "swimming" | "running" | "cycling" | "strength";

export type Target = {
  name: string;
  value: string;
  unit: string;
  period: string;
  startValue: string;
  currentValue: string;
  unitType: UnitType;
  unitSystem: "metric" | "imperial";
  targetDate?: string;
  direction: 'min' | 'max';
};

export type Goal = {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: "Health" | "Finance" | "Personal Growth" | "Relationships" | "Creativity" | "Productivity" | "Other";
  type: string;
  targets: Target[];
  progress: number;
  goalStatement: string;
  goalWhy: string;
  nextSteps: string;
  milestones: any[];
  createdAt: any;
  updatedAt: any;
  metadata: {
    category: "Health" | "Finance" | "Personal Growth" | "Relationships" | "Creativity" | "Productivity" | "Other";
    type: string;
  };
};

export interface GoalProgress {
  id: string;
  goalId: string;
  value: number;
  unit: string;
  notes?: string;
  date: Date;
}

export type TrackingUpdate = {
  targetName: string;
  currentValue: number;
  photoUrls: string[];
  reflection: string;
  timestamp: Date;
};

export type ProgressData = {
  targetName: string;
  currentValue: number;
  photoUrls: string[];
  reflection: string;
  timestamp: Date;
};

export interface ProgressHistory {
  id: string;
  goalId: string;
  userId: string;
  targetName: string;
  value: string;
  currentValue: number;
  photoUrls: string[];
  reflection: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
} 