import React, { useState, useMemo } from 'react';
import { CurrencyConfig, Expense, SectorItem } from '../types';
import { AMUSING_VIBES, getRandomExcuse, getQuickAmusingPresets, getWittyExpenseReaction } from '../utils/amusements';
import { cleanCurrencySymbol, formatMoney } from '../utils/formatCurrency';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  SlidersHorizontal,
  Sparkles,
  Dices,
  ChevronDown,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface ExpenseTrackerProps {
  expenses: Expense[];
  currency: CurrencyConfig;
  sectors: SectorItem[];
  selectedCategory: string | null;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onSelectCategory: (cat: string | null) => void;
  onOpenSettings: () => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  currency,
  sectors,
  selectedCategory,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onSelectCategory,
  onOpenSettings,
}) => {
  const sym = cleanCurrencySymbol(currency);

  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(() => sectors[0]?.name || 'Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedVibe, setSelectedVibe] = useState<string>('🤤 Craving');
  const [excuse, setExcuse] = useState<string>('');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  // Amusing Reaction Toast State
  const [reactionToast, setReactionToast] = useState<{
    title: string;
    quote: string;
    emoji: string;
  } | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<string>('');
  const [editDate, setEditDate] = useState('');
  const [editVibe, setEditVibe] = useState('');
  const [editExcuse, setEditExcuse] = useState('');

  // Search & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Keep category valid if sectors change
  React.useEffect(() => {
    if (!sectors.some((s) => s.name === category) && sectors.length > 0) {
      setCategory(sectors[0].name);
    }
  }, [sectors, category]);

  const getSectorColor = (catName: string): string => {
    const found = sectors.find((s) => s.name.toLowerCase() === catName.toLowerCase());
    return found ? found.color : '#808000';
  };

  const handleRollExcuse = () => {
    setExcuse(getRandomExcuse());
  };

  const handleApplyPreset = (preset: {
    name: string;
    amount: number;
    category: string;
    vibe: string;
  }) => {
    setName(preset.name);
    setAmount(preset.amount.toString());
    const matched = sectors.find((s) => s.name.toLowerCase() === preset.category.toLowerCase());
    if (matched) {
      setCategory(matched.name);
    }
    setSelectedVibe(preset.vibe);
    setExcuse(getRandomExcuse());
    setIsFormVisible(true);
    setShowPresets(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    const chosenCat = category || sectors[0]?.name || 'Other';

    onAddExpense({
      name: name.trim(),
      amount: parsedAmount,
      category: chosenCat,
      date: date || new Date().toISOString().split('T')[0],
      vibe: selectedVibe,
      excuse: excuse.trim() || undefined,
    });

    // Trigger witty reaction toast
    const reaction = getWittyExpenseReaction(chosenCat, name.trim(), parsedAmount, sym);
    setReactionToast(reaction);
    setTimeout(() => {
      setReactionToast((curr) => (curr === reaction ? null : curr));
    }, 5500);

    // Reset form
    setName('');
    setAmount('');
    setExcuse('');
    setIsFormVisible(false);
  };

  const handleStartEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setEditName(exp.name);
    setEditAmount(exp.amount.toString());
    setEditCategory(exp.category);
    setEditDate(exp.date);
    setEditVibe(exp.vibe || '');
    setEditExcuse(exp.excuse || '');
  };

  const handleSaveEdit = (id: string) => {
    const parsedAmount = parseFloat(editAmount);
    if (!editName.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onEditExpense({
      id,
      name: editName.trim(),
      amount: parsedAmount,
      category: editCategory,
      date: editDate,
      vibe: editVibe,
      excuse: editExcuse.trim() || undefined,
      createdAt: Date.now(),
    });

    setEditingId(null);
  };

  const quickPresets = useMemo(() => getQuickAmusingPresets(currency.code), [currency.code]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        const matchesCat = selectedCategory ? exp.category === selectedCategory : true;
        const matchesSearch = searchQuery.trim()
          ? exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exp.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (exp.excuse && exp.excuse.toLowerCase().includes(searchQuery.toLowerCase()))
          : true;
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date) || a.createdAt - b.createdAt;
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, selectedCategory, searchQuery, sortBy]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  return (
    <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl shadow-xs transition-colors overflow-hidden">
      {/* 1. TOP HEADER & SUMMARY STRIP */}
      <div className="p-4 sm:p-5 pb-3 border-b border-[#ecece4] dark:border-[#262820]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                Expenses
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#f4f4ee] dark:bg-[#23251e] text-stone-600 dark:text-stone-400">
                {filteredExpenses.length} {filteredExpenses.length === 1 ? 'item' : 'items'}
              </span>
              {filteredExpenses.length > 0 && (
                <span className="text-xs font-mono font-medium text-stone-500">
                  · {formatMoney(totalFilteredAmount, currency)}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">
              Track and categorize your daily spending
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
                showPresets
                  ? 'bg-[#808000]/10 border-[#808000]/30 text-[#808000] dark:text-[#c4c43b]'
                  : 'bg-stone-50 hover:bg-stone-100 dark:bg-[#20221a] dark:hover:bg-[#262820] border-[#deded4] dark:border-[#323528] text-stone-700 dark:text-stone-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#808000] dark:text-[#c4c43b]" />
              <span className="hidden sm:inline">Presets</span>
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="px-2.5 py-1.5 text-xs font-medium bg-stone-50 hover:bg-stone-100 dark:bg-[#20221a] dark:hover:bg-[#262820] border border-[#deded4] dark:border-[#323528] text-stone-700 dark:text-stone-300 rounded-lg transition-colors flex items-center gap-1.5"
              title="Manage Sectors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Sectors</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFormVisible(!isFormVisible)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shadow-2xs ${
                isFormVisible
                  ? 'bg-stone-200 dark:bg-[#2e3025] text-stone-800 dark:text-stone-200'
                  : 'bg-[#808000] hover:bg-[#6e6e00] text-white'
              }`}
            >
              <Plus className={`w-3.5 h-3.5 transition-transform ${isFormVisible ? 'rotate-45' : ''}`} />
              <span>{isFormVisible ? 'Close' : 'Add Expense'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Drawer (Clean & Minimal) */}
        {showPresets && (
          <div className="mt-3 pt-3 border-t border-[#f0f0e8] dark:border-[#282a20] animate-in fade-in duration-150">
            <span className="text-[11px] font-medium text-stone-400 block mb-2">
              One-tap amusing presets:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {quickPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 text-xs bg-[#fbfbf9] hover:bg-[#808000]/10 dark:bg-[#20221a] dark:hover:bg-[#292c21] border border-[#deded4] dark:border-[#323528] rounded-md transition-colors flex items-center gap-1.5 text-stone-700 dark:text-stone-300"
                >
                  <span>{preset.emoji}</span>
                  <span>{preset.name}</span>
                  <span className="font-mono font-semibold text-[#808000] dark:text-[#c4c43b]">
                    {formatMoney(preset.amount, currency)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Witty Micro-reaction Toast */}
        {reactionToast && (
          <div className="mt-3 p-3 rounded-lg bg-[#808000]/10 border border-[#808000]/20 flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-1 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base flex-shrink-0">{reactionToast.emoji}</span>
              <p className="text-stone-800 dark:text-stone-200 truncate">
                <strong className="text-[#808000] dark:text-[#c4c43b] mr-1.5">
                  {reactionToast.title}
                </strong>
                <span className="italic font-normal">"{reactionToast.quote}"</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReactionToast(null)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 2. ADD EXPENSE FORM (CLEAN, COMPACT & UNCLUTTERED) */}
      {isFormVisible && (
        <form
          onSubmit={handleCreateSubmit}
          className="p-4 sm:p-5 bg-[#fbfbf9] dark:bg-[#141511] border-b border-[#ecece4] dark:border-[#262820] space-y-3 animate-in fade-in duration-200"
        >
          {/* Row 1: Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch with team, Bus card"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1c1e17] border border-[#dcdcd1] dark:border-[#323528] rounded-md text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#808000] transition-colors"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Amount ({sym})
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs font-mono bg-white dark:bg-[#1c1e17] border border-[#dcdcd1] dark:border-[#323528] rounded-md text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#808000] transition-colors"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Sector
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-[#1c1e17] border border-[#dcdcd1] dark:border-[#323528] rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#808000] transition-colors"
              >
                {sectors.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-stone-500 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-[#1c1e17] border border-[#dcdcd1] dark:border-[#323528] rounded-md text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#808000] transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Vibe & Excuse Bar */}
          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
            {/* Vibe Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] text-stone-400 mr-1 flex-shrink-0">Vibe:</span>
              {AMUSING_VIBES.map((v) => {
                const isSelected = selectedVibe.includes(v.label);
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVibe(`${v.emoji} ${v.label}`)}
                    className={`px-2 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#808000] text-white font-medium shadow-2xs'
                        : 'bg-white dark:bg-[#1c1e17] border border-[#dcdcd1] dark:border-[#323528] text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                    }`}
                  >
                    <span>{v.emoji}</span>
                    <span>{v.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Excuse generator input & submit button */}
            <div className="flex items-center gap-2 flex-1 sm:max-w-md">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={excuse}
                  onChange={(e) => setExcuse(e.target.value)}
                  placeholder="Optional excuse / justification..."
                  className="w-full pl-2.5 pr-14 py-1 text-xs bg-white dark:bg-[#1c1e17] border border-[#dcdcd1] dark:border-[#323528] rounded-md text-stone-900 dark:text-stone-100 placeholder:text-stone-400 italic focus:outline-none focus:border-[#808000]"
                />
                <button
                  type="button"
                  onClick={handleRollExcuse}
                  className="absolute right-1 top-1 bottom-1 px-1.5 text-[10px] font-medium text-[#808000] dark:text-[#c4c43b] hover:bg-[#808000]/10 rounded flex items-center gap-0.5"
                  title="Roll an amusing excuse"
                >
                  <Dices className="w-3 h-3" />
                  <span>Roll</span>
                </button>
              </div>

              <button
                type="submit"
                className="px-3.5 py-1 text-xs font-semibold text-white bg-[#808000] hover:bg-[#6e6e00] rounded-md transition-colors shadow-2xs flex-shrink-0"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 3. CLEAN SEARCH & FILTER BAR */}
      <div className="p-3 sm:px-5 bg-[#fafaf7] dark:bg-[#171813] border-b border-[#ecece4] dark:border-[#262820] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search description, sector, or excuse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#2e3126] rounded-md text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[#808000] transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sector filter */}
          <select
            value={selectedCategory || 'ALL'}
            onChange={(e) =>
              onSelectCategory(e.target.value === 'ALL' ? null : e.target.value)
            }
            className="px-2.5 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#2e3126] rounded-md text-stone-700 dark:text-stone-300 focus:outline-none"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#2e3126] rounded-md text-stone-700 dark:text-stone-300 focus:outline-none"
          >
            <option value="date-desc">Newest Date</option>
            <option value="date-asc">Oldest Date</option>
            <option value="amount-desc">Highest Cost</option>
            <option value="amount-asc">Lowest Cost</option>
          </select>
        </div>
      </div>

      {/* 4. EXPENSE LIST ITEMS */}
      <div className="divide-y divide-[#f0f0e8] dark:divide-[#24261f]">
        {filteredExpenses.length === 0 ? (
          <div className="py-10 text-center text-xs text-stone-400 space-y-1.5">
            <p className="font-medium text-stone-600 dark:text-stone-300">
              {expenses.length === 0 ? 'No expenses recorded yet.' : 'No matching expenses found.'}
            </p>
            <p className="text-[11px] text-stone-400">
              {expenses.length === 0
                ? 'Tap "+ Add Expense" above or pick a quick preset to log your first transaction.'
                : 'Try clearing your search query or switching sector filters.'}
            </p>
          </div>
        ) : (
          filteredExpenses.map((exp) => {
            const isEditing = editingId === exp.id;
            const sectorColor = getSectorColor(exp.category);

            if (isEditing) {
              return (
                <div
                  key={exp.id}
                  className="p-3 bg-[#f8f8f4] dark:bg-[#151611] space-y-2.5 animate-in fade-in text-xs"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Description"
                      className="px-2.5 py-1 bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                    />
                    <input
                      type="number"
                      step="any"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      placeholder="Amount"
                      className="px-2.5 py-1 font-mono bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                    >
                      {sectors.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Vibe tag"
                      value={editVibe}
                      onChange={(e) => setEditVibe(e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                    />
                    <input
                      type="text"
                      placeholder="Excuse / Note"
                      value={editExcuse}
                      onChange={(e) => setEditExcuse(e.target.value)}
                      className="px-2.5 py-1 bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100 italic"
                    />
                  </div>

                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(exp.id)}
                      className="px-3 py-1 bg-[#808000] text-white rounded font-medium hover:bg-[#6e6e00] flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-stone-500 hover:bg-stone-200 dark:hover:bg-[#25271f] rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={exp.id}
                className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 group hover:bg-[#fcfcfb] dark:hover:bg-[#1e2019] transition-colors"
              >
                {/* Left side: Sector dot, Name, Vibe & Excuse */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: sectorColor }}
                    title={exp.category}
                  />

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-stone-900 dark:text-stone-100 truncate">
                        {exp.name}
                      </span>

                      {exp.vibe && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#f4f4ee] dark:bg-[#24261e] text-stone-600 dark:text-stone-300 font-medium">
                          {exp.vibe}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-stone-400">
                      <span>{exp.category}</span>
                      <span>·</span>
                      <span>{exp.date}</span>
                      {exp.excuse && (
                        <>
                          <span>·</span>
                          <span className="text-stone-500 dark:text-stone-400 italic truncate max-w-[220px] sm:max-w-xs">
                            "{exp.excuse}"
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount + Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-mono font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                    {formatMoney(exp.amount, currency)}
                  </span>

                  <div className="flex items-center gap-1 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(exp)}
                      className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
