import React, { useState } from 'react';
import { CurrencyConfig, Expense, SectorItem } from '../types';
import { CURRENCIES, DEFAULT_SECTORS, SECTOR_COLOR_PALETTE } from '../constants';
import { cleanCurrencySymbol, formatMoney } from '../utils/formatCurrency';
import { X, Plus, Edit2, Trash2, Check, SlidersHorizontal, DollarSign, Layers, RotateCcw } from 'lucide-react';

interface SectorsCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectors: SectorItem[];
  currency: CurrencyConfig;
  expenses: Expense[];
  onUpdateSectors: (sectors: SectorItem[]) => void;
  onUpdateCurrency: (currency: CurrencyConfig) => void;
  onRenameCategoryInExpenses: (oldName: string, newName: string) => void;
}

export const SectorsCurrencyModal: React.FC<SectorsCurrencyModalProps> = ({
  isOpen,
  onClose,
  sectors,
  currency,
  expenses,
  onUpdateSectors,
  onUpdateCurrency,
  onRenameCategoryInExpenses,
}) => {
  const [activeTab, setActiveTab] = useState<'sectors' | 'currency'>('sectors');

  // Sector Editing State
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editNote, setEditNote] = useState('');

  // New Sector State
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(SECTOR_COLOR_PALETTE[0]);
  const [newNote, setNewNote] = useState('');
  const [sectorError, setSectorError] = useState('');

  // Custom Currency State
  const [isCustomCurrency, setIsCustomCurrency] = useState(false);
  const [customCode, setCustomCode] = useState(currency.code);
  const [customSymbol, setCustomSymbol] = useState(currency.symbol);
  const [customName, setCustomName] = useState(currency.name);

  if (!isOpen) return null;

  // --- Sector Actions ---
  const handleStartEditSector = (sector: SectorItem) => {
    setEditingSectorId(sector.id);
    setEditName(sector.name);
    setEditColor(sector.color);
    setEditNote(sector.budgetRecommendation || '');
    setSectorError('');
  };

  const handleSaveEditSector = (sectorId: SectorItem['id']) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      setSectorError('Sector name cannot be blank.');
      return;
    }

    const currentSector = sectors.find((s) => s.id === sectorId);
    if (currentSector && currentSector.name !== trimmed) {
      // Check duplicate
      if (sectors.some((s) => s.id !== sectorId && s.name.toLowerCase() === trimmed.toLowerCase())) {
        setSectorError('A sector with this name already exists.');
        return;
      }
      // Rename in expenses
      onRenameCategoryInExpenses(currentSector.name, trimmed);
    }

    const updated = sectors.map((s) =>
      s.id === sectorId
        ? {
            ...s,
            name: trimmed,
            color: editColor,
            budgetRecommendation: editNote.trim() || undefined,
          }
        : s
    );

    onUpdateSectors(updated);
    setEditingSectorId(null);
    setSectorError('');
  };

  const handleCreateSector = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setSectorError('Please provide a sector name.');
      return;
    }

    if (sectors.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSectorError('A sector with this name already exists.');
      return;
    }

    const newSector: SectorItem = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: trimmed,
      color: newColor,
      budgetRecommendation: newNote.trim() || undefined,
    };

    onUpdateSectors([...sectors, newSector]);
    setNewName('');
    setNewNote('');
    setIsAddingSector(false);
    setSectorError('');
  };

  const handleDeleteSector = (sector: SectorItem) => {
    if (sectors.length <= 1) {
      alert('You must have at least one spending sector.');
      return;
    }

    const count = expenses.filter((e) => e.category === sector.name).length;
    if (count > 0) {
      const confirmDelete = window.confirm(
        `Sector "${sector.name}" is used by ${count} expense(s). Deleting it will reassign those expenses to "Other". Proceed?`
      );
      if (!confirmDelete) return;

      // Reassign expenses to "Other" or first available sector
      const targetSector = sectors.find((s) => s.name === 'Other' && s.id !== sector.id) || sectors.find((s) => s.id !== sector.id);
      if (targetSector) {
        onRenameCategoryInExpenses(sector.name, targetSector.name);
      }
    }

    const updated = sectors.filter((s) => s.id !== sector.id);
    onUpdateSectors(updated);
  };

  const handleResetDefaultSectors = () => {
    if (window.confirm('Reset sectors to default categories (Food, Transport, Games, Study, Savings, Other)?')) {
      onUpdateSectors(DEFAULT_SECTORS);
    }
  };

  // --- Currency Actions ---
  const handleSelectPresetCurrency = (c: CurrencyConfig) => {
    onUpdateCurrency(c);
    setCustomCode(c.code);
    setCustomSymbol(c.symbol);
    setCustomName(c.name);
    setIsCustomCurrency(false);
  };

  const handleSaveCustomCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCode.trim() || !customSymbol.trim()) return;

    const newCurr: CurrencyConfig = {
      code: customCode.trim().toUpperCase(),
      symbol: customSymbol.trim(),
      name: customName.trim() || `${customCode.trim().toUpperCase()} (${customSymbol.trim()})`,
      isCustom: true,
    };

    onUpdateCurrency(newCurr);
    setIsCustomCurrency(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#ecece4] dark:border-[#272920] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] flex items-center justify-center">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                Sectors & Currency Settings
              </h3>
              <p className="text-[11px] text-stone-400">
                Customize spending categories and currency to your preference
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[#ecece4] dark:border-[#272920] px-5 pt-2 flex-shrink-0 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('sectors')}
            className={`pb-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'sectors'
                ? 'border-[#808000] text-[#808000] dark:text-[#c4c43b]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Expense Sectors ({sectors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('currency')}
            className={`pb-2 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'currency'
                ? 'border-[#808000] text-[#808000] dark:text-[#c4c43b]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Currency ({currency.code})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {sectorError && (
            <div className="mb-3 p-2 rounded bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
              {sectorError}
            </div>
          )}

          {activeTab === 'sectors' ? (
            <div className="space-y-4">
              {/* Header inside Tab */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                  Configured Sectors
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultSectors}
                    className="text-[11px] text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1"
                    title="Reset to defaults"
                  >
                    <RotateCcw className="w-3 h-3" /> Defaults
                  </button>

                  {!isAddingSector && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingSector(true);
                        setSectorError('');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-[#808000] hover:bg-[#6e6e00] rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Add Sector
                    </button>
                  )}
                </div>
              </div>

              {/* Add New Sector Form */}
              {isAddingSector && (
                <form
                  onSubmit={handleCreateSector}
                  className="p-3 bg-[#f8f8f4] dark:bg-[#151612] border border-[#e2e2d8] dark:border-[#2f3127] rounded-lg space-y-2.5 animate-in fade-in"
                >
                  <div className="font-semibold text-stone-800 dark:text-stone-200">
                    Create New Spending Sector
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-stone-500 uppercase tracking-wider mb-1">
                        Sector Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Healthcare, Gym, Rent"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                        className="w-full px-2.5 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#808000]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-500 uppercase tracking-wider mb-1">
                        Recommendation / Budget Note (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Needs (15%) or Fixed bill"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#808000]"
                      />
                    </div>
                  </div>

                  {/* Color Swatch Picker */}
                  <div>
                    <label className="block text-[10px] text-stone-500 uppercase tracking-wider mb-1">
                      Sector Color
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {SECTOR_COLOR_PALETTE.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-6 h-6 rounded-full transition-transform flex items-center justify-center ${
                            newColor === c ? 'ring-2 ring-offset-2 ring-stone-700 dark:ring-white scale-110' : 'opacity-80 hover:opacity-100'
                          }`}
                        >
                          {newColor === c && <Check className="w-3.5 h-3.5 text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#808000] text-white rounded font-medium hover:bg-[#6e6e00]"
                    >
                      Save Sector
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSector(false)}
                      className="px-3 py-1 text-stone-500 hover:bg-stone-200 dark:hover:bg-[#25271f] rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* List of Sectors */}
              <div className="divide-y divide-[#ecece4] dark:divide-[#262820] border border-[#ecece4] dark:border-[#262820] rounded-lg overflow-hidden">
                {sectors.map((sector) => {
                  const isEditing = editingSectorId === sector.id;
                  const expenseCount = expenses.filter((e) => e.category === sector.name).length;
                  const totalSpent = expenses
                    .filter((e) => e.category === sector.name)
                    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

                  if (isEditing) {
                    return (
                      <div
                        key={sector.id}
                        className="p-3 bg-[#f8f8f4] dark:bg-[#151612] space-y-2"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Sector Name"
                            className="px-2 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded"
                          />
                          <input
                            type="text"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            placeholder="Target / Note"
                            className="px-2 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded"
                          />
                        </div>

                        {/* Color Selector */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {SECTOR_COLOR_PALETTE.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setEditColor(c)}
                              style={{ backgroundColor: c }}
                              className={`w-5 h-5 rounded-full ${
                                editColor === c ? 'ring-2 ring-stone-700 dark:ring-white scale-110' : 'opacity-80'
                              }`}
                            />
                          ))}
                        </div>

                        <div className="flex justify-end gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEditSector(sector.id)}
                            className="px-2.5 py-0.5 bg-[#808000] text-white rounded font-medium hover:bg-[#6e6e00]"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSectorId(null)}
                            className="px-2 py-0.5 text-stone-500 hover:bg-stone-200 dark:hover:bg-[#25271f] rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={sector.id}
                      className="p-2.5 flex items-center justify-between gap-3 hover:bg-[#fbfbf9] dark:hover:bg-[#1e2019] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sector.color }}
                        />
                        <div className="min-w-0">
                          <span className="font-medium text-stone-900 dark:text-stone-100">
                            {sector.name}
                          </span>
                          {sector.budgetRecommendation && (
                            <span className="text-[11px] text-stone-400 ml-2">
                              ({sector.budgetRecommendation})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-stone-400 font-mono">
                          {expenseCount} entries · {formatMoney(totalSpent, currency)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEditSector(sector)}
                            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded"
                            title="Edit sector"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSector(sector)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded"
                            title="Delete sector"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Currency Tab */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
                    Active Currency
                  </span>
                  <span className="text-sm font-bold font-mono text-[#808000] dark:text-[#c4c43b] mt-0.5 block">
                    {currency.name} · Code: {currency.code} ({currency.symbol})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomCurrency(!isCustomCurrency)}
                  className="px-2.5 py-1 text-xs text-[#808000] dark:text-[#c4c43b] hover:underline"
                >
                  {isCustomCurrency ? 'Pick Preset' : '+ Custom Currency'}
                </button>
              </div>

              {/* Custom Currency Form */}
              {isCustomCurrency && (
                <form
                  onSubmit={handleSaveCustomCurrency}
                  className="p-3 bg-[#f8f8f4] dark:bg-[#151612] border border-[#e2e2d8] dark:border-[#2f3127] rounded-lg space-y-2.5"
                >
                  <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                    Define Custom Currency
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-stone-500 uppercase tracking-wider mb-1">
                        Code
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. NPR, USD, EUR"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        required
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded text-stone-900 dark:text-stone-100 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-500 uppercase tracking-wider mb-1">
                        Symbol
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₨, $, €, ₹"
                        value={customSymbol}
                        onChange={(e) => setCustomSymbol(e.target.value)}
                        required
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded text-stone-900 dark:text-stone-100"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-stone-500 uppercase tracking-wider mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Nepalese Rupee"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#333629] rounded text-stone-900 dark:text-stone-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#808000] text-white rounded font-medium hover:bg-[#6e6e00]"
                    >
                      Apply Currency
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of Standard Worldwide Currencies */}
              <div>
                <span className="text-[11px] text-stone-400 block mb-2">
                  Select from popular currencies:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CURRENCIES.map((c) => {
                    const isSelected = currency.code === c.code && currency.symbol === c.symbol;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => handleSelectPresetCurrency(c)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-[#808000] bg-[#808000]/10 text-stone-900 dark:text-stone-100 font-semibold'
                            : 'border-[#ebebe3] dark:border-[#272920] hover:bg-stone-50 dark:hover:bg-[#1e2019] text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-xs block">{c.code}</span>
                          <span className="text-[10px] text-stone-400 block truncate max-w-[100px]">
                            {c.name.split('(')[0]}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-[#808000] dark:text-[#c4c43b]">
                          {c.symbol}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#ecece4] dark:border-[#272920] flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#808000] hover:bg-[#6e6e00] rounded-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
