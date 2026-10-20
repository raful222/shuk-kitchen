import React, { useState } from 'react';
import { 
  Wallet, DollarSign, Plus, Receipt, TrendingUp, 
  ArrowUpRight, ArrowDownLeft, Check, Users 
} from 'lucide-react';

export default function BudgetTab({
  expenses = [],
  deposits = [],
  members = [],
  onAddExpense,
  onAddDeposit,
}) {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);

  // New expense form
  const [expenseStore, setExpenseStore] = useState('מחסני השוק');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');

  // New deposit form
  const [depositMemberId, setDepositMemberId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Calculations
  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const fundBalance = totalDeposits - totalExpenses;

  // Approximate cost per meal (total expenses divided by estimated meals)
  const estimatedMealsCount = 8 * 3 * 3; // ~72 meals
  const costPerMeal = estimatedMealsCount > 0 ? (totalExpenses / estimatedMealsCount).toFixed(1) : 0;

  const handleCreateExpense = (e) => {
    e.preventDefault();
    if (!expenseAmount || !expensePaidBy) return;

    onAddExpense({
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      store: expenseStore,
      description: expenseDesc.trim() || 'קנייה במחסני השוק',
      amount: parseFloat(expenseAmount),
      paidBy: expensePaidBy,
    });

    setExpenseAmount('');
    setExpenseDesc('');
    setShowAddExpenseModal(false);
  };

  const handleCreateDeposit = (e) => {
    e.preventDefault();
    if (!depositMemberId || !depositAmount) return;

    onAddDeposit({
      id: `dep-${Date.now()}`,
      memberId: depositMemberId,
      amount: parseFloat(depositAmount),
      date: new Date().toISOString().split('T')[0],
    });

    setDepositAmount('');
    setDepositMemberId('');
    setShowAddDepositModal(false);
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-3 sm:px-4 max-w-md mx-auto">
      
      {/* 💰 FUND BALANCE HERO */}
      <div className={`rounded-3xl p-5 text-white shadow-lg space-y-3 ${
        fundBalance >= 0 
          ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700' 
          : 'bg-gradient-to-br from-rose-600 via-red-600 to-rose-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xs text-white/80 block font-medium">יתרת קופת אוכל:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black">{Math.round(fundBalance)}</span>
                <span className="text-sm font-bold text-white/90">₪</span>
              </div>
            </div>
          </div>

          <div className="text-left bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-2xl">
            <span className="text-[10px] text-white/80 block">עלות ממוצעת למנה:</span>
            <span className="text-base font-black">~{costPerMeal} ₪</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-400/30 flex items-center justify-center text-xs">
              ↓
            </div>
            <div>
              <span className="text-[10px] text-white/80 block">הופקד בקופה:</span>
              <span className="text-xs font-bold">{totalDeposits} ₪</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rose-400/30 flex items-center justify-center text-xs">
              ↑
            </div>
            <div>
              <span className="text-[10px] text-white/80 block">הוצאות (מחסני השוק):</span>
              <span className="text-xs font-bold">{totalExpenses} ₪</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="py-2.5 px-3 rounded-2xl bg-white text-slate-900 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-slate-50 active:scale-95 transition"
          >
            <Receipt className="w-3.5 h-3.5 text-orange-600" />
            <span>הזנת קבלה</span>
          </button>

          <button
            onClick={() => setShowAddDepositModal(true)}
            className="py-2.5 px-3 rounded-2xl bg-black/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-black/40 active:scale-95 transition border border-white/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>הפקדה לקופה</span>
          </button>
        </div>
      </div>

      {/* 🧾 EXPENSES LIST (RECEIPTS) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-orange-600" />
            <span>הוצאות וקניות אחרונות</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">{expenses.length} רכישות</span>
        </div>

        <div className="space-y-2">
          {expenses.map(expense => (
            <div
              key={expense.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
            >
              <div>
                <h4 className="font-bold text-xs text-slate-800">{expense.description}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-orange-700">{expense.store}</span>
                  <span>•</span>
                  <span>שילם: {expense.paidBy}</span>
                  <span>•</span>
                  <span>{expense.date}</span>
                </div>
              </div>

              <span className="font-black text-sm text-rose-600 shrink-0">
                -{expense.amount} ₪
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 👥 FUND DEPOSITS PER MEMBER */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <Users className="w-4 h-4 text-emerald-600" />
          <span>הפקדות חברי הצוות</span>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {members.map(member => {
            const memberTotalDeposited = deposits
              .filter(d => d.memberId === member.id)
              .reduce((sum, d) => sum + Number(d.amount), 0);

            return (
              <div
                key={member.id}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{member.avatar}</span>
                  <span className="font-bold text-xs text-slate-800 truncate">{member.name}</span>
                </div>
                <span className="font-black text-xs text-emerald-700 shrink-0">
                  {memberTotalDeposited} ₪
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ➕ ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-800">הזנת קבלה / הוצאה</h3>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">סכום הקבלה (₪):</label>
                <input
                  type="number"
                  step="0.5"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="350.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">חנות / סניף:</label>
                <input
                  type="text"
                  value={expenseStore}
                  onChange={(e) => setExpenseStore(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">מי שילם/ה בקופה?</label>
                <select
                  value={expensePaidBy}
                  onChange={(e) => setExpensePaidBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                >
                  <option value="">בחר/י שם...</option>
                  <option value="קופת מזומן משותפת">קופת מזומן משותפת</option>
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">פירוט (אופציונלי):</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="למשל: חזה עוף + פרגיות + ירקות..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700"
                >
                  שמור הוצאה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ➕ ADD DEPOSIT MODAL */}
      {showAddDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-800">הפקדת כסף לקופה המשותפת</h3>

            <form onSubmit={handleCreateDeposit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">מי הפקיד/ה?</label>
                <select
                  value={depositMemberId}
                  onChange={(e) => setDepositMemberId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                  required
                >
                  <option value="">בחר/י חבר צוות...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">סכום ההפקדה (₪):</label>
                <input
                  type="number"
                  step="10"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="150"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDepositModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-xl shadow-md hover:bg-emerald-700"
                >
                  אשר הפקדה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
