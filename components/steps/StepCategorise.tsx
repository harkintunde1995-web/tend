'use client';
import { useState, useMemo, useCallback } from 'react';
import { Search, Users, Heart, Star, ArrowRight, SkipForward } from 'lucide-react';
import { Contact, Tier, TierAssignments, TIER_LABELS } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  contacts: Contact[];
  assignments: TierAssignments;
  onChange: (assignments: TierAssignments) => void;
  onNext: () => void;
}

const TIERS: { id: Tier; label: string; icon: React.ReactNode; color: string; activeColor: string }[] = [
  {
    id: 'family',
    label: 'Family',
    icon: <Heart size={12} />,
    color: 'border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-500',
    activeColor: 'border-rose-400 bg-rose-50 text-rose-600 font-semibold',
  },
  {
    id: 'close',
    label: 'Close',
    icon: <Star size={12} />,
    color: 'border-gray-200 text-gray-500 hover:border-violet-300 hover:text-violet-500',
    activeColor: 'border-violet-400 bg-violet-50 text-violet-600 font-semibold',
  },
  {
    id: 'others',
    label: 'Others',
    icon: <Users size={12} />,
    color: 'border-gray-200 text-gray-500 hover:border-sky-300 hover:text-sky-500',
    activeColor: 'border-sky-400 bg-sky-50 text-sky-600 font-semibold',
  },
  {
    id: 'skip',
    label: 'Skip',
    icon: <SkipForward size={12} />,
    color: 'border-gray-200 text-gray-500 hover:border-gray-300',
    activeColor: 'border-gray-300 bg-gray-100 text-gray-500',
  },
];

const TIER_SUMMARY_COLORS: Record<Tier, string> = {
  family: 'bg-rose-100 text-rose-700',
  close: 'bg-violet-100 text-violet-700',
  others: 'bg-sky-100 text-sky-700',
  skip: 'bg-gray-100 text-gray-500',
};

const PAGE_SIZE = 60;

export function StepCategorise({ contacts, assignments, onChange, onNext }: Props) {
  const [query, setQuery] = useState('');
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const [activeFilter, setActiveFilter] = useState<Tier | 'unassigned' | 'all'>('all');

  const setTier = useCallback(
    (id: string, tier: Tier) => {
      onChange({ ...assignments, [id]: tier });
    },
    [assignments, onChange]
  );

  const assignAllVisible = (tier: Tier) => {
    const updates: TierAssignments = { ...assignments };
    filtered.forEach((c) => {
      if (!assignments[c.id]) updates[c.id] = tier;
    });
    onChange(updates);
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { family: 0, close: 0, others: 0, skip: 0, unassigned: 0 };
    contacts.forEach((contact) => {
      const t = assignments[contact.id];
      if (t) c[t]++;
      else c.unassigned++;
    });
    return c;
  }, [contacts, assignments]);

  const filtered = useMemo(() => {
    let list = contacts;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (activeFilter === 'unassigned') {
      list = list.filter((c) => !assignments[c.id]);
    } else if (activeFilter !== 'all') {
      list = list.filter((c) => assignments[c.id] === activeFilter);
    }
    return list;
  }, [contacts, query, assignments, activeFilter]);

  const assigned = contacts.filter((c) => assignments[c.id] && assignments[c.id] !== 'skip').length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Categorise your contacts</h2>
        <p className="mt-2 text-gray-500">
          Assign each person to a tier. You&apos;ll set your own schedule on the next step.
        </p>
      </div>

      {/* Tier key — labels only, no preset frequencies */}
      <div className="mb-6 grid grid-cols-3 gap-3 text-center text-xs">
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-3">
          <Heart size={16} className="mx-auto mb-1 text-rose-500" />
          <p className="font-semibold text-rose-700">Family</p>
          <p className="text-rose-400">Your closest people</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-violet-50 p-3">
          <Star size={16} className="mx-auto mb-1 text-violet-500" />
          <p className="font-semibold text-violet-700">Close Friends</p>
          <p className="text-violet-400">Important relationships</p>
        </div>
        <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
          <Users size={16} className="mx-auto mb-1 text-sky-500" />
          <p className="font-semibold text-sky-700">Everyone Else</p>
          <p className="text-sky-400">Worth staying in touch</p>
        </div>
      </div>

      {/* Counts bar */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(['all', 'unassigned', 'family', 'close', 'others', 'skip'] as const).map((f) => {
          const count = f === 'all' ? contacts.length : counts[f];
          const label = f === 'all' ? 'All' : f === 'unassigned' ? 'Unassigned' : TIER_LABELS[f];
          const colorMap: Record<string, string> = {
            all: 'bg-gray-100 text-gray-700',
            unassigned: counts.unassigned > 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400',
            family: TIER_SUMMARY_COLORS.family,
            close: TIER_SUMMARY_COLORS.close,
            others: TIER_SUMMARY_COLORS.others,
            skip: TIER_SUMMARY_COLORS.skip,
          };
          return (
            <button
              key={f}
              onClick={() => { setActiveFilter(f); setShowCount(PAGE_SIZE); }}
              className={clsx(
                'rounded-full px-3 py-1 text-xs font-medium transition-all',
                colorMap[f],
                activeFilter === f ? 'ring-2 ring-offset-1 ring-gray-400' : 'opacity-80 hover:opacity-100'
              )}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          placeholder="Search contacts…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowCount(PAGE_SIZE); }}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
        />
      </div>

      {/* Bulk action */}
      {activeFilter === 'unassigned' && counts.unassigned > 0 && (
        <div className="mb-3 flex gap-2 rounded-xl bg-amber-50 p-3 text-sm">
          <span className="text-amber-700 font-medium">{counts.unassigned} unassigned.</span>
          <span className="text-amber-600">Assign all as:</span>
          {(['others', 'skip'] as Tier[]).map((t) => (
            <button
              key={t}
              onClick={() => assignAllVisible(t)}
              className="font-semibold text-amber-800 underline underline-offset-2 hover:text-amber-900"
            >
              {TIER_LABELS[t]}
            </button>
          ))}
        </div>
      )}

      {/* Contact list */}
      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400">No contacts match.</p>
        ) : (
          <>
            {filtered.slice(0, showCount).map((contact) => {
              const current = assignments[contact.id];
              return (
                <div
                  key={contact.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                      {contact.name[0]?.toUpperCase() ?? '?'}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{contact.name}</span>
                  </div>
                  <div className="flex shrink-0 gap-1 pl-11 sm:pl-0">
                    {TIERS.map((tier) => (
                      <button
                        key={tier.id}
                        onClick={() => setTier(contact.id, tier.id)}
                        className={clsx(
                          'flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-all',
                          current === tier.id ? tier.activeColor : tier.color
                        )}
                      >
                        {tier.icon}
                        <span>{tier.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {filtered.length > showCount && (
              <button
                onClick={() => setShowCount((n) => n + PAGE_SIZE)}
                className="w-full py-3 text-sm font-medium text-violet-600 hover:bg-violet-50"
              >
                Show more ({filtered.length - showCount} remaining)
              </button>
            )}
          </>
        )}
      </div>

      {/* Next */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {assigned} contact{assigned !== 1 ? 's' : ''} assigned
          {counts.unassigned > 0 && (
            <span className="ml-2 text-amber-600">· {counts.unassigned} unassigned (will be skipped)</span>
          )}
        </p>
        <button
          onClick={onNext}
          disabled={assigned === 0}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
