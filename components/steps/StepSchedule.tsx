'use client';
import { ArrowRight, ArrowLeft, Heart, Star, Users } from 'lucide-react';
import { TierSchedules, TierSchedule, DAY_NAMES } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  schedules: TierSchedules;
  onChange: (schedules: TierSchedules) => void;
  onNext: () => void;
  onBack: () => void;
  othersCount: number;
}

interface TierFormProps {
  label: string;
  icon: React.ReactNode;
  accentClass: string;
  schedule: TierSchedule;
  onChange: (s: TierSchedule) => void;
  showPreferredDays?: boolean;
  intervalLabel: string;
  intervalUnit: 'days' | 'weeks';
}

function TierForm({
  label,
  icon,
  accentClass,
  schedule,
  onChange,
  showPreferredDays,
  intervalLabel,
  intervalUnit,
}: TierFormProps) {
  const update = (patch: Partial<TierSchedule>) => onChange({ ...schedule, ...patch });

  const intervalValue =
    intervalUnit === 'weeks'
      ? Math.round(schedule.intervalDays / 7)
      : schedule.intervalDays;

  const setInterval = (v: number) =>
    update({ intervalDays: intervalUnit === 'weeks' ? v * 7 : v });

  const toggleDay = (d: number) => {
    const days = schedule.preferredDays.includes(d)
      ? schedule.preferredDays.filter((x) => x !== d)
      : [...schedule.preferredDays, d].sort();
    update({ preferredDays: days });
  };

  const timeStr = `${String(schedule.defaultHour).padStart(2, '0')}:${String(
    schedule.defaultMinute
  ).padStart(2, '0')}`;

  const setTime = (val: string) => {
    const [h, m] = val.split(':').map(Number);
    update({ defaultHour: h || 0, defaultMinute: m || 0 });
  };

  // Plain-English summary
  const freqText =
    intervalUnit === 'days'
      ? `Every ${intervalValue} day${intervalValue !== 1 ? 's' : ''}`
      : intervalValue === 2
      ? 'Fortnightly'
      : `Every ${intervalValue} weeks`;
  const daysText =
    schedule.preferredDays.length === 7
      ? 'any day'
      : schedule.preferredDays.map((d) => DAY_NAMES[d]).join(', ') || 'no day selected';

  return (
    <div className={`rounded-2xl border p-5 ${accentClass}`}>
      <div className="mb-4 flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-gray-900">{label}</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Interval */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">{intervalLabel}</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={intervalUnit === 'days' ? 30 : 12}
              value={intervalValue}
              onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            <span className="text-sm text-gray-500">{intervalUnit}</span>
          </div>
        </div>

        {/* Default time */}
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Default time</label>
          <input
            type="time"
            value={timeStr}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {/* Preferred days (for Others tier) */}
      {showPreferredDays && (
        <div className="mt-4">
          <label className="mb-2 block text-xs font-medium text-gray-600">Preferred days</label>
          <div className="flex gap-1.5 flex-wrap">
            {DAY_NAMES.map((name, d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-all border',
                  schedule.preferredDays.includes(d)
                    ? 'border-violet-400 bg-violet-100 text-violet-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-violet-200'
                )}
              >
                {name}
              </button>
            ))}
          </div>
          {schedule.preferredDays.length === 0 && (
            <p className="mt-1 text-xs text-red-500">Select at least one day.</p>
          )}
        </div>
      )}

      {/* Reminder */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-medium text-gray-600">Reminder before</label>
        <div className="flex items-center gap-2">
          <select
            value={schedule.reminderMinutes}
            onChange={(e) => update({ reminderMinutes: parseInt(e.target.value) })}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
          >
            {[5, 10, 15, 30, 60].map((m) => (
              <option key={m} value={m}>
                {m < 60 ? `${m} min` : '1 hour'}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">before</span>
        </div>
      </div>

      {/* Summary */}
      <p className="mt-4 text-xs text-gray-500 bg-white/60 rounded-lg px-3 py-2">
        {freqText} at {timeStr} · {daysText}
      </p>
    </div>
  );
}

export function StepSchedule({ schedules, onChange, onNext, onBack, othersCount }: Props) {
  const cycleWeeks = Math.ceil(
    Math.ceil(othersCount / schedules.others.contactsPerSlot) /
      Math.max(1, schedules.others.preferredDays.length)
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Configure your schedule</h2>
        <p className="mt-2 text-gray-500">
          Set the frequency and timing for each tier. These become your recurring calendar reminders.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <TierForm
          label="Family"
          icon={<Heart size={16} className="text-rose-500" />}
          accentClass="border-rose-100 bg-rose-50/30"
          schedule={schedules.family}
          onChange={(s) => onChange({ ...schedules, family: s })}
          intervalLabel="Reach out every"
          intervalUnit="days"
        />

        <TierForm
          label="Close Friends"
          icon={<Star size={16} className="text-violet-500" />}
          accentClass="border-violet-100 bg-violet-50/30"
          schedule={schedules.close}
          onChange={(s) => onChange({ ...schedules, close: s })}
          intervalLabel="Reach out every"
          intervalUnit="weeks"
        />

        <TierForm
          label="Everyone Else"
          icon={<Users size={16} className="text-sky-500" />}
          accentClass="border-sky-100 bg-sky-50/30"
          schedule={schedules.others}
          onChange={(s) => onChange({ ...schedules, others: s })}
          showPreferredDays
          intervalLabel="Contacts per slot"
          intervalUnit="days"
        />
      </div>

      {/* Others cycle info */}
      {othersCount > 0 && (
        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
          With {othersCount} contacts at {schedules.others.contactsPerSlot}/slot on{' '}
          {schedules.others.preferredDays.length} day{schedules.others.preferredDays.length !== 1 ? 's' : ''}/week,
          each person will be reached approximately every{' '}
          <span className="font-medium text-gray-700">
            {cycleWeeks} week{cycleWeeks !== 1 ? 's' : ''}
          </span>{' '}
          (~{Math.round(cycleWeeks / 4.3)} months).
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={schedules.others.preferredDays.length === 0}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Generate calendar <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
