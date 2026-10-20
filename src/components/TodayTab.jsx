import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Circle, Phone, RefreshCw, 
  UtensilsCrossed, Scale, Flame, Users, AlertTriangle, 
  ChevronDown, Check, MessageCircle, AlertCircle, Layers, UserPlus, Package
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAYS_OF_WEEK, SIDE_DISH_CONFIG } from '../data/initialData';

export default function TodayTab({
  currentDayKey,
  members = [],
  schedule = {},
  dailyMenu = {},
  onUpdateDailyMenu,
  onToggleScheduleCompletion,
  onOpenSwapModal,
  swapRequests = [],
  dailyOverrides = {},
  onToggleDailyAttendance,
  weeklyAttendance = {},
  onOpenSettings,
}) {
  const currentDayObj = DAYS_OF_WEEK.find(d => d.key === currentDayKey) || DAYS_OF_WEEK[0];
  const daySchedule = schedule[currentDayKey] || { actualMembers: [], completed: false };
  
  // Find the assigned members for today
  const assignedMemberIds = daySchedule.actualMembers || [];
  const assignedCooks = members.filter(m => assignedMemberIds.includes(m.id));

  // Today's open swap requests
  const todayOpenSwaps = swapRequests.filter(s => s.status === 'open' && s.dayKey === currentDayKey);

  // Calculate today's attendees:
  const getIsAttendingToday = (memberId) => {
    if (dailyOverrides[memberId] !== undefined) {
      return dailyOverrides[memberId];
    }
    return !!weeklyAttendance[memberId]?.[currentDayKey];
  };

  const attendees = members.filter(m => getIsAttendingToday(m.id));
  const attendeeCount = attendees.length;

  // 1. Meat Plate / Tray calculation:
  const portionsPerPlate = dailyMenu.portionsPerPlate || 3;
  const rawPlatesNeeded = attendeeCount > 0 ? (attendeeCount / portionsPerPlate) : 0;
  const roundedPlates = Math.ceil(rawPlatesNeeded * 2) / 2;
  const approxKg = (roundedPlates * 0.9).toFixed(1);

  // 2. Side Dish Package calculation:
  // Allowed side dishes: 'chips' | 'rice' | 'couscous' | 'bulgur'
  const currentSideKey = dailyMenu.side || 'rice';
  const currentSideConfig = SIDE_DISH_CONFIG[currentSideKey] || SIDE_DISH_CONFIG.rice;
  const servingsPerPackage = dailyMenu.sideServingsPerPackage || currentSideConfig.servingsPerPackage || 4;
  const rawPackagesNeeded = attendeeCount > 0 ? (attendeeCount / servingsPerPackage) : 0;
  const roundedPackages = Math.ceil(rawPackagesNeeded * 2) / 2;

  // Check if any of today's cooks is absent
  const absentCooks = assignedCooks.filter(cook => !getIsAttendingToday(cook.id));

  const handleToggleCompleted = () => {
    const nextState = !daySchedule.completed;
    onToggleScheduleCompletion(currentDayKey, nextState);
    if (nextState) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#f97316', '#10b981', '#3b82f6', '#fbbf24']
      });
    }
  };

  const handleSelectSide = (sideId) => {
    const config = SIDE_DISH_CONFIG[sideId] || SIDE_DISH_CONFIG.rice;
    onUpdateDailyMenu({
      ...dailyMenu,
      side: sideId,
      sideServingsPerPackage: config.servingsPerPackage,
    });
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-3 sm:px-4 max-w-md mx-auto">

      {/* ⚠️ EMPTY MEMBERS BANNER */}
      {members.length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl font-bold">
            👥
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-800">הצוות מאופס ונקי!</h3>
            <p className="text-xs text-slate-600 mt-1">
              עדיין לא הוספתם חברי צוות. הוסיפו את שמות העובדים בטאב "הגדרות" כדי להתחיל.
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>הוסף חברי צוות עכשיו</span>
          </button>
        </div>
      )}

      {/* ⚠️ ABSENT COOK ALERT */}
      {absentCooks.length > 0 && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3.5 flex items-start gap-3 shadow-sm animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-black text-red-800">שים לב! תורן נעדר היום:</h4>
            <p className="text-xs text-red-700 mt-0.5">
              {absentCooks.map(c => c.name).join(', ')} מסומן כנעדר, אך רשום לתורנות בישול וכלים.
            </p>
            <button
              onClick={() => onOpenSwapModal(currentDayKey)}
              className="mt-2 bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover:bg-red-700 active:scale-95 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>מצא מחליף עכשיו</span>
            </button>
          </div>
        </div>
      )}

      {/* 🔔 OPEN SWAPS BANNER */}
      {todayOpenSwaps.length > 0 && (
        <div className="bg-amber-500 text-amber-950 p-3 rounded-2xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <div>
              <p className="font-black text-xs">בקשת חילוף פתוחה להיום!</p>
              <p className="text-[11px] text-amber-900 font-medium">מישהו מהצוות צריך עזרה בתורנות</p>
            </div>
          </div>
          <button
            onClick={() => onOpenSwapModal(currentDayKey)}
            className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow hover:bg-slate-800 active:scale-95 transition"
          >
            פרטים והחלפה
          </button>
        </div>
      )}

      {/* 👑 MAIN HERO CARD: TODAY'S COOKING & DISHWASHING PAIR */}
      <div className={`rounded-3xl p-5 shadow-lg border transition-all ${
        daySchedule.completed 
          ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 border-emerald-300' 
          : 'bg-gradient-to-br from-orange-50 via-white to-amber-50/50 border-orange-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-orange-600 text-white px-2.5 py-0.5 rounded-full tracking-wide">
              יום {currentDayObj.name}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {attendeeCount} סועדים היום
            </span>
          </div>

          {members.length > 0 && (
            <button
              onClick={() => onOpenSwapModal(currentDayKey)}
              className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-orange-200/80 shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>בקש חילוף</span>
            </button>
          )}
        </div>

        <div className="text-center my-2">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
            צמד התורנים להיום (בישול + כלים)
          </h2>
          {assignedCooks.length > 0 ? (
            <div className="mt-3 flex items-center justify-center gap-4">
              {assignedCooks.map((cook, idx) => (
                <div key={cook.id} className="flex flex-col items-center">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${cook.color || 'from-orange-400 to-amber-500'} text-white text-3xl flex items-center justify-center shadow-md border-2 border-white`}>
                      {cook.avatar || '👨‍🍳'}
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {idx === 0 ? 'תורן 1' : 'תורן 2'}
                    </span>
                  </div>
                  <span className="font-extrabold text-sm text-slate-800 mt-2">{cook.name}</span>
                  {cook.phone && (
                    <div className="flex items-center gap-1 mt-1">
                      <a
                        href={`tel:${cook.phone}`}
                        className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                        title="חייג"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                      <a
                        href={`https://wa.me/972${cook.phone.replace(/[^0-9]/g, '').slice(-9)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition"
                        title="וואטסאפ"
                      >
                        <MessageCircle className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-3 italic">
              טרם שובצו תורנים ליום זה
            </p>
          )}
        </div>

        {/* Completion status toggle */}
        <div className="mt-5 pt-4 border-t border-slate-200/60">
          <button
            onClick={handleToggleCompleted}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
              daySchedule.completed
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-white border-2 border-orange-300 text-orange-700 hover:bg-orange-50'
            }`}
          >
            {daySchedule.completed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>התורנות הושלמה: האוכל מוכן והכלים נקיים! ✨</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-orange-400" />
                <span>סמן כהושלם (בישול + שטיפת כלים בסיום)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 🍗 CARD: WHAT ARE WE COOKING & PORTION CALCULATORS */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">מה מבשלים היום?</h3>
              <p className="text-[11px] text-slate-500">חישוב כמויות לפי פלטות בשר וחבילות תוספת</p>
            </div>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full">
            {attendeeCount} סועדים
          </span>
        </div>

        {/* 1. MEAT SELECTION & TRAY CALCULATOR */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-700">1. מנה עיקרית (חזה עוף / פרגיות):</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'chicken_breast', label: 'חזה עוף (פלטות)', icon: '🍗' },
              { id: 'pargiyot', label: 'פרגיות (פלטות)', icon: '🥩' },
              { id: 'both', label: 'משולב (חצי-חצי)', icon: '🔥' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => onUpdateDailyMenu({ ...dailyMenu, protein: item.id })}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  dailyMenu.protein === item.id
                    ? 'border-orange-500 bg-orange-50/80 text-orange-800 font-extrabold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="text-lg">{item.icon}</div>
                <div className="text-xs mt-0.5 leading-tight">{item.label}</div>
              </button>
            ))}
          </div>

          {/* Meat Tray Result */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
              <Layers className="w-4 h-4 text-orange-600" />
              <span>פלטות בשר להפשרה:</span>
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-orange-700">{roundedPlates}</span>
              <span className="text-xs font-bold text-orange-700 mr-1">פלטות</span>
              <span className="text-[10px] text-slate-500 mr-1">(~{approxKg} ק"ג)</span>
            </div>
          </div>
        </div>

        {/* 2. SIDE DISH SELECTION & PACKAGE CALCULATOR */}
        <div className="space-y-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">2. תוספת בצד (צ'יפס, אורז, קוסקוס, בורגול):</label>
            <span className="text-[10px] text-slate-400">לפי חבילות / שקיות</span>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {Object.values(SIDE_DISH_CONFIG).map(side => (
              <button
                key={side.id}
                onClick={() => handleSelectSide(side.id)}
                className={`p-2 rounded-2xl border text-center transition-all ${
                  currentSideKey === side.id
                    ? 'border-slate-800 bg-slate-800 text-white font-extrabold shadow-sm scale-102'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 font-bold'
                }`}
              >
                <div className="text-xl">{side.icon}</div>
                <div className="text-xs mt-1 leading-tight">{side.label}</div>
              </button>
            ))}
          </div>

          {/* Side Dish Package Result Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-blue-600" />
                <span>כמה {currentSideConfig.unit} {currentSideConfig.label} להכין?</span>
              </span>

              {/* Adjust ratio stepper */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-500">סועדים לחבילה:</span>
                {[3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => onUpdateDailyMenu({ ...dailyMenu, sideServingsPerPackage: num })}
                    className={`text-[10px] w-5 h-5 rounded-md font-bold flex items-center justify-center ${
                      servingsPerPackage === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs text-slate-600">
                {attendeeCount} סועדים × יחס של {servingsPerPackage} סועדים ל{currentSideConfig.unit === 'שקיות' ? 'שקית' : 'חבילה'}
              </span>
              <div className="text-left">
                <span className="text-2xl font-black text-blue-700">{roundedPackages}</span>
                <span className="text-xs font-bold text-blue-700 mr-1">{currentSideConfig.unit}</span>
              </div>
            </div>
          </div>

          {/* Additional note / extra side */}
          <div>
            <input
              type="text"
              value={dailyMenu.extraNotes || ''}
              onChange={(e) => onUpdateDailyMenu({ ...dailyMenu, extraNotes: e.target.value })}
              placeholder="הוספת תוספת נוספת או הערות (למשל: סלט ירקות גדול, לא חריף...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* 👥 CARD: TODAY'S ATTENDANCE IN OFFICE */}
      {members.length > 0 && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800">נוכחות היום בעבודה</h3>
                <p className="text-[11px] text-slate-500">לחץ לסימון הגעה או דיווח חיסור</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600">
              {attendeeCount} / {members.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {members.map(member => {
              const isAttending = getIsAttendingToday(member.id);
              const isCookToday = assignedMemberIds.includes(member.id);

              return (
                <button
                  key={member.id}
                  onClick={() => onToggleDailyAttendance(member.id, !isAttending)}
                  className={`p-2.5 rounded-2xl border text-right flex items-center justify-between transition-all ${
                    isAttending
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{member.avatar || '👤'}</span>
                    <div className="truncate">
                      <p className={`text-xs truncate ${isAttending ? 'font-bold' : 'line-through text-slate-400'}`}>
                        {member.name}
                      </p>
                      {isCookToday && (
                        <span className="inline-block text-[9px] bg-orange-100 text-orange-800 font-bold px-1.5 py-0.2 rounded-md">
                          תורן היום 🍳
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isAttending ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
                  }`}>
                    {isAttending ? '✓' : '✕'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
