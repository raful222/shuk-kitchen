import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TodayTab from './components/TodayTab';
import ScheduleTab from './components/ScheduleTab';
import GroceriesTab from './components/GroceriesTab';
import BudgetTab from './components/BudgetTab';
import SettingsTab from './components/SettingsTab';
import SwapModal from './components/SwapModal';

import {
  DEFAULT_FIREBASE_CONFIG,
  INITIAL_MEMBERS,
  INITIAL_PAIRS,
  INITIAL_SCHEDULE,
  INITIAL_ATTENDANCE,
  INITIAL_DAILY_OVERRIDE,
  INITIAL_SWAP_REQUESTS,
  INITIAL_PRODUCTS,
  INITIAL_EXPENSES,
  INITIAL_FUND_DEPOSITS,
  INITIAL_WITHDRAWALS,
  INITIAL_DAILY_MENU,
  INITIAL_PAYBOX_LINK,
  DAYS_OF_WEEK,
} from './data/initialData';

import { 
  getCurrentDayKey, 
  getStored, 
  setStored 
} from './utils/helpers';

import { 
  subscribeToKitchenData, 
  syncKitchenDataToCloud 
} from './services/firebaseSync';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('today');
  const [currentDayKey, setCurrentDayKey] = useState(getCurrentDayKey());
  const [scheduleWeekOffset, setScheduleWeekOffset] = useState(0);

  // Cloud Config State - Works silently in background
  const [firebaseConfig] = useState(DEFAULT_FIREBASE_CONFIG);
  const isRemoteUpdateRef = useRef(false);

  // Persistent States
  const [members, setMembers] = useState(() => getStored('shuk_members_clean', INITIAL_MEMBERS));
  const [pairs, setPairs] = useState(() => getStored('shuk_pairs_clean', INITIAL_PAIRS));
  const [schedule, setSchedule] = useState(() => getStored('shuk_schedule_clean', INITIAL_SCHEDULE));
  const [weeklyAttendance, setWeeklyAttendance] = useState(() => getStored('shuk_weekly_att_clean', INITIAL_ATTENDANCE));
  const [dailyOverrides, setDailyOverrides] = useState(() => getStored('shuk_daily_overrides_clean', INITIAL_DAILY_OVERRIDE));
  const [products, setProducts] = useState(() => getStored('shuk_products_clean', INITIAL_PRODUCTS));
  const [expenses, setExpenses] = useState(() => getStored('shuk_expenses_clean', INITIAL_EXPENSES));
  const [deposits, setDeposits] = useState(() => getStored('shuk_deposits_clean', INITIAL_FUND_DEPOSITS));
  const [withdrawals, setWithdrawals] = useState(() => getStored('shuk_withdrawals_clean', INITIAL_WITHDRAWALS));
  const [dailyMenu, setDailyMenu] = useState(() => getStored('shuk_daily_menu_clean', INITIAL_DAILY_MENU));
  const [swapRequests, setSwapRequests] = useState(() => getStored('shuk_swap_requests_clean', INITIAL_SWAP_REQUESTS));
  const [payboxLink, setPayboxLink] = useState(() => getStored('shuk_paybox_link', INITIAL_PAYBOX_LINK));

  // Swap modal state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapModalTargetDay, setSwapModalTargetDay] = useState(currentDayKey);

  // Local storage caching
  useEffect(() => { setStored('shuk_members_clean', members); }, [members]);
  useEffect(() => { setStored('shuk_pairs_clean', pairs); }, [pairs]);
  useEffect(() => { setStored('shuk_schedule_clean', schedule); }, [schedule]);
  useEffect(() => { setStored('shuk_weekly_att_clean', weeklyAttendance); }, [weeklyAttendance]);
  useEffect(() => { setStored('shuk_daily_overrides_clean', dailyOverrides); }, [dailyOverrides]);
  useEffect(() => { setStored('shuk_products_clean', products); }, [products]);
  useEffect(() => { setStored('shuk_expenses_clean', expenses); }, [expenses]);
  useEffect(() => { setStored('shuk_deposits_clean', deposits); }, [deposits]);
  useEffect(() => { setStored('shuk_withdrawals_clean', withdrawals); }, [withdrawals]);
  useEffect(() => { setStored('shuk_daily_menu_clean', dailyMenu); }, [dailyMenu]);
  useEffect(() => { setStored('shuk_swap_requests_clean', swapRequests); }, [swapRequests]);
  useEffect(() => { setStored('shuk_paybox_link', payboxLink); }, [payboxLink]);

  // Auto-reconcile deposits for members marked as paid (200 ₪ default per member)
  useEffect(() => {
    if (!members || members.length === 0) return;
    const paidMembers = members.filter(m => !!m.paidThisMonth);
    if (paidMembers.length === 0) return;

    let hasMissing = false;
    const currentDeposits = [...deposits];

    paidMembers.forEach(m => {
      const exists = currentDeposits.some(d => d.memberId === m.id && (d.isMonthlyDues || d.id === `dep-monthly-${m.id}`));
      if (!exists) {
        hasMissing = true;
        currentDeposits.unshift({
          id: `dep-monthly-${m.id}`,
          memberId: m.id,
          memberName: m.name,
          amount: 200,
          isMonthlyDues: true,
          date: new Date().toISOString().split('T')[0],
          note: 'תשלום חודשי לקופה (200 ₪)',
        });
      }
    });

    if (hasMissing) {
      setDeposits(currentDeposits);
      broadcastToCloud({ deposits: currentDeposits });
    }
  }, [members]);

  // Subscribe to cloud updates silently in the background
  useEffect(() => {
    if (!firebaseConfig) return;

    const unsubscribe = subscribeToKitchenData(firebaseConfig, (cloudState) => {
      isRemoteUpdateRef.current = true;

      if (Array.isArray(cloudState.members)) setMembers(cloudState.members);
      if (Array.isArray(cloudState.pairs)) setPairs(cloudState.pairs);
      if (cloudState.schedule) setSchedule(cloudState.schedule);
      if (cloudState.weeklyAttendance) setWeeklyAttendance(cloudState.weeklyAttendance);
      if (cloudState.dailyOverrides) setDailyOverrides(cloudState.dailyOverrides);
      if (cloudState.products) setProducts(cloudState.products);
      if (cloudState.expenses) setExpenses(cloudState.expenses);
      if (cloudState.deposits) setDeposits(cloudState.deposits);
      if (Array.isArray(cloudState.withdrawals)) setWithdrawals(cloudState.withdrawals);
      if (cloudState.dailyMenu) setDailyMenu(cloudState.dailyMenu);
      if (cloudState.swapRequests) setSwapRequests(cloudState.swapRequests);
      if (cloudState.payboxLink) setPayboxLink(cloudState.payboxLink);

      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 500);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [firebaseConfig]);

  // Helper to broadcast state changes to Firebase silently
  const broadcastToCloud = (partialUpdates = {}) => {
    if (!firebaseConfig || isRemoteUpdateRef.current) return;

    const fullState = {
      members,
      pairs,
      schedule,
      weeklyAttendance,
      dailyOverrides,
      products,
      expenses,
      deposits,
      withdrawals,
      dailyMenu,
      swapRequests,
      payboxLink,
      ...partialUpdates,
    };

    syncKitchenDataToCloud(firebaseConfig, fullState);
  };

  // Derived calculations
  const todayAttendees = members.filter(m => {
    if (dailyOverrides[m.id] !== undefined) return dailyOverrides[m.id];
    return !!weeklyAttendance[m.id]?.[currentDayKey];
  });
  const todayAttendeesCount = todayAttendees.length;

  const itemsToBuyCount = products.filter(p => (p.requiredStock - p.currentStock) > 0).length;
  const openSwapsCount = swapRequests.filter(s => s.status === 'open').length;

  // Handlers: Swap
  const handleOpenSwapModal = (dayKey = currentDayKey) => {
    setSwapModalTargetDay(dayKey);
    setIsSwapModalOpen(true);
  };

  const handleRequestSwap = ({ dayKey, requestingMemberId, reason }) => {
    const newSwap = {
      id: `swap-${Date.now()}`,
      dayKey,
      requestingMemberId,
      reason,
      status: 'open',
      acceptedByMemberId: null,
      createdAt: new Date().toISOString(),
    };
    const updatedSwaps = [newSwap, ...swapRequests];
    setSwapRequests(updatedSwaps);
    broadcastToCloud({ swapRequests: updatedSwaps });
  };

  const handleAcceptSwap = (swapId, acceptingMemberId) => {
    const updatedSwaps = swapRequests.map(s => {
      if (s.id !== swapId) return s;
      return { ...s, status: 'accepted', acceptedByMemberId };
    });
    setSwapRequests(updatedSwaps);

    const targetSwap = swapRequests.find(s => s.id === swapId);
    if (!targetSwap) {
      broadcastToCloud({ swapRequests: updatedSwaps });
      return;
    }

    const daySchedule = schedule[targetSwap.dayKey] || { actualMembers: [] };
    const currentList = daySchedule.actualMembers || [];
    const updatedList = currentList.map(id => id === targetSwap.requestingMemberId ? acceptingMemberId : id);
    if (!currentList.includes(targetSwap.requestingMemberId)) {
      updatedList.push(acceptingMemberId);
    }

    const updatedSchedule = {
      ...schedule,
      [targetSwap.dayKey]: {
        ...daySchedule,
        actualMembers: updatedList.slice(0, 2),
      }
    };

    setSchedule(updatedSchedule);
    broadcastToCloud({ swapRequests: updatedSwaps, schedule: updatedSchedule });
  };

  // Handlers: Schedule completion
  const handleToggleScheduleCompletion = (dayKey, isCompleted) => {
    const updatedSchedule = {
      ...schedule,
      [dayKey]: {
        ...(schedule[dayKey] || { actualMembers: [] }),
        completed: isCompleted,
      }
    };
    setSchedule(updatedSchedule);
    broadcastToCloud({ schedule: updatedSchedule });
  };

  // Handlers: Attendance
  const handleToggleMemberDay = (memberId, dayKey) => {
    const currentMemberDays = weeklyAttendance[memberId] || {};
    const updatedAttendance = {
      ...weeklyAttendance,
      [memberId]: {
        ...currentMemberDays,
        [dayKey]: !currentMemberDays[dayKey],
      }
    };
    setWeeklyAttendance(updatedAttendance);
    broadcastToCloud({ weeklyAttendance: updatedAttendance });
  };

  const handleToggleDailyAttendance = (memberId, isAttending) => {
    const updatedOverrides = {
      ...dailyOverrides,
      [memberId]: isAttending,
    };
    setDailyOverrides(updatedOverrides);
    broadcastToCloud({ dailyOverrides: updatedOverrides });
  };

  // Handlers: Pairs & Auto Schedule Generation
  const handleAddPair = (newPair) => {
    const updatedPairs = [...pairs, newPair];
    setPairs(updatedPairs);
    broadcastToCloud({ pairs: updatedPairs });
  };

  const handleRemovePair = (pairId) => {
    const updatedPairs = pairs.filter(p => p.id !== pairId);
    setPairs(updatedPairs);
    broadcastToCloud({ pairs: updatedPairs });
  };

  const handleAutoPairMembers = () => {
    if (members.length < 2) return;
    
    // Shuffle members
    const shuffled = [...members].sort(() => 0.5 - Math.random());
    const newPairs = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        newPairs.push({
          id: `pair-${Date.now()}-${i}`,
          name: `צמד ${newPairs.length + 1} (${shuffled[i].name} & ${shuffled[i + 1].name})`,
          memberIds: [shuffled[i].id, shuffled[i + 1].id],
        });
      } else if (newPairs.length > 0) {
        // If odd number of members, attach last member to the last pair
        newPairs[newPairs.length - 1].memberIds.push(shuffled[i].id);
        newPairs[newPairs.length - 1].name += ` & ${shuffled[i].name}`;
      }
    }

    setPairs(newPairs);
    broadcastToCloud({ pairs: newPairs });
  };

  // Generates sequential schedule from pairs:
  // Sunday -> Pair 1, Monday -> Pair 2, Tuesday -> Pair 3, Wednesday -> Pair 4, Thursday -> Pair 5 (or wraps around)
  const handleAutoGenerateSchedule = () => {
    if (pairs.length === 0) return;

    const newSchedule = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      const assignedPair = pairs[index % pairs.length];
      newSchedule[day.key] = {
        pairId: assignedPair.id,
        actualMembers: [...assignedPair.memberIds].slice(0, 2),
        completed: false,
      };
    });

    setSchedule(newSchedule);
    broadcastToCloud({ schedule: newSchedule });
  };

  // Handlers: Groceries
  const handleUpdateStock = (productId, newStock) => {
    const updatedProducts = products.map(p => {
      if (p.id !== productId) return p;
      return { ...p, currentStock: Math.max(0, newStock) };
    });
    setProducts(updatedProducts);
    broadcastToCloud({ products: updatedProducts });
  };

  const handleAddProduct = (newProduct) => {
    const updatedProducts = [newProduct, ...products];
    setProducts(updatedProducts);
    broadcastToCloud({ products: updatedProducts });
  };

  // Handlers: Budget
  const handleAddExpense = (newExpense) => {
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    broadcastToCloud({ expenses: updatedExpenses });
  };

  const handleAddDeposit = (newDeposit) => {
    const updatedDeposits = [newDeposit, ...deposits];
    setDeposits(updatedDeposits);
    broadcastToCloud({ deposits: updatedDeposits });
  };

  const handleAddWithdrawal = (newWithdrawal) => {
    const updatedWithdrawals = [newWithdrawal, ...withdrawals];
    setWithdrawals(updatedWithdrawals);
    broadcastToCloud({ withdrawals: updatedWithdrawals });
  };

  const handleToggleMemberPayment = (memberId, hasPaid) => {
    const updatedMembers = members.map(m => {
      if (m.id !== memberId) return m;
      return { ...m, paidThisMonth: hasPaid };
    });
    setMembers(updatedMembers);

    let updatedDeposits = [...deposits];
    if (hasPaid) {
      const exists = updatedDeposits.some(d => d.memberId === memberId && (d.isMonthlyDues || d.id === `dep-monthly-${memberId}`));
      if (!exists) {
        const member = members.find(m => m.id === memberId);
        const newDep = {
          id: `dep-monthly-${memberId}`,
          memberId,
          memberName: member?.name || 'חבר צוות',
          amount: 200,
          isMonthlyDues: true,
          date: new Date().toISOString().split('T')[0],
          note: 'תשלום חודשי לקופה (200 ₪)',
        };
        updatedDeposits = [newDep, ...updatedDeposits];
        setDeposits(updatedDeposits);
      }
    } else {
      updatedDeposits = updatedDeposits.filter(d => !(d.memberId === memberId && (d.isMonthlyDues || d.id === `dep-monthly-${memberId}`)));
      setDeposits(updatedDeposits);
    }

    broadcastToCloud({ members: updatedMembers, deposits: updatedDeposits });
  };

  const handleUpdateDailyMenu = (newMenu) => {
    setDailyMenu(newMenu);
    broadcastToCloud({ dailyMenu: newMenu });
  };

  // Handlers: Members
  const handleAddMember = (newMember) => {
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    const updatedAttendance = {
      ...weeklyAttendance,
      [newMember.id]: { sun: true, mon: false, tue: true, wed: true, thu: false }
    };
    setWeeklyAttendance(updatedAttendance);
    broadcastToCloud({ members: updatedMembers, weeklyAttendance: updatedAttendance });
  };

  const handleRemoveMember = (memberId) => {
    const updatedMembers = members.filter(m => m.id !== memberId);
    setMembers(updatedMembers);
    broadcastToCloud({ members: updatedMembers });
  };

  // Reset & Backup
  const handleResetData = () => {
    localStorage.clear();
    setMembers([]);
    setPairs([]);
    setSchedule(INITIAL_SCHEDULE);
    setWeeklyAttendance({});
    setDailyOverrides({});
    setProducts(INITIAL_PRODUCTS);
    setExpenses([]);
    setDeposits([]);
    setWithdrawals([]);
    setDailyMenu(INITIAL_DAILY_MENU);
    setSwapRequests([]);
    setPayboxLink(INITIAL_PAYBOX_LINK);
    broadcastToCloud({
      members: [],
      pairs: [],
      expenses: [],
      deposits: [],
      withdrawals: [],
      swapRequests: [],
      products: INITIAL_PRODUCTS,
    });
  };

  const handleExportData = () => {
    const backup = {
      members,
      pairs,
      schedule,
      weeklyAttendance,
      dailyOverrides,
      products,
      expenses,
      deposits,
      withdrawals,
      dailyMenu,
      swapRequests,
      payboxLink,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shuk-kitchen-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (data) => {
    if (Array.isArray(data.members)) setMembers(data.members);
    if (Array.isArray(data.pairs)) setPairs(data.pairs);
    if (data.schedule) setSchedule(data.schedule);
    if (data.weeklyAttendance) setWeeklyAttendance(data.weeklyAttendance);
    if (data.dailyOverrides) setDailyOverrides(data.dailyOverrides);
    if (data.products) setProducts(data.products);
    if (data.expenses) setExpenses(data.expenses);
    if (data.deposits) setDeposits(data.deposits);
    if (Array.isArray(data.withdrawals)) setWithdrawals(data.withdrawals);
    if (data.dailyMenu) setDailyMenu(data.dailyMenu);
    if (data.swapRequests) setSwapRequests(data.swapRequests);
    if (data.payboxLink) setPayboxLink(data.payboxLink);
    broadcastToCloud(data);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-16">
      
      {/* Top Header */}
      <Header
        todayAttendeesCount={todayAttendeesCount}
        activeSwapsCount={openSwapsCount}
        onOpenSwaps={() => handleOpenSwapModal(currentDayKey)}
        currentTab={activeTab}
      />

      {/* Main Tab Views */}
      <main className="flex-1">
        {activeTab === 'today' && (
          <TodayTab
            currentDayKey={currentDayKey}
            members={members}
            schedule={schedule}
            dailyMenu={dailyMenu}
            onUpdateDailyMenu={handleUpdateDailyMenu}
            onToggleScheduleCompletion={handleToggleScheduleCompletion}
            onOpenSwapModal={handleOpenSwapModal}
            swapRequests={swapRequests}
            dailyOverrides={dailyOverrides}
            onToggleDailyAttendance={handleToggleDailyAttendance}
            weeklyAttendance={weeklyAttendance}
            onOpenSettings={() => setActiveTab('settings')}
            onOpenSchedule={(offset = 0) => {
              setScheduleWeekOffset(offset);
              setActiveTab('schedule');
            }}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleTab
            members={members}
            schedule={schedule}
            weeklyAttendance={weeklyAttendance}
            onToggleMemberDay={handleToggleMemberDay}
            onOpenSwapModal={handleOpenSwapModal}
            pairs={pairs}
            onOpenSettings={() => setActiveTab('settings')}
            onAutoGenerateSchedule={handleAutoGenerateSchedule}
            weekOffset={scheduleWeekOffset}
            onChangeWeekOffset={setScheduleWeekOffset}
          />
        )}

        {activeTab === 'groceries' && (
          <GroceriesTab
            products={products}
            onUpdateStock={handleUpdateStock}
            onAddProduct={handleAddProduct}
            dailyMenu={dailyMenu}
            todayAttendeesCount={todayAttendeesCount}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetTab
            expenses={expenses}
            deposits={deposits}
            withdrawals={withdrawals}
            members={members}
            payboxLink={payboxLink}
            onAddExpense={handleAddExpense}
            onAddDeposit={handleAddDeposit}
            onAddWithdrawal={handleAddWithdrawal}
            onToggleMemberPayment={handleToggleMemberPayment}
            onUpdatePayboxLink={setPayboxLink}
            onOpenSettings={() => setActiveTab('settings')}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            members={members}
            pairs={pairs}
            payboxLink={payboxLink}
            onUpdatePayboxLink={setPayboxLink}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onAddPair={handleAddPair}
            onRemovePair={handleRemovePair}
            onAutoPairMembers={handleAutoPairMembers}
            onAutoGenerateSchedule={handleAutoGenerateSchedule}
            onResetData={handleResetData}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Shift Swap Modal */}
      <SwapModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        members={members}
        schedule={schedule}
        swapRequests={swapRequests}
        onRequestSwap={handleRequestSwap}
        onAcceptSwap={handleAcceptSwap}
        defaultDayKey={swapModalTargetDay}
      />

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        itemsToBuyCount={itemsToBuyCount}
      />
    </div>
  );
}
