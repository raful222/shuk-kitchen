import React, { useState } from 'react';
import { 
  Wallet, DollarSign, Plus, Receipt, TrendingUp, 
  ArrowUpRight, ArrowDownLeft, Check, Users, ExternalLink,
  Camera, Image as ImageIcon, X, Send, AlertCircle
} from 'lucide-react';

export default function BudgetTab({
  expenses = [],
  deposits = [],
  members = [],
  payboxLink = 'https://payboxapp.page.link/shuk-kitchen',
  onAddExpense,
  onAddDeposit,
  onToggleMemberPayment,
  onUpdatePayboxLink,
}) {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [viewingReceiptImage, setViewingReceiptImage] = useState(null);

  // New expense form
  const [expenseStore, setExpenseStore] = useState('מחסני השוק');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);

  // New deposit form
  const [depositMemberId, setDepositMemberId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // Calculations
  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const fundBalance = totalDeposits - totalExpenses;

  // Payment status stats
  const paidMembersCount = members.filter(m => !!m.paidThisMonth).length;
  const unpaidMembers = members.filter(m => !m.paidThisMonth);

  // Approximate cost per meal
  const estimatedMealsCount = members.length * 3 * 3;
  const costPerMeal = estimatedMealsCount > 0 ? (totalExpenses / estimatedMealsCount).toFixed(1) : 0;

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

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
      receiptImage: receiptImage || null,
    });

    setExpenseAmount('');
    setExpenseDesc('');
    setReceiptImage(null);
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

    // Also mark member as paid
    onToggleMemberPayment(depositMemberId, true);

    setDepositAmount('');
    setDepositMemberId('');
    setShowAddDepositModal(false);
  };

  const handleSendUnpaidReminder = () => {
    if (unpaidMembers.length === 0) {
      alert('כולם שילמו החודש! איזה כיף 🎉');
      return;
    }

    const names = unpaidMembers.map(m => m.name).join(', ');
    const text = `היי חברים, תזכורת ידידותית לקופת האוכל של מחסני השוק 🛒🍗\nחברים שטרם העבירו: ${names}\n\nלתשלום ישיר בפייבוקס: ${payboxLink}\nתודה לכולם!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-3 sm:px-4 max-w-md mx-auto">
      
      {/* 💳 PAYBOX PROMINENT DIRECT LINK BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 text-white rounded-3xl p-4 shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            PB
          </div>
          <div>
            <h3 className="font-black text-sm">תשלום ישיר ב-PayBox</h3>
            <p className="text-[11px] text-blue-100">קופת האוכל המשותפת של הצוות</p>
          </div>
        </div>

        <a
          href={payboxLink}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs px-3.5 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
        >
          <span>פתח PayBox</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

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
            <span>הזנת קבלה + תמונה</span>
          </button>

          <button
            onClick={() => setShowAddDepositModal(true)}
            className="py-2.5 px-3 rounded-2xl bg-black/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-black/40 active:scale-95 transition border border-white/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>רישום הפקדה</span>
          </button>
        </div>
      </div>

      {/* ✅ TRACKER: WHO PAID / WHO HASN'T PAID THIS MONTH */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>סטטוס תשלום החודש</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              {paidMembersCount} מתוך {members.length} שילמו לקופה
            </p>
          </div>

          {unpaidMembers.length > 0 && (
            <button
              onClick={handleSendUnpaidReminder}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition active:scale-95"
            >
              <Send className="w-3 h-3 text-emerald-600" />
              <span>תזכורת בוואטסאפ</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {members.map(member => {
            const hasPaid = !!member.paidThisMonth;

            return (
              <button
                key={member.id}
                onClick={() => onToggleMemberPayment(member.id, !hasPaid)}
                className={`p-2.5 rounded-2xl border text-right flex items-center justify-between transition-all ${
                  hasPaid
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                    : 'bg-rose-50/60 border-rose-200 text-rose-900 font-medium'
                }`}
              >
                <div className="truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm shrink-0">{member.avatar}</span>
                    <span className="text-xs truncate">{member.name}</span>
                  </div>
                  <span className={`text-[10px] block mt-0.5 font-bold ${hasPaid ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {hasPaid ? 'שילם ✓' : 'טרם שילם ⏳'}
                  </span>
                </div>

                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  hasPaid ? 'bg-emerald-600 text-white' : 'bg-rose-400 text-white'
                }`}>
                  {hasPaid ? '✓' : '✕'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🧾 EXPENSES LIST (RECEIPTS & PHOTO UPLOADS) */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-orange-600" />
            <span>קבלות מחסני השוק</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">{expenses.length} רכישות</span>
        </div>

        <div className="space-y-2">
          {expenses.map(expense => (
            <div
              key={expense.id}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                {expense.receiptImage ? (
                  <button
                    onClick={() => setViewingReceiptImage(expense.receiptImage)}
                    className="w-10 h-10 rounded-xl overflow-hidden border border-orange-300 shrink-0 relative group"
                    title="לחץ לצפייה בקבלה"
                  >
                    <img
                      src={expense.receiptImage}
                      alt="קבלה"
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-[10px]">
                      🔍
                    </div>
                  </button>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center text-base shrink-0">
                    🧾
                  </div>
                )}

                <div>
                  <h4 className="font-bold text-xs text-slate-800">{expense.description}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                    <span className="font-semibold text-orange-700">{expense.store}</span>
                    <span>•</span>
                    <span>{expense.paidBy}</span>
                    <span>•</span>
                    <span>{expense.date}</span>
                  </div>
                </div>
              </div>

              <span className="font-black text-sm text-rose-600 shrink-0">
                -{expense.amount} ₪
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 🖼️ VIEW RECEIPT IMAGE MODAL */}
      {viewingReceiptImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-800">תמונת הקבלה ממחסני השוק</h4>
              <button
                onClick={() => setViewingReceiptImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl">
              <img src={viewingReceiptImage} alt="קבלה מלאה" className="w-full rounded-xl" />
            </div>
          </div>
        </div>
      )}

      {/* ➕ ADD EXPENSE MODAL (WITH CAMERA / PHOTO UPLOAD) */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-800">הזנת קבלה + צילום חשבונית</h3>

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

              {/* Photo Upload / Camera */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  צלם / העלה תמונה של הקבלה:
                </label>
                <label className="border-2 border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-100/50 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition">
                  {receiptImage ? (
                    <div className="flex items-center gap-2">
                      <img src={receiptImage} alt="תצוגה מקדימה" className="w-12 h-12 rounded-lg object-cover border" />
                      <span className="text-xs font-bold text-emerald-700">תמונה צורפה בהצלחה ✓</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-orange-600" />
                      <span className="text-xs font-bold text-orange-700">לחץ לצילום קבלה או בחירה מגלריה</span>
                      <span className="text-[10px] text-slate-400">ישמר ישירות במערכת</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
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
                  placeholder="למשל: 4 פלטות חזה עוף + פרגיות + אורז קוקוס..."
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
