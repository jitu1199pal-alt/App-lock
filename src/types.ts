export interface LockedApp {
  packageName: string;
  appName: string;
  isLocked: boolean;
  dailyLimit: number; // in minutes, 0 means unlimited
  usedMinutes: number;
  category: 'social' | 'video' | 'gaming' | 'utility' | 'productivity' | 'finance' | 'entertainment';
}

export type LockType = 'PIN' | 'PASSWORD' | 'PATTERN';

export interface FocusMode {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  blockedCategories: string[];
  blockedApps: string[]; // packageNames
}

export interface SecurityConfig {
  lockType: LockType;
  lockValue: string; // e.g., "1234" or pattern string
  securityName: string; // favorite name e.g., "Rahul"
  permissions: {
    usageStats: boolean;
    overlay: boolean;
    accessibility: boolean;
    batteryOptimization: boolean;
    notifications: boolean;
  };
  isConfigured: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  packageName: string;
  appName: string;
  type: 'blocked' | 'unlocked' | 'limit_reached' | 'time_extended' | 'focus_active';
  details: string;
}
