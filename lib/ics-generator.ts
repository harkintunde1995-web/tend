import { Contact, TierAssignments, TierSchedule, TierSchedules } from './types';

// ── Helpers ────────────────────────────────────────────────────────────────

function escapeICS(text: string): string {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Fold long ICS lines at 75 octets (RFC 5545 §3.1).
 * Continuation lines start with a single space.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const MAX = 75;
  if (encoder.encode(line).length <= MAX) return line;

  const result: string[] = [];
  let current = '';
  let currentBytes = 0;

  for (const char of line) {
    const charBytes = encoder.encode(char).length;
    if (currentBytes + charBytes > MAX) {
      result.push(current);
      current = ' ' + char;
      currentBytes = 1 + charBytes;
    } else {
      current += char;
      currentBytes += charBytes;
    }
  }
  if (current) result.push(current);
  return result.join('\r\n');
}

function formatDT(d: Date): string {
  // UTC format: 20260319T180000Z
  return (
    d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, '0') +
    String(d.getUTCDate()).padStart(2, '0') +
    'T' +
    String(d.getUTCHours()).padStart(2, '0') +
    String(d.getUTCMinutes()).padStart(2, '0') +
    '00Z'
  );
}

function makeUID(): string {
  return `${Math.random().toString(36).slice(2)}-${Date.now()}@keep-in-touch`;
}

/**
 * Given a reference date, find the next occurrence of a day-of-week
 * on or after that date. dayOfWeek: 0=Sun, 1=Mon, ..., 6=Sat
 */
function nextOccurrence(from: Date, dayOfWeek: number): Date {
  const d = new Date(from);
  d.setUTCHours(0, 0, 0, 0);
  const diff = (dayOfWeek - d.getUTCDay() + 7) % 7;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

/**
 * Add days to a date, returning a new Date.
 */
function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}

function addWeeks(d: Date, weeks: number): Date {
  return addDays(d, weeks * 7);
}

// Slot offsets (minutes) for multiple contacts in the same day-slot
const SLOT_OFFSETS: Record<number, number[]> = {
  0: [0, 30, 60, 90],   // Sunday
  6: [0, 30, 60, 90],   // Saturday
};
function getSlotOffsets(dow: number): number[] {
  return SLOT_OFFSETS[dow] ?? [0, 15, 30, 45];
}

// ── Event builder ──────────────────────────────────────────────────────────

function makeEvent(params: {
  uid: string;
  dtstart: string;
  summary: string;
  description: string;
  categories: string;
  rrule: string;
  durationMinutes: number;
  reminderMinutes: number;
}): string {
  const dtstamp = formatDT(new Date());
  const lines = [
    'BEGIN:VEVENT',
    `UID:${params.uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${params.dtstart}`,
    `DURATION:PT${params.durationMinutes}M`,
    foldLine(`SUMMARY:${escapeICS(params.summary)}`),
    foldLine(`DESCRIPTION:${escapeICS(params.description)}`),
    `CATEGORIES:${escapeICS(params.categories)}`,
    `RRULE:${params.rrule}`,
    'BEGIN:VALARM',
    `TRIGGER:-PT${params.reminderMinutes}M`,
    'ACTION:DISPLAY',
    foldLine(`DESCRIPTION:${escapeICS(params.summary)}`),
    'END:VALARM',
    'END:VEVENT',
  ];
  return lines.join('\r\n') + '\r\n';
}

// ── Per-tier generators ────────────────────────────────────────────────────

/**
 * Family: each contact recurs every N days (FREQ=DAILY;INTERVAL=N).
 * Start dates staggered by 1 day each.
 */
function generateFamilyEvents(
  contacts: Contact[],
  schedule: TierSchedule,
  startDate: Date
): string[] {
  return contacts.map((contact, i) => {
    const start = addDays(startDate, i);
    const dow = start.getUTCDay();
    const override = schedule.dayTimeOverrides[dow];
    const h = override?.hour ?? schedule.defaultHour;
    const m = override?.minute ?? schedule.defaultMinute;
    const dt = new Date(start);
    dt.setUTCHours(h, m, 0, 0);

    return makeEvent({
      uid: makeUID(),
      dtstart: formatDT(dt),
      summary: `📞 Check in: ${contact.name}`,
      description: `Family reach-out — ${contact.name}. (Adjust time if it falls on a weekend.)`,
      categories: 'Family',
      rrule: `FREQ=DAILY;INTERVAL=${schedule.intervalDays}`,
      durationMinutes: schedule.durationMinutes,
      reminderMinutes: schedule.reminderMinutes,
    });
  });
}

/**
 * Close friends: biweekly (FREQ=WEEKLY;INTERVAL=2).
 * Start dates staggered by 1 day each.
 */
