import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import TodayTab from './components/TodayTab';
import ScheduleTab from './components/ScheduleTab';
import GroceriesTab from './components/GroceriesTab';
import BudgetTab from './components/BudgetTab';
import SettingsTab from './components/SettingsTab';
import SwapModal from './components/SwapModal';

import {
  INITIAL_MEMBERS,
  INITIAL_PAIRS,
  INITIAL_SCHEDULE,
  INITIAL_ATTENDANCE,
  INITIAL_DAILY_OVERRIDE,
  INITIAL_SWAP_REQUESTS,
  INITIAL_PRODUCTS,
  INITIAL_EXPENSES,
  INITIAL_FUND_DEPOSITS,
  INITIAL_DAILY_MENU,
  INITIAL_PAYBOX_LINK,
  DAYS_OF_WEEK,
} from './data/initialData';

import { 
  getCurrentDayKey, 
  getStored, 
  setStored 
} from './utils/helpers';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('today');
  const [currentDayKey, setCurrentDayKey] = useState(getCurrentDayKey());

  // Persistent States
  const [members, setMembers] = useState(() => getStored('shuk_members_v2', INITIAL_MEMBERS));
  const [pairs, setPairs] = useState(() => getStored('shuk_pairs_v2', INITIAL_PAIRS));
  const [schedule, setSchedule] = useState(() => getStored('shuk_schedule_v2', INITIAL_SCHEDULE));
  const [weeklyAttendance, setWeeklyAttendance] = useState(() => getStored('shuk_weekly_att_v2', INITIAL_ATTENDANCE));
  const [dailyOverrides, setDailyOverrides] = useState(() => getStored('shuk_daily_overrides_v2', INITIAL_DAILY_OVERRIDE));
  const [products, setProducts] = useState(() => getStored('shuk_products_v2', INITIAL_PRODUCTS));
  const [expenses, setExpenses] = useState(() => getStored('shuk_expenses_v2', INITIAL_EXPENSES));
  const [deposits, setDeposits] = useState(() => getStored('shuk_deposits_v2', INITIAL_FUND_DEPOSITS));
  const [dailyMenu, setDailyMenu] = useState(() => getStored('shuk_daily_menu_v2', INITIAL_DAILY_MENU));
  const [swapRequests, setSwapRequests] = useState(() => getStored('shuk_swap_requests_v2', INITIAL_SWAP_REQUESTS));
  const [payboxLink, setPayboxLink] = useState(() => getStored('shuk_paybox_link', INITIAL_PAYBOX_LINK));

  // Swap modal state
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapModalTargetDay, setSwapModalTargetDay] = useState(currentDayKey);

  // Sync to localStorage
  useEffect(() => { setStored('shuk_members_v2', members); }, [members]);
  useEffect(() => { setStored('shuk_pairs_v2', pairs); }, [pairs]);
  useEffect(() => { setStored('shuk_schedule_v2', schedule); }, [schedule]);
  useEffect(() => { setStored('shuk_weekly_att_v2', weeklyAttendance); }, [weeklyAttendance]);
  useEffect(() => { setStored('shuk_daily_overrides_v2', dailyOverrides); }, [dailyOverrides]);
  useEffect(() => { setStored('shuk_products_v2', products); }, [products]);
  useEffect(() => { setStored('shuk_expenses_v2', expenses); }, [expenses]);
  useEffect(() => { setStored('shuk_deposits_v2', deposits); }, [deposits]);
  useEffect(() => { setStored('shuk_daily_menu_v2', dailyMenu); }, [dailyMenu]);
  useEffect(() => { setStored('shuk_swap_requests_v2', swapRequests); }, [swapRequests]);
  useEffect(() => { setStored('shuk_paybox_link', payboxLink); }, [payboxLink]);

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
    setSwapRequests(prev => [newSwap, ...prev]);
  };

  const handleAcceptSwap = (swapId, acceptingMemberId) => {
    setSwapRequests(prev => prev.map(s => {
      if (s.id !== swapId) return s;
      return { ...s, status: 'accepted', acceptedByMemberId };
    }));

    const targetSwap = swapRequests.find(s => s.id === swapId);
    if (!targetSwap) return;

    setSchedule(prev => {
      const daySchedule = prev[targetSwap.dayKey] || { actualMembers: [] };
      const currentList = daySchedule.actualMembers || [];
      const updatedList = currentList.map(id => id === targetSwap.requestingMemberId ? acceptingMemberId : id);
      
      if (!currentList.includes(targetSwap.requestingMemberId)) {
        updatedList.push(acceptingMemberId);
      }

      return {
        ...prev,
        [targetSwap.dayKey]: {
          ...daySchedule,
          actualMembers: updatedList.slice(0, 2),
        }
      };
    });
  };

  // Handlers: Schedule completion
  const handleToggleScheduleCompletion = (dayKey, isCompleted) => {
    setSchedule(prev => ({
      ...prev,
      [dayKey]: {
        ...(prev[dayKey] || { actualMembers: [] }),
        completed: isCompleted,
      }
    }));
  };

  // Handlers: Attendance
  const handleToggleMemberDay = (memberId, dayKey) => {
    setWeeklyAttendance(prev => {
      const currentMemberDays = prev[memberId] || {};
      return {
        ...prev,
        [memberId]: {
          ...currentMemberDays,
          [dayKey]: !currentMemberDays[dayKey],
        }
      };
    });
  };

  const handleToggleDailyAttendance = (memberId, isAttending) => {
    setDailyOverrides(prev => ({
      ...prev,
      [memberId]: isAttending,
    }));
  };

  // Handlers: Groceries
  const handleUpdateStock = (productId, newStock) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      return { ...p, currentStock: Math.max(0, newStock) };
    }));
  };

  const handleAddProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  // Handlers: Budget
  const handleAddExpense = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleAddDeposit = (newDeposit) => {
    setDeposits(prev => [newDeposit, ...prev]);
  };

  const handleToggleMemberPayment = (memberId, hasPaid) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== memberId) return m;
      return { ...m, paidThisMonth: hasPaid };
    }));
  };

  // Handlers: Members
  const handleAddMember = (newMember) => {
    setMembers(prev => [...prev, newMember]);
    setWeeklyAttendance(prev => ({
      ...prev,
      [newMember.id]: { sun: true, mon: false, tue: true, wed: true, thu: false }
    }));
  };

  const handleRemoveMember = (memberId) => {
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  // Reset & Backup
  const handleResetData = () => {
    localStorage.clear();
    setMembers(INITIAL_MEMBERS);
    setPairs(INITIAL_PAIRS);
    setSchedule(INITIAL_SCHEDULE);
    setWeeklyAttendance(INITIAL_ATTENDANCE);
    setDailyOverrides({});
    setProducts(INITIAL_PRODUCTS);
    setExpenses(INITIAL_EXPENSES);
    setDeposits(INITIAL_FUND_DEPOSITS);
    setDailyMenu(INITIAL_DAILY_MENU);
    setSwapRequests(INITIAL_SWAP_REQUESTS);
    setPayboxLink(INITIAL_PAYBOX_LINK);
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
    if (data.members) setMembers(data.members);
    if (data.pairs) setPairs(data.pairs);
    if (data.schedule) setSchedule(data.schedule);
    if (data.weeklyAttendance) setWeeklyAttendance(data.weeklyAttendance);
    if (data.dailyOverrides) setDailyOverrides(data.dailyOverrides);
    if (data.products) setProducts(data.products);
    if (data.expenses) setExpenses(data.expenses);
    if (data.deposits) setDeposits(data.deposits);
    if (data.dailyMenu) setDailyMenu(data.dailyMenu);
    if (data.swapRequests) setSwapRequests(data.swapRequests);
    if (data.payboxLink) setPayboxLink(data.payboxLink);
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
            onUpdateDailyMenu={setDailyMenu}
            onToggleScheduleCompletion={handleToggleScheduleCompletion}
            onOpenSwapModal={handleOpenSwapModal}
            swapRequests={swapRequests}
            dailyOverrides={dailyOverrides}
            onToggleDailyAttendance={handleToggleDailyAttendance}
            weeklyAttendance={weeklyAttendance}
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
            members={members}
            payboxLink={payboxLink}
            onAddExpense={handleAddExpense}
            onAddDeposit={handleAddDeposit}
            onToggleMemberPayment={handleToggleMemberPayment}
            onUpdatePayboxLink={setPayboxLink}
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
