/**
 * Component: Admin Logs — Filter Picker Row
 * Documentation: documentation/admin-dashboard.md
 *
 * Composition of five picker controls in a responsive grid plus a
 * "Clear all filters" affordance. Heavier controls (DateRangePicker and
 * UserTypeahead) live in sibling files to keep this composition file
 * comfortably under the per-file size cap.
 *
 *   Status select · Job Type select · Date Range · User typeahead · Audiobook text
 *
 * Each control registers a unique pause-on-interact reason so the page-level
 * auto-refresh halts while the admin is mid-interaction.
 *
 * Consumes useLogsUrlState() directly — no prop drilling.
 */

'use client';

import { useState } from 'react';
import { JOB_TYPE_LABELS } from '@/lib/constants/job-labels';
import { getStatusLabel, STATUS_OPTIONS } from '@/lib/constants/log-filters';
import { hasActiveFilters, hasActiveSearch, LogsFacets, VALID_STATUSES } from '../types';
import { useRegisterPauseReason } from '../hooks/useAutoRefreshControl';
import { useLogsUrlState } from '../hooks/useLogsUrlState';
import DateRangePicker from './DateRangePicker';
import UserTypeahead from './UserTypeahead';
import { INPUT_CLASS, LABEL_CLASS } from './filter-styles';

export default function LogsFilters({ facets }: { facets?: LogsFacets }) {
  const { filters, setFilters, clearAll } = useLogsUrlState();
  const showClearAll = hasActiveFilters(filters) || hasActiveSearch(filters);

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatusDropdown
          value={filters.status}
          available={facets?.statuses}
          onChange={(value) => setFilters({ status: value })}
        />
        <JobTypeDropdown
          value={filters.type}
          available={facets?.types}
          onChange={(value) => setFilters({ type: value })}
        />
        <DateRangePicker
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onChange={(next) => setFilters(next)}
        />
        <UserTypeahead
          userId={filters.userId}
          onChange={(id) => setFilters({ userId: id })}
        />
        <AudiobookInput
          value={filters.audiobookQuery}
          onChange={(value) => setFilters({ audiobookQuery: value })}
        />
      </div>
      {showClearAll && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors min-h-[44px]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Facet ordering — canonical values first (in canonical order), unknown values
// appended alphabetically so nothing the API reports is ever dropped.
// ---------------------------------------------------------------------------
function orderFacet(available: string[], canonical: readonly string[]): string[] {
  const known = canonical.filter((v) => v !== 'all' && available.includes(v));
  const unknown = available.filter((v) => !canonical.includes(v)).sort();
  return [...known, ...unknown];
}

/** Fallback label for job types missing from JOB_TYPE_LABELS. */
function prettifyJobType(key: string): string {
  return key
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// Status dropdown
// ---------------------------------------------------------------------------
function StatusDropdown({
  value,
  available,
  onChange,
}: {
  value: string;
  available?: string[];
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  useRegisterPauseReason('logs-status-dropdown', focused);
  // Until facets load, fall back to the full static list so the current
  // selection always has a matching option.
  const options = available
    ? [
        { value: 'all', label: getStatusLabel('all') },
        ...orderFacet(available, VALID_STATUSES).map((v) => ({
          value: v,
          label: getStatusLabel(v),
        })),
      ]
    : STATUS_OPTIONS;
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor="logs-status-filter">Status</label>
      <select
        id="logs-status-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={INPUT_CLASS}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Job-type dropdown
// ---------------------------------------------------------------------------
function JobTypeDropdown({
  value,
  available,
  onChange,
}: {
  value: string;
  available?: string[];
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  useRegisterPauseReason('logs-type-dropdown', focused);
  const typeKeys = available
    ? orderFacet(available, Object.keys(JOB_TYPE_LABELS))
    : Object.keys(JOB_TYPE_LABELS);
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor="logs-type-filter">Job Type</label>
      <select
        id="logs-type-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={INPUT_CLASS}
      >
        <option value="all">All Types</option>
        {typeKeys.map((key) => (
          <option key={key} value={key}>
            {JOB_TYPE_LABELS[key] ?? prettifyJobType(key)}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Audiobook free-text input (matches title OR author server-side)
// ---------------------------------------------------------------------------
function AudiobookInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  useRegisterPauseReason('logs-book-input', focused);
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor="logs-audiobook-input">Audiobook</label>
      <input
        id="logs-audiobook-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Title or author"
        className={INPUT_CLASS}
      />
    </div>
  );
}
