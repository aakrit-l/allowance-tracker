/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CurrencyConfig, Expense, MonthlyRecord, SectorItem, UserProfile } from './types';
import { calculateBudgetSummary } from './utils/budgetCalculations';
import {
  loadSavedAllowance,
  loadSavedCurrency,
  loadSavedExpenses,
  loadSavedHistory,
  loadSavedProfile,
  loadSavedSectors,
  loadSavedTheme,
  saveAllowance,
  saveCurrency,
  saveExpenses,
  saveHistory,
  saveProfile,
  saveSectors,
  saveTheme,
  clearAllPlannerData,
} from './utils/storage';
import { getSampleExpenses } from './utils/sampleData';
import { Header } from './components/Header';
import { AllowanceCard } from './components/AllowanceCard';
import { LiveSummaryCard } from './components/LiveSummaryCard';
import { SpendingChart } from './components/SpendingChart';
import { BudgetAllocationCard } from './components/BudgetAllocationCard';
import { ExpenseTracker } from './components/ExpenseTracker';
import { AiAssistant } from './components/AiAssistant';
import { SectorsCurrencyModal } from './components/SectorsCurrencyModal';
import { PastResultsSection } from './components/PastResultsSection';
import { UserProfileSection } from './components/UserProfileSection';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => loadSavedTheme());
  const [activeSection, setActiveSection] = useState<'planner' | 'history' | 'profile'>('planner');

  // Core Data
  const [allowance, setAllowance] = useState<number>(() => loadSavedAllowance());
  const [currency, setCurrency] = useState<CurrencyConfig>(() => loadSavedCurrency());
  const [sectors, setSectors] = useState<SectorItem[]>(() => loadSavedSectors());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadSavedExpenses());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Profile & Past Results
  const [profile, setProfile] = useState<UserProfile>(() => loadSavedProfile());
  const [history, setHistory] = useState<MonthlyRecord[]>(() => loadSavedHistory());

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const handleUpdateAllowance = (newAllowance: number) => {
    setAllowance(newAllowance);
    saveAllowance(newAllowance);
  };

  const handleUpdateCurrency = (newCurrency: CurrencyConfig) => {
    setCurrency(newCurrency);
    saveCurrency(newCurrency);
  };

  const handleUpdateSectors = (newSectors: SectorItem[]) => {
    setSectors(newSectors);
    saveSectors(newSectors);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleUpdateHistory = (newHistory: MonthlyRecord[]) => {
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const handleRenameCategoryInExpenses = (oldName: string, newName: string) => {
    const updated = expenses.map((e) =>
      e.category === oldName ? { ...e, category: newName } : e
    );
    setExpenses(updated);
    saveExpenses(updated);

    if (selectedCategory === oldName) {
      setSelectedCategory(newName);
    }
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleEditExpense = (updatedExpense: Expense) => {
    const updated = expenses.map((e) => (e.id === updatedExpense.id ? updatedExpense : e));
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleReset = () => {
    if (window.confirm('Reset all allowance and expense records?')) {
      clearAllPlannerData();
      setAllowance(0);
      setExpenses([]);
      setSelectedCategory(null);
    }
  };

  const handleLoadSample = () => {
    const sample = getSampleExpenses();
    setAllowance(15000);
    saveAllowance(15000);
    setExpenses(sample);
    saveExpenses(sample);
    setSelectedCategory(null);
  };

  // Derive live summary with user sectors
  const budgetSummary = useMemo(() => {
    return calculateBudgetSummary(allowance, expenses, sectors);
  }, [allowance, expenses, sectors]);

  // Archive current month into history
  const handleArchiveCurrentMonth = () => {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const label = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const newRecord: MonthlyRecord = {
      id: `hist-${Date.now()}`,
      monthKey,
      label,
      allowance,
      totalSpent: budgetSummary.totalSpent,
      remaining: budgetSummary.remaining,
      topSector: budgetSummary.topCategory?.category || 'General',
      sectorBreakdown: budgetSummary.categoryTotals,
    };

    const updated = [...history.filter((m) => m.monthKey !== monthKey), newRecord].sort((a, b) =>
      a.monthKey.localeCompare(b.monthKey)
    );
    setHistory(updated);
    saveHistory(updated);
    alert(`Archived ${label} outcome into Past Results!`);
  };

  // Import full JSON backup
  const handleImportFullData = (data: any) => {
    if (data.profile) {
      setProfile(data.profile);
      saveProfile(data.profile);
    }
    if (typeof data.allowance === 'number') {
      setAllowance(data.allowance);
      saveAllowance(data.allowance);
    }
    if (data.currency) {
      setCurrency(data.currency);
      saveCurrency(data.currency);
    }
    if (Array.isArray(data.sectors)) {
      setSectors(data.sectors);
      saveSectors(data.sectors);
    }
    if (Array.isArray(data.expenses)) {
      setExpenses(data.expenses);
      saveExpenses(data.expenses);
    }
    if (Array.isArray(data.history)) {
      setHistory(data.history);
      saveHistory(data.history);
    }
    alert('Data backup successfully restored!');
  };

  return (
    <div className="min-h-screen bg-[#f8f8f5] dark:bg-[#12130f] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors selection:bg-[#808000] selection:text-white">
      {/* Top Header with Section Navigation */}
      <Header
        isDark={isDark}
        currency={currency}
        profile={profile}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        toggleTheme={toggleTheme}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* SECTION 1: PLANNER (Active Dashboard) */}
        {activeSection === 'planner' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Allowance Input + Live Summary */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-5">
                <AllowanceCard
                  allowance={allowance}
                  currency={currency}
                  onUpdateAllowance={handleUpdateAllowance}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                />
              </div>
              <div className="lg:col-span-7">
                <LiveSummaryCard
                  summary={budgetSummary}
                  currency={currency}
                />
              </div>
            </section>

            {/* Category Chart + 50/30/20 Budget Health Split */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              <SpendingChart
                summary={budgetSummary}
                currency={currency}
                sectors={sectors}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              <BudgetAllocationCard
                summary={budgetSummary}
                currency={currency}
                sectors={sectors}
                allowance={allowance}
              />
            </section>

            {/* Expenses List */}
            <section>
              <ExpenseTracker
                expenses={expenses}
                currency={currency}
                sectors={sectors}
                selectedCategory={selectedCategory}
                onAddExpense={handleAddExpense}
                onEditExpense={handleEditExpense}
                onDeleteExpense={handleDeleteExpense}
                onSelectCategory={setSelectedCategory}
                onOpenSettings={() => setIsSettingsOpen(true)}
              />
            </section>
          </div>
        )}

        {/* SECTION 2: PAST RESULTS (Historical Performance Graph & Records) */}
        {activeSection === 'history' && (
          <PastResultsSection
            history={history}
            currency={currency}
            onUpdateHistory={handleUpdateHistory}
            onArchiveCurrentMonth={handleArchiveCurrentMonth}
          />
        )}

        {/* SECTION 3: USER PROFILE (Profile, Goals, Portability) */}
        {activeSection === 'profile' && (
          <UserProfileSection
            profile={profile}
            currency={currency}
            allowance={allowance}
            expenses={expenses}
            sectors={sectors}
            history={history}
            onUpdateProfile={handleUpdateProfile}
            onImportFullData={handleImportFullData}
          />
        )}
      </main>

      {/* Floating Bottom-Left AI Financial Assistant Widget */}
      <AiAssistant
        allowance={allowance}
        currency={currency}
        summary={budgetSummary}
        expenses={expenses}
      />

      {/* Sectors and Currency Settings Modal */}
      <SectorsCurrencyModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sectors={sectors}
        currency={currency}
        expenses={expenses}
        onUpdateSectors={handleUpdateSectors}
        onUpdateCurrency={handleUpdateCurrency}
        onRenameCategoryInExpenses={handleRenameCategoryInExpenses}
      />

      {/* Footer */}
      <footer className="border-t border-[#e5e5dc] dark:border-[#20221b] py-5 text-center text-xs text-stone-400">
        <p>Allowance Planner · Bottom-Left AI Advisor & Interactive Budget Intelligence</p>
      </footer>
    </div>
  );
}
