
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  User as UserIcon, 
  Settings,
  Globe,
  LogOut,
  ChevronDown,
  Wallet
} from 'lucide-react';
import { GlassCard } from './components/GlassCard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { ChartsSection } from './components/ChartsSection';
import { FinancialTips } from './components/FinancialTips';
import { Auth } from './components/Auth';
import { ProfileModal } from './components/ProfileModal';
import { AIChat } from './components/AIChat';
import { Transaction, TransactionType, UserProfile, Currency } from './types';
import { CURRENCIES } from './constants';
import { exportTransactionsToCSV } from './utils/exportUtils';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const currentCurrency = useMemo(() => 
    user ? (CURRENCIES.find(c => c.code === user.currencyCode) || CURRENCIES[0]) : CURRENCIES[0], 
    [user?.currencyCode]
  );

  // Initial Data Load
  useEffect(() => {
    const savedTransactions = localStorage.getItem('zen_transactions');
    const savedUser = localStorage.getItem('zen_user');
    
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('zen_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('zen_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('zen_user');
    }
  }, [user]);

  const stats = useMemo(() => {
    const incomeFromTransactions = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // Ensure monthlyIncome is treated as a number
    const baseMonthlyIncome = Number(user?.monthlyIncome) || 0;
    const totalPotentialIncome = baseMonthlyIncome + incomeFromTransactions;

    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, curr) => acc + curr.amount, 0);
      
    return {
      totalPotentialIncome,
      baseMonthlyIncome,
      extraIncome: incomeFromTransactions, // ONLY income added via form
      expense: totalExpense,
      balance: totalPotentialIncome - totalExpense
    };
  }, [transactions, user?.monthlyIncome]);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = { ...newTx, id: crypto.randomUUID() };
    setTransactions([transaction, ...transactions]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleUpdateProfile = (updatedData: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  const changeCurrency = (code: string) => {
    if (user) {
      setUser({ ...user, currencyCode: code });
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(currentCurrency.locale, {
      style: 'currency',
      currency: currentCurrency.code,
    }).format(amount);
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  if (!user || !user.isLoggedIn) {
    return <Auth onAuthComplete={setUser} />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <CreditCard className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent tracking-tighter">
              ZenSpend
            </h1>
            <p className="text-sm text-slate-500 font-medium">{currentDate}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* User Profile Component */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 pl-2 pr-4 py-2 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border-2 border-indigo-500/30">
                {user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-indigo-600/20 text-indigo-400">
                    <UserIcon size={18} />
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active User</p>
                <p className="text-sm text-white font-bold">{user.name}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 p-2"
                >
                  <button 
                    onClick={() => { setShowProfileModal(true); setIsDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-slate-300 hover:text-white"
                  >
                    <UserIcon size={18} />
                    <span className="font-medium text-sm">Edit Profile</span>
                  </button>
                  <button 
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-slate-300 hover:text-white"
                    onClick={() => { setShowProfileModal(true); setIsDropdownOpen(false); }}
                  >
                    <Settings size={18} />
                    <span className="font-medium text-sm">Settings</span>
                  </button>
                  <div className="h-px bg-white/5 my-2 mx-2" />
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 rounded-xl transition-colors text-rose-400"
                  >
                    <LogOut size={18} />
                    <span className="font-medium text-sm">Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-10 w-px bg-white/10 hidden md:block" />

          {/* Currency Selector */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl">
            <Globe size={16} className="text-indigo-400" />
            <select 
              value={user.currencyCode}
              onChange={(e) => changeCurrency(e.target.value)}
              className="bg-transparent text-white text-sm font-semibold outline-none cursor-pointer"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} className="bg-slate-900">{c.code} ({c.symbol})</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => exportTransactionsToCSV(transactions)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
          >
            <Download size={18} />
            <span className="font-bold text-sm">Export</span>
          </button>
        </div>
      </header>

      {/* Profile/Settings Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <ProfileModal 
            user={user} 
            currency={currentCurrency}
            onClose={() => setShowProfileModal(false)} 
            onUpdate={handleUpdateProfile} 
          />
        )}
      </AnimatePresence>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <GlassCard delay={0.1} className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Wallet size={16} strokeWidth={3} />
            <p className="text-xs uppercase tracking-widest font-black">Available Balance</p>
          </div>
          <h2 className="text-4xl font-black text-white">{formatCurrency(stats.balance)}</h2>
          <div className="mt-4 flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest ${stats.balance >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {stats.balance >= 0 ? 'STABLE' : 'OVERDRAWN'}
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base + Addons - Expenses</span>
          </div>
        </GlassCard>

        <GlassCard delay={0.2} className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <TrendingUp size={16} strokeWidth={3} />
            <p className="text-xs uppercase tracking-widest font-black">Extra Income</p>
          </div>
          <h2 className="text-4xl font-black text-white">{formatCurrency(stats.extraIncome)}</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4 italic">
            Monthly Base ({formatCurrency(stats.baseMonthlyIncome)}) not included in this card.
          </p>
        </GlassCard>

        <GlassCard delay={0.3} className="relative overflow-hidden group border-rose-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <TrendingDown size={16} strokeWidth={3} />
            <p className="text-xs uppercase tracking-widest font-black">Total Expenses</p>
          </div>
          <h2 className="text-4xl font-black text-white">{formatCurrency(stats.expense)}</h2>
          <div className="mt-4">
             <div className="w-full bg-slate-800 rounded-full h-1.5">
               <div 
                 className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                 style={{ width: `${Math.min((stats.expense / (stats.totalPotentialIncome || 1)) * 100, 100) || 0}%` }}
               />
             </div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
               {((stats.expense / (stats.totalPotentialIncome || 1)) * 100 || 0).toFixed(1)}% of total budget used
             </p>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">Record Transaction</h3>
            <GlassCard delay={0.4}>
              <TransactionForm onAdd={handleAddTransaction} currency={currentCurrency} />
            </GlassCard>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">History</h3>
            <GlassCard delay={0.5} className="!p-4">
              <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} currency={currentCurrency} />
            </GlassCard>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-10">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Analytics Dashboard</h3>
              <p className="text-xs text-slate-500 uppercase font-black tracking-widest">Base: {currentCurrency.code}</p>
            </div>
            <ChartsSection transactions={transactions} />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FinancialTips />
            <div className="bg-slate-800/40 rounded-3xl p-6 border border-white/5 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                <UserIcon size={120} />
              </div>
              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-white">Spending Personality</h4>
                  <p className="text-xs text-indigo-400 uppercase tracking-widest font-black">
                    {stats.balance > (stats.totalPotentialIncome * 0.2) ? 'Wealth Architect' : stats.balance < 0 ? 'Experience Collector' : 'Balanced Minimalist'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10">
                {stats.balance > (stats.totalPotentialIncome * 0.2)
                  ? "You have a solid financial foundation. Your current balance reflects good discipline." 
                  : "Life is about experiences, but consistent small outflows are impacting your safety net. ZenSpend AI can help!"}
              </p>
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-20 pt-10 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>&copy; 2024 ZenSpend Dashboard. Elevate your financial consciousness.</p>
      </footer>

      {/* AI Assistant Chat Component */}
      <AIChat 
        transactions={transactions} 
        currency={currentCurrency} 
        userName={user.name} 
      />
    </motion.div>
  );
};

export default App;
