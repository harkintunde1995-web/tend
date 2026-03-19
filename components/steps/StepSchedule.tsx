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
  borderClass: string;
  bgClass: string;
  accentBtn: string;
  schedule: TierSchedule;
  onChange: (s: TierSchedule) => void;
  isOthers?: boolean;
}

function TierForm({ label, icon, borderClass, bgClass, accentBtn, schedule, onChange, isOthers }: TierFormProps) {
  const update = (patch: Partial<TierSchedule>) => onChange({ ...schedule, ...patch });

  // Derive display unit from intervalDays
  const getUnit = () => {
    if (schedule.intervalDays % 30 === 0 && schedule.intervalDays >= 30) return 'months';
    if (schedule.intervalDays % 7 === 0 && schedule.intervalDays >= 7) return 'weeks';
    return 'days';
  };
  const unit = getUnit();
  const displayValue =
    unit === 'months' ? schedule.intervalDays / 30
    : unit === 'weeks' ? schedule.intervalDays / 7
    : schedule.intervalDays;

  const setFrequency = (val: number, u: string) => {
    const days = u === 'months' ? val * 30 : u === 'weeks' ? val * 7 : val;
    update({ intervalDays: Math.max(1, days) });
  };

  const toggleDay = (d: number) => {
    const days = schedule.preferredDays.includes(d)
      ? schedule.preferredDays.filter((x) => x !== d)
      : [...schedule.preferredDays, d].sort();
    update({ preferredDays: days });
  };

  const timeStr = `${String(schedule.defaultHour).padStart(2, '0')}:${String(schedule.defaultMinute).padStart(2, '0')}`;
  const setTime = (val: string) => {
    const [h, m] = val.split(':').map(Number);
    update({ defaultHour: h || 0, defaultMinute: m || 0 });
  };

  return (
    <div className={`rounded-2xl border ${borderClass} overflow-hidden`}>
      {/* Header */}
      <div className={`flex items-center gap-2 px-5 py-3 ${bgClass}`}>
        {icon}
        <h3 className="font-semibold text-gray-900">{label}</h3>
      </div>

      <div className="px-5 py-4 grid gap-5">
        {/* Row 1: Frequency */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            How often to reach out
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Every</span>
            <input
              type="number"
              min={1}
              max={unit === 'months' ? 12 : unit === 'weeks' ? 52 : 365}
              value={displayValue}
              onChange={(e) => setFrequency(parseInt(e.target.value) || 1, unit)}
              className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-center font-medium focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            <select
              value={unit}
              onChange={(e) => setFrequency(displayValue, e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            >
              <option value="days">days</option>
              <option value="weeks">weeks</option>
              <option value="months">months</option>
            </select>
          </div>
        </div>

        {/* Row 2: Time + Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Default time
            </label>
            <input
              type="time"
              value={timeStr}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Call duration
            </label>
            <select
              value={schedule.durationMinutes}
              onChange={(e) => update({ durationMinutes: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
            >
              {[5, 10, 15, 20, 30, 45, 60, 90, 120].map((m) => (
                <option key={m} value={m}>
                  {m < 60 ? `${m} min` : `${m / 60} hr${m > 60 ? 's' : ''}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Reminder */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Reminder before event
          </label>
          <div className="flex gap-2 flex-wrap">
            {[5, 10, 15, 30, 60].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update({ reminderMinutes: m })}
                className={clsx(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                  schedule.reminderMinutes === m
                    ? `${accentBtn} border-transparent`
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                )}
              >
                {m < 60 ? `${m} min` : '1 hr'}
              </button>
            ))}
          </div>
        </div>

        {/* Row 4: Preferred days (all tiers) */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Preferred days
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {DAY_NAMES.map((name, d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={clsx(
                  'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                  schedule.preferredDays.includes(d)
                    ? `${accentBtn} border-transparent`
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
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

        {/* Row 5: Contacts per slot (Others only) */}
        {isOthers && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Contacts per slot (rotation)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={20}
                value={schedule.contactsPerSlot}
                onChange={(e) => update({ contactsPerSlot: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-center font-medium focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
              <span className="text-xs text-gray-500">
                people share each calendar slot, rotating across your chosen days
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Summary strip */}
      <div className={`px-5 py-2.5 ${bgClass} text-xs text-gray-500 border-t ${borderClass}`}>
        Every {displayValue} {unit} · {schedule.durationMinutes} min call · {timeStr} ·{' '}
        {schedule.preferredDays.length === 7
          ? 'any day'
          : schedule.preferredDays.map((d) => DAY_NAMES[d]).join(', ') || 'no days'}
        {isOthers && ` · ${schedule.contactsPerSlot}/slot`}
      </div>
    </div>
  );
}

export function StepSchedule({ schedules, onChange, onNext, onBack, othersCount }: Props) {
  const cycleWeeks = othersCount > 0 && schedules.others.preferredDays.length > 0
    ? Math.ceil(
        Math.ceil(othersCount / schedules.others.contactsPerSlot) /
          Math.max(1, schedules.others.preferredDays.length)
      )
    : null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Set your schedule</h2>
        <p className="mt-2 text-gray-500">
          Choose how often, when, and how long — for each tier.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        <TierForm
          label="Family"
          icon={<Heart size={16} className="text-rose-500" />}
          borderClass="border-rose-100"
          bgClass="bg-rose-50/50"
          accentBtn="bg-rose-500 text-white"
          schedule={schedules.family}
          onChange={(s) => onChange({ ...schedules, family: s })}
        />
        <TierForm
          label="Close Friends"
          icon={<Star size={16} className="text-violet-500" />}
          borderClass="border-violet-100"
          bgClass="bg-violet-50/50"
          accentBtn="bg-violet-500 text-white"
          schedule={schedules.close}
          onChange={(s) => onChange({ ...schedules, close: s })}
        />
        <TierForm
          label="Everyone Else"
          icon={<Users size={16} className="text-sky-500" />}
          borderClass="border-sky-100"
          bgClass="bg-sky-50/50"
          accentBtn="bg-sky-500 text-white"
          schedule={schedules.others}
          onChange={(s) => onChange({ ...schedules, others: s })}
          isOthers
        />
      </div>

      {/* Rotation estimate */}
      {cycleWeeks !== null && othersCount > 0 && (
        <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 text-sm text-gray-500">
          With <span className="font-medium text-gray-700">{othersCount}</span> contacts,{' '}
          <span className="font-medium text-gray-700">{schedules.others.contactsPerSlot}</span>/slot, on{' '}
          <span className="font-medium text-gray-700">{schedules.others.preferredDays.length}</span> day
          {schedules.others.preferredDays.length !== 1 ? 's' : ''}/week — each person comes up roughly every{' '}
          <span className="font-medium text-gray-700">
            {cycleWeeks} week{cycleWeeks !== 1 ? 's' : ''}
          </span>{' '}
          (~{Math.max(1, Math.round(cycleWeeks / 4.3))} month{Math.round(cycleWeeks / 4.3) !== 1 ? 's' : ''}).
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
