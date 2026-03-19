export interface Contact {
  id: string;
  name: string;
}

export type Tier = 'family' | 'close' | 'others' | 'skip';

export type TierAssignments = Record<string, Tier>;

export type Step = 'upload' | 'categorise' | 'schedule' | 'download';

export interface DayTimeOverride {
  hour: number;
  minute: number;
}

export interface TierSchedule {
  intervalDays: number;
  preferredDays: number[];        // 0=Sun, 1=Mon, ..., 6=Sat
  defaultHour: number;
  defaultMinute: number;
  dayTimeOverrides: Partial<Record<number, DayTimeOverride>>;
  reminderMinutes: number;
  durationMinutes: number;
  contactsPerSlot: number;        // for Others tier batching
}

export interface TierSchedules {
  family: TierSchedule;
  close: TierSchedule;
  others: TierSchedule;
}

export const DEFAULT_SCHEDULES: TierSchedules = {
  family: {
    intervalDays: 2,
    preferredDays: [1, 2, 3, 4, 5],
    defaultHour: 18,
    defaultMinute: 0,
    dayTimeOverrides: {
      6: { hour: 10, minute: 0 },
      0: { hour: 13, minute: 0 },
    },
    reminderMinutes: 15,
    durationMinutes: 15,
    contactsPerSlot: 1,
  },
  close: {
    intervalDays: 14,
    preferredDays: [1, 2, 3, 4, 5],
    defaultHour: 18,
    defaultMinute: 0,
    dayTimeOverrides: {
      6: { hour: 10, minute: 0 },
      0: { hour: 13, minute: 0 },
    },
    reminderMinutes: 15,
    durationMinutes: 15,
    contactsPerSlot: 1,
  },
  others: {
    intervalDays: 0,
    preferredDays: [4, 2, 6, 0],   // Thu, Tue, Sat, Sun
    defaultHour: 18,
    defaultMinute: 0,
    dayTimeOverrides: {
      6: { hour: 10, minute: 0 },
      0: { hour: 13, minute: 0 },
    },
    reminderMinutes: 15,
    durationMinutes: 15,
    contactsPerSlot: 4,
  },
};

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TIER_LABELS: Record<Tier, string> = {
  family: 'Family',
  close: 'Close Friend',
  others: 'Everyone Else',
  skip: 'Skip',
};

export const TIER_COLORS: Record<Tier, string> = {
  family: 'bg-rose-100 text-rose-700 border-rose-200',
  close: 'bg-violet-100 text-violet-700 border-violet-200',
  others: 'bg-sky-100 text-sky-700 border-sky-200',
  skip: 'bg-gray-100 text-gray-500 border-gray-200',
};

export const TIER_BUTTON_COLORS: Record<Tier, string> = {
  family: 'bg-rose-500 hover:bg-rose-600 text-white',
  close: 'bg-violet-500 hover:bg-violet-600 text-white',
  others: 'bg-sky-500 hover:bg-sky-600 text-white',
  skip: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
};
