/**
 * Component: Admin Blocklist — Filter Picker Row
 * Documentation: documentation/admin-features/release-blocklist.md
 *
 * Two visible filter controls in v1: Source dropdown + Date Range.
 * Plus a "Clear all filters" affordance when any filter or search is active.
 *
 * Mirrors the logs/components/LogsFilters layout. Consumes
 * useBlocklistUrlState() directly — no prop drilling.
 */

'use client';

import { useBlocklistUrlState } from '../hooks/useBlocklistUrlState';
import {
  BlocklistFacets,
  BlockSourceFilter,
  hasActiveFilters,
  hasActiveSearch,
  SOURCE_LABELS,
  VALID_SOURCES,
} from '../types';
import BlocklistDateRangePicker from './BlocklistDateRangePicker';
import { INPUT_CLASS, LABEL_CLASS } from '@/app/admin/logs/components/filter-styles';

export default function BlocklistFilters({ facets }: { facets?: BlocklistFacets }) {
  const { filters, setFilters, clearAll } = useBlocklistUrlState();
  const showClearAll = hasActiveFilters(filters) || hasActiveSearch(filters);

  return (
    <div className="mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <SourceDropdown
          value={filters.source}
          available={facets?.sources}
          onChange={(value) => setFilters({ source: value })}
        />
        <BlocklistDateRangePicker
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onChange={(next) => setFilters(next)}
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

function SourceDropdown({
  value,
  available,
  onChange,
}: {
  value: BlockSourceFilter;
  available?: string[];
  onChange: (value: BlockSourceFilter) => void;
}) {
  // Only offer sources present in the data (canonical order preserved);
  // 'all' always renders. Until facets load, fall back to the full list so
  // the current selection always has a matching option.
  const options = available
    ? VALID_SOURCES.filter((opt) => opt === 'all' || available.includes(opt))
    : VALID_SOURCES;
  return (
    <div>
      <label className={LABEL_CLASS} htmlFor="blocklist-source-filter">Source</label>
      <select
        id="blocklist-source-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as BlockSourceFilter)}
        className={INPUT_CLASS}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {SOURCE_LABELS[opt]}
          </option>
        ))}
      </select>
    </div>
  );
}
