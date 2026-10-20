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

import { 
  subscribeToKitchenData, 
  syncKitchenDataToCloud 
} from './services/firebaseSync';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('today');
  const [currentDayKey, setCurrentDayKey] = useState(getCurrentDayKey());

  // Cloud Config State
  const [firebaseConfig, setFirebaseConfig] = useState(() => getStored('shuk_firebase_config', null));
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const isRemoteUpdateRef = useRef(false);

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

  // Local storage caching
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
  useEffect(() => { setStored('shuk_firebase_config', firebaseConfig); }, [firebaseConfig]);

  // Subscribe to cloud updates whenever firebaseConfig is available
  useEffect(() => {
    if (!firebaseConfig) {
      setIsCloudConnected(false);
      return;
    }

    const unsubscribe = subscribeToKitchenData(firebaseConfig, (cloudState) => {
      isRemoteUpdateRef.current = true;
      setIsCloudConnected(true);

      if (cloudState.members) setMembers(cloudState.members);
      if (cloudState.pairs) setPairs(cloudState.pairs);
      if (cloudState.schedule) setSchedule(cloudState.schedule);
      if (cloudState.weeklyAttendance) setWeeklyAttendance(cloudState.weeklyAttendance);
      if (cloudState.dailyOverrides) setDailyOverrides(cloudState.dailyOverrides);
      if (cloudState.products) setProducts(cloudState.products);
      if (cloudState.expenses) setExpenses(cloudState.expenses);
      if (cloudState.deposits) setDeposits(cloudState.deposits);
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

  // Helper to broadcast state changes to Firebase
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
      dailyMenu,
      swapRequests,
      payboxLink,
      ...partialUpdates,
    };

    syncKitchenDataToCloud(firebaseConfig, fullState).then((success) => {
      setIsCloudConnected(success);
    });
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

  const handleToggleMemberPayment = (memberId, hasPaid) => {
    const updatedMembers = members.map(m => {
      if (m.id !== memberId) return m;
      return { ...m, paidThisMonth: hasPaid };
    });
    setMembers(updatedMembers);
    broadcastToCloud({ members: updatedMembers });
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

  // Handlers: Firebase Config
  const handleSaveFirebaseConfig = (config) => {
    setFirebaseConfig(config);
    if (!config) {
      setIsCloudConnected(false);
    }
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
    setFirebaseConfig(null);
    setIsCloudConnected(false);
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
        isCloudConnected={isCloudConnected}
        onOpenSettings={() => setActiveTab('settings')}
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
            firebaseConfig={firebaseConfig}
            onSaveFirebaseConfig={handleSaveFirebaseConfig}
            isCloudConnected={isCloudConnected}
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
