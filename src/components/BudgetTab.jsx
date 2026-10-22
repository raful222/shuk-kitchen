import React, { useState } from 'react';
import { 
  Wallet, DollarSign, Plus, Receipt, TrendingUp, 
  ArrowUpRight, ArrowDownLeft, Check, Users, ExternalLink,
  Camera, Image as ImageIcon, X, Send, AlertCircle, UserPlus,
  HelpCircle, Share2, CornerDownLeft, CreditCard, RefreshCw
} from 'lucide-react';
import { generateWhatsAppDebtSummary } from '../utils/helpers';

export default function BudgetTab({
  expenses = [],
  deposits = [],
  withdrawals = [],
  members = [],
  payboxLink = 'https://payboxapp.page.link/shuk-kitchen',
  onAddExpense,
  onAddDeposit,
  onAddWithdrawal,
  onToggleMemberPayment,
  onUpdatePayboxLink,
  onOpenSettings,
}) {
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddDepositModal, setShowAddDepositModal] = useState(false);
  const [showAddWithdrawalModal, setShowAddWithdrawalModal] = useState(false);
  const [viewingReceiptImage, setViewingReceiptImage] = useState(null);
  const [showPayboxExplanation, setShowPayboxExplanation] = useState(false);
  const [historyTab, setHistoryTab] = useState('expenses'); // 'expenses' | 'withdrawals' | 'deposits'

  // New expense form
  const [expenseStore, setExpenseStore] = useState('מחסני השוק');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('');
  const [customPayer, setCustomPayer] = useState('');
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null); // { dataUrl, isPdf, name }

  // New deposit form
  const [depositMemberId, setDepositMemberId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  // New withdrawal form
  const [withdrawalMemberId, setWithdrawalMemberId] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState('');

  // Calculations
  const totalDeposits = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0);

  // Direct expenses paid straight from the common fund (not from private pocket)
  const directFundExpenses = expenses
    .filter(e => e.paidBy === 'קופת מזומן משותפת' || e.paidBy === 'קופת פייבוקס')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  // In a PayBox pool: Fund Balance = Deposits - Withdrawals - Direct Pool Expenses
  const fundBalance = totalDeposits - totalWithdrawals - directFundExpenses;

  // Member Balances & Reimbursements ("מי חייב למי")
  const memberLedger = members.map(m => {
    const memberExpenses = expenses.filter(e => e.paidBy === m.name);
    const paidOutOfPocket = memberExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const memberWithdrawals = withdrawals.filter(w => w.memberId === m.id);
    const withdrawn = memberWithdrawals.reduce((sum, w) => sum + Number(w.amount || 0), 0);
    const reimbursementDue = Math.max(0, paidOutOfPocket - withdrawn);
    const memberDeposits = deposits.filter(d => d.memberId === m.id);
    const totalDeposited = memberDeposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    return {
      member: m,
      paidOutOfPocket,
      withdrawn,
      reimbursementDue,
      totalDeposited,
      hasPaidThisMonth: !!m.paidThisMonth,
    };
  });

  const creditorMembers = memberLedger.filter(item => item.reimbursementDue > 0);
  const unpaidMembers = members.filter(m => !m.paidThisMonth);
  const paidMembersCount = members.filter(m => !!m.paidThisMonth).length;

  // Cost per meal estimation
  const estimatedMealsCount = members.length > 0 ? (members.length * 3 * 3) : 0;
  const costPerMeal = estimatedMealsCount > 0 ? (totalExpenses / estimatedMealsCount).toFixed(1) : 0;

  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptFile({ dataUrl: event.target.result, isPdf: false, name: file.name });
      setReceiptImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptFile({ dataUrl: event.target.result, isPdf, name: file.name });
      setReceiptImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadLatestShukReceipt = () => {
    setExpenseAmount('1396.40');
    setExpenseStore('מחסני השוק (אונליין)');
    setExpensePaidBy('מור אלי');
    setExpenseDesc('41 פריטים: 10.3 ק"ג עופות (פרגיות+שניצל), אורז בסמטי, קוסקוס, צ\'יפס, ירקות, שתייה וכלים');
  };

  const handleCreateExpense = (e) => {
    e.preventDefault();
    const finalPaidBy = (expensePaidBy === 'custom' ? customPayer.trim() : expensePaidBy) || 'קופת מזומן משותפת';
    if (!expenseAmount || !finalPaidBy) return;

    onAddExpense({
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      store: expenseStore,
      description: expenseDesc.trim() || 'קנייה במחסני השוק',
      amount: parseFloat(expenseAmount),
      paidBy: finalPaidBy,
      receiptImage: receiptImage || null,
      receiptFile: receiptFile || null,
    });

    setExpenseAmount('');
    setExpenseDesc('');
    setReceiptImage(null);
    setReceiptFile(null);
    setCustomPayer('');
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

    onToggleMemberPayment(depositMemberId, true);

    setDepositAmount('');
    setDepositMemberId('');
    setShowAddDepositModal(false);
  };

  const handleCreateWithdrawal = (e) => {
    e.preventDefault();
    if (!withdrawalMemberId || !withdrawalAmount) return;

    const member = members.find(m => m.id === withdrawalMemberId);
    onAddWithdrawal({
      id: `with-${Date.now()}`,
      memberId: withdrawalMemberId,
      memberName: member?.name || 'חבר צוות',
      amount: parseFloat(withdrawalAmount),
      reason: withdrawalReason.trim() || 'החזר כספי על קנייה במחסני השוק',
      date: new Date().toISOString().split('T')[0],
    });

    setWithdrawalAmount('');
    setWithdrawalMemberId('');
    setWithdrawalReason('');
    setShowAddWithdrawalModal(false);
  };

  const handleOpenWithdrawalForMember = (memberId, defaultAmount) => {
    setWithdrawalMemberId(memberId);
    setWithdrawalAmount(defaultAmount > 0 ? String(defaultAmount) : '');
    setWithdrawalReason('החזר על קניות מחסני השוק');
    setShowAddWithdrawalModal(true);
  };

  const handleOpenDepositForMember = (memberId) => {
    setDepositMemberId(memberId);
    setDepositAmount('150');
    setShowAddDepositModal(true);
  };

  const handleShareDebtSummary = () => {
    const text = generateWhatsAppDebtSummary({
      members,
      payboxLink,
      fundBalance,
      unpaidMembers,
      reimbursementsDue: creditorMembers.map(c => ({
        name: c.member.name,
        amount: c.reimbursementDue,
        reason: 'קניות מכספו/ה האישי',
      })),
    });
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-3 sm:px-4 max-w-md mx-auto">
      
      {/* 💳 PAYBOX PROMINENT DIRECT LINK & INFO BANNER */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 text-white rounded-3xl p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center font-black text-2xl shadow-md shrink-0">
              PB
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-sm">קבוצת ה-PayBox</h3>
                <button
                  onClick={() => setShowPayboxExplanation(!showPayboxExplanation)}
                  className="text-blue-200 hover:text-white"
                  title="הסבר על חיבור אוטומטי"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
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

        {/* Info callout on how PayBox sync works */}
        {showPayboxExplanation && (
          <div className="bg-blue-900/60 rounded-2xl p-3 text-[11px] text-blue-100 space-y-1.5 border border-blue-400/30">
            <div className="font-bold flex items-center gap-1 text-amber-300">
              <span>💡 איך עובד המעקב אחר כספי PayBox?</span>
            </div>
            <p className="leading-relaxed">
              אפליקציית פייבוקס שייכת לבנק דיסקונט ומאובטחת בקפדנות בנקאית (קוד SMS), ולכן לא מאפשרת משיכת נתונים אוטומטית מאפליקציות חיצוניות.
            </p>
            <p className="leading-relaxed font-medium">
              המערכת כאן מנהלת עבורכם את הספר במדויק: כל הפקדה, משיכת החזר או קבלה מתועדים בזמן אמת, והיתרה והחובות מחושבים אוטומטית לכל חבר צוות.
            </p>
          </div>
        )}
      </div>

      {/* 💰 FUND BALANCE HERO CARD */}
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
              <span className="text-xs text-white/80 block font-medium">יתרת קופת פייבוקס מחושבת:</span>
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

        {/* 3 Metrics: Deposits, Supermarket Expenses, Withdrawals */}
        <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/20 text-center">
          <div className="p-1.5 rounded-xl bg-black/10">
            <span className="text-[9px] text-white/80 block">הופקד בקופה:</span>
            <span className="text-xs font-bold text-emerald-200">+{totalDeposits} ₪</span>
          </div>

          <div className="p-1.5 rounded-xl bg-black/10">
            <span className="text-[9px] text-white/80 block">קניות (מחסני השוק):</span>
            <span className="text-xs font-bold text-amber-200">{totalExpenses} ₪</span>
          </div>

          <div className="p-1.5 rounded-xl bg-black/10">
            <span className="text-[9px] text-white/80 block">נמשך כהחזרים:</span>
            <span className="text-xs font-bold text-rose-200">-{totalWithdrawals} ₪</span>
          </div>
        </div>

        {/* Quick actions: Receipt, Deposit, Withdrawal */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="py-2 px-2 rounded-2xl bg-white text-slate-900 font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm hover:bg-slate-50 active:scale-95 transition"
          >
            <Receipt className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>הזנת קבלה</span>
          </button>

          <button
            onClick={() => setShowAddDepositModal(true)}
            className="py-2 px-2 rounded-2xl bg-black/30 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm hover:bg-black/40 active:scale-95 transition border border-white/20"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>רשום הפקדה</span>
          </button>

          <button
            onClick={() => {
              setWithdrawalMemberId('');
              setWithdrawalAmount('');
              setWithdrawalReason('');
              setShowAddWithdrawalModal(true);
            }}
            className="py-2 px-2 rounded-2xl bg-black/30 text-white font-bold text-[11px] flex items-center justify-center gap-1 shadow-sm hover:bg-black/40 active:scale-95 transition border border-white/20"
          >
            <CornerDownLeft className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>משיכת החזר</span>
          </button>
        </div>
      </div>

      {/* ⚖️ SECTION: WHO OWES WHOM & PERSONAL REIMBURSEMENT STATUS */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span>מי חייב למי וזכאות להחזרים</span>
            </h3>
            <p className="text-[11px] text-slate-500">מי שילם מכספו הפרטי ומי טרם הפקיד</p>
          </div>

          <button
            onClick={handleShareDebtSummary}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>דוח בוואטסאפ</span>
          </button>
        </div>

        {/* 1. Creditors (Owed refund from PayBox) */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 block">
            🟢 מגיע להם החזר מפייבוקס (שילמו על קניות מכספם):
          </span>

          {creditorMembers.length === 0 ? (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs text-slate-500 font-medium">
                ✅ כל מי ששילם מכספו קיבל החזר מלא. אין החזרים ממתינים.
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {creditorMembers.map(item => (
                <div
                  key={item.member.id}
                  className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.member.avatar || '👤'}</span>
                    <div>
                      <span className="font-extrabold text-xs text-slate-900 block">
                        {item.member.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        שילם/ה {item.paidOutOfPocket} ₪ | נמשך {item.withdrawn} ₪
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-700">
                      מגיע: {item.reimbursementDue} ₪
                    </span>
                    <button
                      onClick={() => handleOpenWithdrawalForMember(item.member.id, item.reimbursementDue)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-1 rounded-lg transition active:scale-95"
                    >
                      רשום החזר
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Debtors (Haven't deposited yet) */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-700 block">
            🔴 חברים שטרם הפקידו החודש לקופה:
          </span>

          {unpaidMembers.length === 0 ? (
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-center">
              <span className="text-xs text-emerald-800 font-bold">
                🎉 כולם הפקידו החודש! הקופה מלאה.
              </span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {unpaidMembers.map(m => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{m.avatar || '👤'}</span>
                    <span className="font-extrabold text-xs text-slate-800">{m.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-600">
                      טרם הפקיד/ה ⏳
                    </span>
                    <button
                      onClick={() => handleOpenDepositForMember(m.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] px-2 py-1 rounded-lg transition active:scale-95"
                    >
                      רשום הפקדה
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ✅ SECTION: MONTHLY PAYMENT STATUS (GRID CHECKLIST) */}
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

          {unpaidMembers.length > 0 && members.length > 0 && (
            <button
              onClick={handleShareDebtSummary}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px] px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition active:scale-95"
            >
              <Send className="w-3 h-3 text-emerald-600" />
              <span>תזכורת בוואטסאפ</span>
            </button>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-4 space-y-2">
            <p className="text-xs text-slate-500">עדיין לא הוגדרו חברי צוות למעקב תשלומים.</p>
            <button
              onClick={onOpenSettings}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>הוסף חברי צוות בהגדרות</span>
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* 🧾 LOG SECTION: TABS FOR RECEIPTS VS WITHDRAWALS VS DEPOSITS */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setHistoryTab('expenses')}
              className={`text-xs px-2.5 py-1 rounded-xl font-bold transition ${
                historyTab === 'expenses'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              קבלות קניות ({expenses.length})
            </button>
            <button
              onClick={() => setHistoryTab('withdrawals')}
              className={`text-xs px-2.5 py-1 rounded-xl font-bold transition ${
                historyTab === 'withdrawals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              משיכות החזרים ({withdrawals.length})
            </button>
            <button
              onClick={() => setHistoryTab('deposits')}
              className={`text-xs px-2.5 py-1 rounded-xl font-bold transition ${
                historyTab === 'deposits'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              הפקדות ({deposits.length})
            </button>
          </div>
        </div>

        {/* 1. Expenses / Receipts Tab */}
        {historyTab === 'expenses' && (
          <div>
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                אין קבלות עדיין. לחץ למעלה על "הזנת קבלה" כדי לתעד קנייה.
              </p>
            ) : (
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
                          className="w-10 h-10 rounded-xl overflow-hidden border border-orange-300 shrink-0 relative group flex items-center justify-center bg-orange-50"
                          title="לחץ לצפייה בקבלה"
                        >
                          {expense.receiptImage.startsWith('data:application/pdf') ? (
                            <span className="text-xl">📄</span>
                          ) : (
                            <img
                              src={expense.receiptImage}
                              alt="קבלה"
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition">
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
                          <span>שולם ע"י: {expense.paidBy}</span>
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
            )}
          </div>
        )}

        {/* 2. Withdrawals / Reimbursements Tab */}
        {historyTab === 'withdrawals' && (
          <div>
            {withdrawals.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                אין משיכות החזרים עד כה. כאשר חבר צוות מושך כסף מפייבוקס על קנייה שעשה, רשמו זאת כאן.
              </p>
            ) : (
              <div className="space-y-2">
                {withdrawals.map(w => (
                  <div
                    key={w.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base shrink-0">
                        💸
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800">{w.memberName || 'חבר צוות'} משך/ה החזר</h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span>{w.reason || 'החזר קניות'}</span>
                          <span>•</span>
                          <span>{w.date}</span>
                        </div>
                      </div>
                    </div>

                    <span className="font-black text-sm text-blue-700 shrink-0">
                      -{w.amount} ₪
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. Deposits Tab */}
        {historyTab === 'deposits' && (
          <div>
            {deposits.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 italic">
                אין הפקדות רשומות עד כה.
              </p>
            ) : (
              <div className="space-y-2">
                {deposits.map(d => {
                  const member = members.find(m => m.id === d.memberId);
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-base shrink-0">
                          💰
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-800">{member?.name || 'חבר צוות'}</h4>
                          <span className="text-[11px] text-slate-500">{d.date}</span>
                        </div>
                      </div>

                      <span className="font-black text-sm text-emerald-600 shrink-0">
                        +{d.amount} ₪
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>

      {/* 🖼️ VIEW RECEIPT IMAGE / PDF MODAL */}
      {viewingReceiptImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full space-y-3 relative shadow-2xl">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-slate-800">מסמך קבלה / חשבונית</h4>
              <button
                onClick={() => setViewingReceiptImage(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl">
              {viewingReceiptImage.startsWith('data:application/pdf') ? (
                <div className="p-6 text-center space-y-3 bg-slate-50 rounded-2xl border">
                  <span className="text-4xl block">📄</span>
                  <p className="text-xs font-bold text-slate-800">קובץ חשבונית PDF</p>
                  <a
                    href={viewingReceiptImage}
                    download="machsanei-hashuk-invoice.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700"
                  >
                    הורד / פתח קובץ PDF
                  </a>
                </div>
              ) : (
                <img src={viewingReceiptImage} alt="קבלה מלאה" className="w-full rounded-xl" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ➕ ADD EXPENSE MODAL */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-2.5">
              <h3 className="font-extrabold text-base text-slate-800">הזנת קבלה + צילום/קובץ</h3>
              <button
                onClick={() => setShowAddExpenseModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* ⚡ Quick Load from Machsanei HaShuk invoice button */}
            <button
              type="button"
              onClick={handleLoadLatestShukReceipt}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-2xl text-[11px] font-black border border-amber-300 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
            >
              <span>⚡</span>
              <span>טען את חשבונית מחסני השוק האחרונה (1,396.40 ₪)</span>
            </button>

            <form onSubmit={handleCreateExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">סכום הקבלה (₪):</label>
                <input
                  type="number"
                  step="0.1"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="350.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* 📸 Dual Upload Options: Camera OR File/PDF/Gallery */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">
                  צילום או העלאת קובץ קבלה (תמונה / PDF):
                </label>

                {receiptFile ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {receiptFile.isPdf ? (
                        <span className="text-2xl">📄</span>
                      ) : (
                        <img src={receiptFile.dataUrl} alt="קבלה" className="w-10 h-10 rounded-lg object-cover border" />
                      )}
                      <div>
                        <span className="text-xs font-bold text-emerald-800 block truncate max-w-[170px]">
                          {receiptFile.name || (receiptFile.isPdf ? 'קובץ PDF' : 'תמונת קבלה')}
                        </span>
                        <span className="text-[10px] text-emerald-600">הקובץ נטען בהצלחה ✓</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setReceiptFile(null); setReceiptImage(null); }}
                      className="text-xs text-rose-600 font-bold hover:underline p-1"
                    >
                      הסר
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Camera Button (forces camera on mobile) */}
                    <label className="border-2 border-dashed border-orange-300 bg-orange-50/60 hover:bg-orange-100/60 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition text-center active:scale-95">
                      <Camera className="w-5 h-5 text-orange-600" />
                      <span className="text-xs font-bold text-orange-800">צלם במצלמה</span>
                      <span className="text-[9px] text-slate-400">צילום ישיר מהטלפון</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleCameraCapture}
                        className="hidden"
                      />
                    </label>

                    {/* File / Gallery / PDF Button (allows selecting existing files/PDFs) */}
                    <label className="border-2 border-dashed border-blue-300 bg-blue-50/60 hover:bg-blue-100/60 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1 cursor-pointer transition text-center active:scale-95">
                      <ImageIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-bold text-blue-800">בחר קובץ / PDF</span>
                      <span className="text-[9px] text-slate-400">גלריה, מסמכים וקבצים</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
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
                  <option value="מור אלי">מור אלי (מהחשבונית)</option>
                  <option value="קופת מזומן משותפת">קופת מזומן משותפת</option>
                  <option value="קופת פייבוקס">קופת פייבוקס ישירה</option>
                  {members.map(m => (
                    <option key={m.id} value={m.name}>{m.name} (שילם מכספו הפרטי)</option>
                  ))}
                  <option value="custom">אחר (הקלד שם)...</option>
                </select>

                {expensePaidBy === 'custom' && (
                  <input
                    type="text"
                    value={customPayer}
                    onChange={(e) => setCustomPayer(e.target.value)}
                    placeholder="הקלד את שם המשלם..."
                    className="w-full mt-1.5 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">פירוט (אופציונלי):</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="למשל: 4 פלטות חזה עוף + פרגיות + שקיות צ'יפס..."
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

      {/* 💸 ADD WITHDRAWAL / REIMBURSEMENT MODAL */}
      {showAddWithdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-800">רישום משיכת החזר מפייבוקס</h3>
            <p className="text-xs text-slate-500">
              למי שהוציא/ה כסף מכיסו על קניות ומשך כעת החזר מקופת ה-PayBox לחשבונו
            </p>

            <form onSubmit={handleCreateWithdrawal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">מי משך/ה החזר?</label>
                <select
                  value={withdrawalMemberId}
                  onChange={(e) => setWithdrawalMemberId(e.target.value)}
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
                <label className="block text-xs font-bold text-slate-600 mb-1">סכום המשיכה (₪):</label>
                <input
                  type="number"
                  step="0.5"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  placeholder="280.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">עבור מה המשיכה?</label>
                <input
                  type="text"
                  value={withdrawalReason}
                  onChange={(e) => setWithdrawalReason(e.target.value)}
                  placeholder="למשל: החזר קנייה במחסני השוק"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddWithdrawalModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700"
                >
                  אשר משיכה
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}