function generateCloseFriendsEvents(
  contacts: Contact[],
  schedule: TierSchedule,
  startDate: Date
): string[] {
  return contacts.map((contact, i) => {
    const start = addDays(startDate, i);
    const dow = start.getUTCDay();
    const override = schedule.dayTimeOverrides[dow];
    const h = override?.hour ?? schedule.defaultHour;
    const m = override?.minute ?? schedule.defaultMinute;
    const dt = new Date(start);
    dt.setUTCHours(h, m, 0, 0);

    return makeEvent({
      uid: makeUID(),
      dtstart: formatDT(dt),
      summary: `📞 Check in: ${contact.name}`,
      description: `Close friend catch-up — ${contact.name}. Fortnightly.`,
      categories: 'Close Friends',
      rrule: 'FREQ=WEEKLY;INTERVAL=2',
      durationMinutes: schedule.durationMinutes,
      reminderMinutes: schedule.reminderMinutes,
    });
  });
}

/**
 * Others: batched rotation across preferred days.
 * contactsPerSlot per day slot, cycling through all contacts.
 */
function generateOthersEvents(
  contacts: Contact[],
  schedule: TierSchedule,
  startDate: Date
): string[] {
  const { preferredDays, contactsPerSlot, dayTimeOverrides, defaultHour, defaultMinute } = schedule;
  const n = contactsPerSlot;
  const batches: Contact[][] = [];
  for (let i = 0; i < contacts.length; i += n) {
    batches.push(contacts.slice(i, i + n));
  }

  const totalBatches = batches.length;
  const daysPerCycle = preferredDays.length; // e.g. 4 preferred days
  const weeksPerCycle = Math.ceil(totalBatches / daysPerCycle);

  // Pre-compute first occurrence of each preferred day on/after startDate
  const dayStarts: Record<number, Date> = {};
  for (const dow of preferredDays) {
    dayStarts[dow] = nextOccurrence(startDate, dow);
  }

  const events: string[] = [];

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const daySlotIdx = batchIdx % daysPerCycle;
    const weekOffset = Math.floor(batchIdx / daysPerCycle);
    const dow = preferredDays[daySlotIdx];
    const baseDate = addWeeks(dayStarts[dow], weekOffset);
    const slotOffsets = getSlotOffsets(dow);
    const override = dayTimeOverrides[dow];
    const baseHour = override?.hour ?? defaultHour;
    const baseMin = override?.minute ?? defaultMinute;

    const batch = batches[batchIdx];
    batch.forEach((contact, personIdx) => {
      const totalMinutes = baseHour * 60 + baseMin + (slotOffsets[personIdx] ?? personIdx * 15);
      const h = Math.floor(totalMinutes / 60) % 24;
      const m = totalMinutes % 60;
      const dt = new Date(baseDate);
      dt.setUTCHours(h, m, 0, 0);

      events.push(
        makeEvent({
          uid: makeUID(),
          dtstart: formatDT(dt),
          summary: `📞 Reach out: ${contact.name}`,
          description: `Rotating contact — ${contact.name}.`,
          categories: 'Others',
          rrule: `FREQ=WEEKLY;INTERVAL=${weeksPerCycle}`,
          durationMinutes: schedule.durationMinutes,
          reminderMinutes: schedule.reminderMinutes,
        })
      );
    });
  }

  return events;
}

// ── Main export ────────────────────────────────────────────────────────────

export interface ICSResult {
  content: string;
  eventCount: number;
  fileName: string;
  cycleWeeks: number;
}

export function generateICS(
  contacts: Contact[],
  assignments: TierAssignments,
  schedules: TierSchedules
): ICSResult {
  const startDate = new Date();
  startDate.setUTCHours(0, 0, 0, 0);

  const familyContacts = contacts.filter((c) => assignments[c.id] === 'family');
  const closeContacts = contacts.filter((c) => assignments[c.id] === 'close');
  const othersContacts = contacts.filter((c) => assignments[c.id] === 'others');

  const familyEvents = generateFamilyEvents(familyContacts, schedules.family, startDate);
  const closeEvents = generateCloseFriendsEvents(closeContacts, schedules.close, startDate);
  const othersEvents = generateOthersEvents(othersContacts, schedules.others, startDate);

  const allEvents = [...familyEvents, ...closeEvents, ...othersEvents];

  const n = othersContacts.length;
  const dpc = schedules.others.preferredDays.length;
  const cps = schedules.others.contactsPerSlot;
  const cycleWeeks = Math.ceil(Math.ceil(n / cps) / dpc);

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Keep In Touch//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Tend',
    'X-WR-CALDESC:Scheduled reach-outs — Family | Close Friends | Everyone Else',
  ].join('\r\n') + '\r\n';

  const content = header + allEvents.join('') + 'END:VCALENDAR\r\n';

  return {
    content,
    eventCount: allEvents.length,
    fileName: 'keep-in-touch.ics',
    cycleWeeks,
  };
}

export function downloadICS(result: ICSResult): void {
  const blob = new Blob([result.content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = result.fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
