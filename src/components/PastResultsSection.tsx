import React, { useState } from 'react';
import { CurrencyConfig, MonthlyRecord } from '../types';
import { cleanCurrencySymbol, formatMoney } from '../utils/formatCurrency';
import { BarChart3, TrendingUp, Calendar, Plus, Trash2, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';

interface PastResultsSectionProps {
  history: MonthlyRecord[];
  currency: CurrencyConfig;
  onUpdateHistory: (history: MonthlyRecord[]) => void;
  onArchiveCurrentMonth: () => void;
}

export const PastResultsSection: React.FC<PastResultsSectionProps> = ({
  history,
  currency,
  onUpdateHistory,
  onArchiveCurrentMonth,
}) => {
  const sym = cleanCurrencySymbol(currency);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(
    history[history.length - 1]?.id || null
  );

  // Add new past record modal/form state
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [formMonth, setFormMonth] = useState('');
  const [formAllowance, setFormAllowance] = useState('');
  const [formSpent, setFormSpent] = useState('');
  const [formTopSector, setFormTopSector] = useState('Food');

  // Lifetime summary calculations
  const totalLifetimeSaved = history.reduce((sum, m) => sum + Math.max(0, m.remaining), 0);
  const totalLifetimeSpent = history.reduce((sum, m) => sum + m.totalSpent, 0);
  const avgMonthlySpent = history.length > 0 ? totalLifetimeSpent / history.length : 0;
  const underBudgetCount = history.filter((m) => m.remaining >= 0).length;
  const successRate = history.length > 0 ? Math.round((underBudgetCount / history.length) * 100) : 0;

  // Chart Dimensions & Scaling
  const maxVal = Math.max(...history.map((m) => Math.max(m.allowance, m.totalSpent)), 1000);
  const chartHeight = 180;
  const chartWidth = 520;
  const paddingX = 40;
  const paddingY = 25;
  const availableWidth = chartWidth - paddingX * 2;
  const stepX = history.length > 1 ? availableWidth / (history.length - 1) : availableWidth / 2;

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const allowanceNum = parseFloat(formAllowance);
    const spentNum = parseFloat(formSpent);
    if (!formMonth || isNaN(allowanceNum) || isNaN(spentNum)) return;

    // e.g. "2026-03" -> "Mar 2026"
    const dateObj = new Date(`${formMonth}-15`);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const newRecord: MonthlyRecord = {
      id: `hist-${Date.now()}`,
      monthKey: formMonth,
      label,
      allowance: allowanceNum,
      totalSpent: spentNum,
      remaining: allowanceNum - spentNum,
      topSector: formTopSector || 'General',
    };

    const updated = [...history, newRecord].sort((a, b) => a.monthKey.localeCompare(b.monthKey));
    onUpdateHistory(updated);
    setIsAddingRecord(false);
    setFormMonth('');
    setFormAllowance('');
    setFormSpent('');
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Delete this historical month record?')) {
      const updated = history.filter((m) => m.id !== id);
      onUpdateHistory(updated);
      if (selectedMonthId === id) {
        setSelectedMonthId(updated[updated.length - 1]?.id || null);
      }
    }
  };

  const activeRecord = history.find((m) => m.id === selectedMonthId) || history[history.length - 1];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            Total Saved (Past Months)
          </span>
          <span className="text-xl font-bold font-mono text-[#808000] dark:text-[#c4c43b] mt-1 block">
            {formatMoney(totalLifetimeSaved, currency)}
          </span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">
            Accumulated savings reserve
          </span>
        </div>

        <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            Average Monthly Spend
          </span>
          <span className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-1 block">
            {formatMoney(avgMonthlySpent, currency)}
          </span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">
            Across {history.length} recorded months
          </span>
        </div>

        <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            Budget Discipline
          </span>
          <span className="text-xl font-bold font-mono text-[#808000] dark:text-[#c4c43b] mt-1 block">
            {successRate}% Success
          </span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">
            {underBudgetCount} of {history.length} months under budget
          </span>
        </div>

        <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
            Latest Month Result
          </span>
          <span className={`text-xl font-bold font-mono mt-1 block ${
            activeRecord && activeRecord.remaining >= 0 ? 'text-[#808000] dark:text-[#c4c43b]' : 'text-rose-600'
          }`}>
            {activeRecord ? `${activeRecord.remaining >= 0 ? '+' : '-'}${formatMoney(Math.abs(activeRecord.remaining), currency)}` : 'N/A'}
          </span>
          <span className="text-[11px] text-stone-400 mt-0.5 block">
            {activeRecord ? activeRecord.label : 'No data'}
          </span>
        </div>
      </div>

      {/* Main Historical Graph Card */}
      <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Monthly Performance History
              </h2>
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              Comparison of planned allowance vs actual spending over past months
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onArchiveCurrentMonth}
              className="px-2.5 py-1 text-xs font-medium text-stone-700 dark:text-stone-200 bg-[#f4f4ee] hover:bg-[#e8e8de] dark:bg-[#25271f] dark:hover:bg-[#2e3126] rounded-md transition-colors flex items-center gap-1"
            >
              <Calendar className="w-3 h-3 text-[#808000]" />
              <span>Archive Current Month</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddingRecord(!isAddingRecord)}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-[#808000] hover:bg-[#6e6e00] rounded-md transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Past Record</span>
            </button>
          </div>
        </div>

        {/* Add Record Form */}
        {isAddingRecord && (
          <form
            onSubmit={handleCreateRecord}
            className="p-3 mb-4 rounded-lg bg-[#fbfbf9] dark:bg-[#141511] border border-[#e5e5dc] dark:border-[#2d3027] text-xs space-y-2 animate-in fade-in"
          >
            <span className="font-semibold text-stone-900 dark:text-stone-100 block">
              Log a Previous Month's Outcome
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Month (YYYY-MM)</label>
                <input
                  type="month"
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  required
                  className="w-full px-2 py-1 bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Allowance ({sym})</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 15000"
                  value={formAllowance}
                  onChange={(e) => setFormAllowance(e.target.value)}
                  required
                  className="w-full px-2 py-1 font-mono bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Total Spent ({sym})</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 12500"
                  value={formSpent}
                  onChange={(e) => setFormSpent(e.target.value)}
                  required
                  className="w-full px-2 py-1 font-mono bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Top Spending Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Food, Books"
                  value={formTopSector}
                  onChange={(e) => setFormTopSector(e.target.value)}
                  className="w-full px-2 py-1 bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded"
                />
              </div>
            </div>
            <div className="flex justify-end gap-1.5 pt-1">
              <button type="submit" className="px-3 py-1 bg-[#808000] text-white rounded font-medium">Save Record</button>
              <button type="button" onClick={() => setIsAddingRecord(false)} className="px-3 py-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#25271f] rounded">Cancel</button>
            </div>
          </form>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs mb-3 text-stone-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#808000]/30 border border-[#808000]" />
            <span>Planned Allowance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#808000]" />
            <span>Actual Spend</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-[11px] text-stone-400">
            <span>Tap any bar to inspect details</span>
          </div>
        </div>

        {/* SVG Interactive Graph */}
        <div className="w-full overflow-x-auto pb-2">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full max-w-full h-auto select-none"
            style={{ minWidth: '460px' }}
          >
            {/* Horizontal guide lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - paddingY - ratio * (chartHeight - paddingY * 2);
              const val = Math.round(ratio * maxVal);
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={chartWidth - paddingX}
                    y2={y}
                    stroke="currentColor"
                    className="text-[#ebebe3] dark:text-[#262820]"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 6}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    className="fill-stone-400 font-mono"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* Bars for each month */}
            {history.map((record, idx) => {
              const xCenter = paddingX + idx * stepX;
              const barWidth = 14;
              const barGap = 4;

              const allowanceHeight = (record.allowance / maxVal) * (chartHeight - paddingY * 2);
              const spentHeight = (record.totalSpent / maxVal) * (chartHeight - paddingY * 2);

              const yAllowance = chartHeight - paddingY - allowanceHeight;
              const ySpent = chartHeight - paddingY - spentHeight;

              const isSelected = record.id === selectedMonthId;

              return (
                <g
                  key={record.id}
                  className="cursor-pointer group"
                  onClick={() => setSelectedMonthId(record.id)}
                >
                  {/* Highlight pill behind column */}
                  {isSelected && (
                    <rect
                      x={xCenter - barWidth - barGap - 4}
                      y={paddingY - 8}
                      width={(barWidth + barGap) * 2 + 8}
                      height={chartHeight - paddingY}
                      rx="6"
                      className="fill-[#808000]/10 dark:fill-[#808000]/20"
                    />
                  )}

                  {/* Planned Allowance Bar */}
                  <rect
                    x={xCenter - barWidth - barGap / 2}
                    y={yAllowance}
                    width={barWidth}
                    height={allowanceHeight}
                    rx="3"
                    className="fill-[#808000]/30 transition-all group-hover:fill-[#808000]/50"
                  />

                  {/* Actual Spent Bar */}
                  <rect
                    x={xCenter + barGap / 2}
                    y={ySpent}
                    width={barWidth}
                    height={spentHeight}
                    rx="3"
                    className={`transition-all ${
                      record.totalSpent > record.allowance
                        ? 'fill-rose-600'
                        : 'fill-[#808000] group-hover:fill-[#6e6e00]'
                    }`}
                  />

                  {/* Month Label */}
                  <text
                    x={xCenter}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    fontSize="10"
                    className={`font-mono transition-colors ${
                      isSelected
                        ? 'fill-[#808000] dark:fill-[#c4c43b] font-bold'
                        : 'fill-stone-500'
                    }`}
                  >
                    {record.label.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Month Detail Callout */}
        {activeRecord && (
          <div className="mt-3 p-3.5 rounded-lg bg-[#fbfbf9] dark:bg-[#141511] border border-[#ebebe3] dark:border-[#272920] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] flex items-center justify-center font-bold text-xs font-mono">
                {activeRecord.label.split(' ')[0]}
              </div>
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                  {activeRecord.label} Details
                </span>
                <span className="text-[11px] text-stone-400 block">
                  Allowance: {formatMoney(activeRecord.allowance, currency)} · Spent: {formatMoney(activeRecord.totalSpent, currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Net Outcome</span>
                <span className={`font-mono font-bold text-sm ${
                  activeRecord.remaining >= 0 ? 'text-[#808000] dark:text-[#c4c43b]' : 'text-rose-600'
                }`}>
                  {activeRecord.remaining >= 0 ? `+${formatMoney(activeRecord.remaining, currency)} Saved` : `-${formatMoney(Math.abs(activeRecord.remaining), currency)} Over`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteRecord(activeRecord.id)}
                className="p-1.5 text-stone-400 hover:text-rose-600 rounded transition-colors"
                title="Delete this historical record"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Historical Breakdown Table */}
      <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
          Archived Monthly Records
        </h3>

        <div className="divide-y divide-[#ecece4] dark:divide-[#262820]">
          {history.map((record) => {
            const isSurplus = record.remaining >= 0;
            const savingsRate = record.allowance > 0 ? (record.remaining / record.allowance) * 100 : 0;

            return (
              <div
                key={record.id}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-[#fbfbf9] dark:hover:bg-[#1e2019] px-2 rounded-md transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-stone-900 dark:text-stone-100 font-mono w-20">
                    {record.label}
                  </span>
                  <span className="text-stone-400 text-[11px] hidden sm:inline">
                    Allowance: {formatMoney(record.allowance, currency)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono text-stone-700 dark:text-stone-300 block">
                      {formatMoney(record.totalSpent, currency)} spent
                    </span>
                    <span className="text-[10px] text-stone-400 block">
                      Top: {record.topSector}
                    </span>
                  </div>

                  <span
                    className={`font-mono text-xs font-semibold px-2 py-0.5 rounded w-24 text-right ${
                      isSurplus
                        ? 'bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b]'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                    }`}
                  >
                    {isSurplus ? `+${savingsRate.toFixed(0)}%` : `${savingsRate.toFixed(0)}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
