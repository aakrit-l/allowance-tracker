import React, { useState } from 'react';
import { CurrencyConfig, Expense, MonthlyRecord, SectorItem, UserProfile } from '../types';
import { cleanCurrencySymbol, formatMoney } from '../utils/formatCurrency';
import {
  User,
  Mail,
  Briefcase,
  Target,
  Download,
  Upload,
  Edit2,
  Check,
  X,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  PiggyBank,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface UserProfileSectionProps {
  profile: UserProfile;
  currency: CurrencyConfig;
  allowance: number;
  expenses: Expense[];
  sectors: SectorItem[];
  history: MonthlyRecord[];
  onUpdateProfile: (profile: UserProfile) => void;
  onImportFullData: (data: any) => void;
}

export const UserProfileSection: React.FC<UserProfileSectionProps> = ({
  profile,
  currency,
  allowance,
  expenses,
  sectors,
  history,
  onUpdateProfile,
  onImportFullData,
}) => {
  const sym = cleanCurrencySymbol(currency);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [occupation, setOccupation] = useState(profile.occupation);
  const [bio, setBio] = useState(profile.bio);

  // Goal & Time Period Edit State
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalName, setGoalName] = useState(profile.targetSavingsGoalName);
  const [goalAmount, setGoalAmount] = useState(profile.targetSavingsGoalAmount.toString());
  const [timeframeMonths, setTimeframeMonths] = useState(profile.targetTimeframeMonths || 6);

  // Custom Deposit State
  const [addSavingsAmt, setAddSavingsAmt] = useState('');
  const [showAddSavings, setShowAddSavings] = useState(false);

  // Core Goal Calculations
  const targetAmount = Math.max(0, profile.targetSavingsGoalAmount);
  const currentSavings = Math.max(0, profile.currentSavingsTotal);
  const remainingToSave = Math.max(0, targetAmount - currentSavings);
  const months = Math.max(1, profile.targetTimeframeMonths || 6);

  // Total money to save in a month to reach goal
  const monthlySavingsNeeded = remainingToSave > 0 ? Math.ceil(remainingToSave / months) : 0;
  const dailySavingsNeeded = monthlySavingsNeeded > 0 ? Math.ceil(monthlySavingsNeeded / 30) : 0;
  const pctOfAllowance = allowance > 0 ? (monthlySavingsNeeded / allowance) * 100 : 0;
  const progressPct = targetAmount > 0 ? Math.min(100, (currentSavings / targetAmount) * 100) : 0;

  // Handlers
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || profile.name,
      email: email.trim() || profile.email,
      occupation: occupation.trim() || profile.occupation,
      bio: bio.trim(),
    });
    setIsEditingProfile(false);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedGoal = parseFloat(goalAmount);
    const parsedMonths = Math.max(1, parseInt(timeframeMonths.toString(), 10) || 6);

    onUpdateProfile({
      ...profile,
      targetSavingsGoalName: goalName.trim() || 'My Savings Goal',
      targetSavingsGoalAmount: isNaN(parsedGoal) || parsedGoal <= 0 ? 50000 : parsedGoal,
      targetTimeframeMonths: parsedMonths,
    });
    setIsEditingGoal(false);
  };

  const handleAddSavings = (amountToAdd: number) => {
    if (isNaN(amountToAdd) || amountToAdd <= 0) return;
    onUpdateProfile({
      ...profile,
      currentSavingsTotal: profile.currentSavingsTotal + amountToAdd,
    });
    setAddSavingsAmt('');
    setShowAddSavings(false);
  };

  // Export JSON backup
  const handleExportData = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      allowance,
      currency,
      sectors,
      expenses,
      history,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `allowance_planner_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          if (window.confirm('Import data from this file? This will restore your settings, expenses, and history.')) {
            onImportFullData(parsed);
          }
        }
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'AP';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. USER PROFILE IDENTITY CARD */}
      <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-[#808000] text-white flex items-center justify-center font-bold text-lg shadow-xs flex-shrink-0 tracking-wider">
              {initials}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {profile.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b]">
                  Planner Member
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-stone-400" />
                  {profile.email}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-stone-400" />
                  {profile.occupation}
                </span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-400 max-w-lg pt-1">
                {profile.bio}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="self-start px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-[#f4f4ee] hover:bg-[#e9e9dd] dark:bg-[#25271f] dark:hover:bg-[#2d3026] rounded-md transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#808000]" />
            <span>{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
          </button>
        </div>

        {/* Profile Edit Form */}
        {isEditingProfile && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-4 pt-4 border-t border-[#ecece4] dark:border-[#272920] space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-[#fbfbf9] dark:bg-[#141511] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-2.5 py-1.5 bg-[#fbfbf9] dark:bg-[#141511] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                  Occupation / Role
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#fbfbf9] dark:bg-[#141511] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                Bio / Budget Philosophy
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#fbfbf9] dark:bg-[#141511] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-[#808000] text-white rounded font-medium hover:bg-[#6e6e00]"
              >
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-3.5 py-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-[#25271f] rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. DEDICATED SECTOR: SAVINGS GOAL & TIME PERIOD PLANNER */}
      <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs transition-colors space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                  {profile.targetSavingsGoalName}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-100 dark:bg-[#25271e] text-stone-600 dark:text-stone-300">
                  {months} Months Target
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Total money to save in timeframe and monthly pace required
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddSavings(!showAddSavings)}
              className="px-2.5 py-1 text-xs font-semibold text-[#808000] dark:text-[#c4c43b] bg-[#808000]/10 hover:bg-[#808000]/20 rounded-md transition-colors"
            >
              + Deposit
            </button>
            <button
              type="button"
              onClick={() => setIsEditingGoal(!isEditingGoal)}
              className="px-2.5 py-1 text-xs font-medium text-stone-600 dark:text-stone-300 bg-[#f4f4ee] hover:bg-[#e9e9dd] dark:bg-[#25271f] dark:hover:bg-[#2d3026] rounded-md transition-colors flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3 text-[#808000]" />
              <span>{isEditingGoal ? 'Cancel' : 'Edit Goal & Time'}</span>
            </button>
          </div>
        </div>

        {/* Goal Edit Form */}
        {isEditingGoal && (
          <form
            onSubmit={handleSaveGoal}
            className="p-3.5 bg-[#fbfbf9] dark:bg-[#141511] border border-[#e2e2d8] dark:border-[#2f3127] rounded-lg space-y-3 text-xs animate-in fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Emergency Fund, Laptop, Travel"
                  required
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                  Total Money to Save ({sym})
                </label>
                <input
                  type="number"
                  step="any"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="e.g. 60000"
                  required
                  className="w-full px-2.5 py-1.5 font-mono bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                  Time Period (Months)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={timeframeMonths}
                    onChange={(e) => setTimeframeMonths(parseInt(e.target.value, 10) || 1)}
                    required
                    className="w-full px-2.5 py-1.5 font-mono bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
                  />
                  <div className="flex gap-1">
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTimeframeMonths(m)}
                        className={`px-2 py-1 text-[10px] font-mono rounded ${
                          timeframeMonths === m
                            ? 'bg-[#808000] text-white'
                            : 'bg-stone-100 dark:bg-[#25271e] text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-3 py-1 bg-[#808000] text-white rounded font-medium hover:bg-[#6e6e00]"
              >
                Save Target Plan
              </button>
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="px-3 py-1 text-stone-400 hover:bg-stone-100 dark:hover:bg-[#25271e] rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Deposit Quick Form */}
        {showAddSavings && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddSavings(parseFloat(addSavingsAmt));
            }}
            className="p-3 bg-[#f8f8f4] dark:bg-[#151611] rounded-lg border border-[#e5e5dc] dark:border-[#2b2d24] flex flex-col sm:flex-row items-center gap-2 animate-in fade-in"
          >
            <div className="flex-1 w-full relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-xs">
                {sym}
              </span>
              <input
                type="number"
                step="any"
                placeholder="Enter deposit amount..."
                value={addSavingsAmt}
                onChange={(e) => setAddSavingsAmt(e.target.value)}
                required
                className="w-full pl-7 pr-3 py-1.5 text-xs font-mono bg-white dark:bg-[#1f211a] border border-[#dcdcd1] dark:border-[#323528] rounded text-stone-900 dark:text-stone-100"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {monthlySavingsNeeded > 0 && (
                <button
                  type="button"
                  onClick={() => handleAddSavings(monthlySavingsNeeded)}
                  className="px-2.5 py-1.5 text-xs bg-[#808000]/10 hover:bg-[#808000]/20 text-[#808000] dark:text-[#c4c43b] rounded font-medium whitespace-nowrap"
                  title="Deposit 1 month target"
                >
                  Deposit Target ({formatMoney(monthlySavingsNeeded, currency)})
                </button>
              )}

              <button
                type="submit"
                className="px-3 py-1.5 bg-[#808000] text-white rounded text-xs font-medium hover:bg-[#6e6e00] whitespace-nowrap"
              >
                Deposit
              </button>
            </div>
          </form>
        )}

        {/* HIGHLIGHT BOX: TOTAL MONEY TO SAVE IN A MONTH TO REACH GOAL */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#808000]/10 via-[#808000]/5 to-transparent border border-[#808000]/25">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#808000] dark:text-[#c4c43b] uppercase tracking-wider block">
                Required Monthly Savings Target
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-stone-900 dark:text-stone-100">
                  {formatMoney(monthlySavingsNeeded, currency)}
                </span>
                <span className="text-xs text-stone-500 font-medium">
                  / month to reach goal in {months} months
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                Pace Breakdown
              </span>
              <span className="text-xs font-mono font-semibold text-stone-700 dark:text-stone-300 block mt-0.5">
                ~{formatMoney(dailySavingsNeeded, currency)} / day
              </span>
              <span className="text-[11px] text-stone-500 block">
                {pctOfAllowance > 0 ? `${pctOfAllowance.toFixed(1)}% of allowance` : 'Allowance not set'}
              </span>
            </div>
          </div>

          {/* Feasibility Indicator */}
          <div className="mt-3 pt-3 border-t border-[#808000]/15 flex items-center justify-between text-xs">
            <span className="text-stone-600 dark:text-stone-400">
              {remainingToSave <= 0
                ? '🎉 Congratulations! You have fully reached this savings target!'
                : `Need to set aside ${formatMoney(monthlySavingsNeeded, currency)} every month for ${months} months to accumulate ${formatMoney(remainingToSave, currency)} more.`}
            </span>

            {allowance > 0 && remainingToSave > 0 && (
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                  pctOfAllowance <= 25
                    ? 'bg-[#808000]/20 text-[#808000] dark:text-[#c4c43b]'
                    : pctOfAllowance <= 40
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {pctOfAllowance <= 25
                  ? 'Sustainable Target'
                  : pctOfAllowance <= 40
                  ? 'Moderate Effort'
                  : 'Tight Budget Required'}
              </span>
            )}
          </div>
        </div>

        {/* Progress Gauge & Stats */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-stone-500">
              {formatMoney(currentSavings, currency)} saved
            </span>
            <span className="text-stone-900 dark:text-stone-100 font-semibold">
              {formatMoney(targetAmount, currency)} target total
            </span>
          </div>

          <div className="h-2.5 w-full bg-[#ebebe3] dark:bg-[#272920] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#808000] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-stone-400">
            <span>{progressPct.toFixed(1)}% achieved</span>
            <span>
              {formatMoney(remainingToSave, currency)} remaining over {months} months
            </span>
          </div>
        </div>
      </div>

      {/* 3. MEMBERSHIP & DISCIPLINE STATS */}
      <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#808000]/10 text-[#808000] dark:text-[#c4c43b] flex items-center justify-center">
            <Award className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-semibold text-stone-800 dark:text-stone-200">
            Planner Membership & Overview
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-[#fbfbf9] dark:bg-[#141511] border border-[#ecece4] dark:border-[#272920]">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              Active Monthly Allowance
            </span>
            <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 block">
              {formatMoney(allowance, currency)}
            </span>
            <span className="text-[10px] text-stone-400">
              Currency: {currency.code} ({sym})
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#fbfbf9] dark:bg-[#141511] border border-[#ecece4] dark:border-[#272920]">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              Tracked Expenses
            </span>
            <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 mt-0.5 block">
              {expenses.length} entries
            </span>
            <span className="text-[10px] text-stone-400">
              Across active sectors
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#fbfbf9] dark:bg-[#141511] border border-[#ecece4] dark:border-[#272920]">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
              Member Since
            </span>
            <span className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5 block">
              {profile.joinDate}
            </span>
            <span className="text-[10px] text-stone-400">
              Personalized budget profile
            </span>
          </div>
        </div>
      </div>

      {/* 4. DATA PORTABILITY & BACKUP */}
      <div className="bg-white dark:bg-[#1b1c17] border border-[#e5e5dc] dark:border-[#2b2d24] rounded-xl p-5 shadow-xs">
        <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
          Data Portability & Backup
        </h3>
        <p className="text-xs text-stone-500 mb-4 max-w-lg">
          Your allowance, goals, and expense history are stored locally in your browser. Export a complete JSON backup or restore past data anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#808000] hover:bg-[#6e6e00] rounded-md transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (JSON)</span>
          </button>

          <label className="px-3.5 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-[#f4f4ee] hover:bg-[#e9e9dd] dark:bg-[#24261e] dark:hover:bg-[#2d3026] rounded-md transition-colors flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#808000]" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
