import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, Circle, Phone, RefreshCw, 
  UtensilsCrossed, Scale, Flame, Users, AlertTriangle, 
  ChevronDown, Check, MessageCircle, AlertCircle, Layers, UserPlus, Package,
  BookOpen, Clock, ChefHat, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAYS_OF_WEEK, SIDE_DISH_CONFIG } from '../data/initialData';
import { getHebrewDateString, getWorkWeekDates } from '../utils/helpers';

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
  onOpenSchedule,
}) {
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [recipeTab, setRecipeTab] = useState(dailyMenu.side || 'rice');

  const currentDayObj = DAYS_OF_WEEK.find(d => d.key === currentDayKey) || DAYS_OF_WEEK[0];
  const daySchedule = schedule[currentDayKey] || { actualMembers: [], completed: false };
  const weekDates = getWorkWeekDates();
  const todayDateFormatted = weekDates[currentDayKey]?.dateFormatted || '';
  
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

  // 4-Person threshold rule: duty ONLY takes place when strictly > 4 attendees (>= 5)
  const isDutyActive = attendeeCount > 4;

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

  // Exact rice & grains cup calculations:
  // User Rule: default for 7 people = 2.5 cups of rice. Ratio 1:2 for boiling water.
  const riceCupsRaw = attendeeCount > 0 ? (attendeeCount * (2.5 / 7)) : 0;
  const displayRiceCups = Math.max(0.5, Math.round(riceCupsRaw * 2) / 2);
  const displayWaterCups = (displayRiceCups * 2).toFixed(1);

  // Check if any of today's cooks is absent (only relevant if duty is active)
  const absentCooks = isDutyActive ? assignedCooks.filter(cook => !getIsAttendingToday(cook.id)) : [];

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
    setRecipeTab(sideId);
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

      {/* 🏖️ NO DUTY BANNER (IF ATTENDEES <= 4) */}
      {members.length > 0 && !isDutyActive && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 flex items-start gap-3 shadow-xs">
          <span className="text-2xl shrink-0">🏖️</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-amber-950">אין תורנות בישול וכלים היום!</h4>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-black px-2 py-0.5 rounded-full">
                {attendeeCount} סועדים
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              לפי הכלל, תורנות בישול ושטיפת כלים מתקיימת רק בימים שבהם יש <strong>מעל 4 אנשים</strong> (5 סועדים ומעלה).
            </p>
          </div>
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
      {isDutyActive && todayOpenSwaps.length > 0 && (
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
          : !isDutyActive
            ? 'bg-gradient-to-br from-slate-50 via-amber-50/40 to-slate-100 border-slate-200'
            : 'bg-gradient-to-br from-orange-50 via-white to-amber-50/50 border-orange-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black bg-orange-600 text-white px-2.5 py-0.5 rounded-full tracking-wide">
              יום {currentDayObj.name} {todayDateFormatted && `• ${todayDateFormatted}`}
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isDutyActive 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-amber-100 text-amber-800'
            }`}>
              {attendeeCount} סועדים {isDutyActive ? '(תורנות פעילה)' : '(פטור מתורנות)'}
            </span>
          </div>

          {isDutyActive && members.length > 0 && (
            <button
              onClick={() => onOpenSwapModal(currentDayKey)}
              className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-orange-200/80 shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>בקש חילוף</span>
            </button>
          )}
        </div>

        {isDutyActive ? (
          <>
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
          </>
        ) : (
          <div className="py-4 text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
              🏖️
            </div>
            <h2 className="text-sm font-black text-slate-800">
              פטור מתורנות להיום
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              {assignedCooks.length > 0 
                ? `הזוג המשובץ בלו"ז (${assignedCooks.map(c => c.name).join(' & ')}) פטור מתורנות בישול וכלים עקב נוכחות של 4 סועדים ומטה.` 
                : 'אין צורך בתורנות בישול וכלים היום (נוכחות מתחת ל-5 אנשים).'}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                ✓ פטור מבישול ושטיפת כלים
              </span>
            </div>
          </div>
        )}
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

          {/* 🍚 EXACT CUPS & MICROWAVE TIMES CALLOUT (ACCORDING TO USER'S EXACT RULES) */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-amber-950 flex items-center gap-1.5">
                <span>{currentSideConfig.icon}</span>
                <span>
                  {currentSideKey === 'rice' && 'כמויות מדויקות לאורז (בסיר / מיקרו):'}
                  {currentSideKey === 'bulgur' && 'כמויות מדויקות לבורגול במיקרו:'}
                  {currentSideKey === 'couscous' && 'הכנה מהירה לקוסקוס (ללא בישול!):'}
                  {currentSideKey === 'chips' && 'הוראות אפייה לצ\'יפס סטייק:'}
                </span>
              </span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                ⏱️ {currentSideConfig.cookMethod}
              </span>
            </div>

            {currentSideKey === 'rice' && (
              <div className="text-xs text-amber-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>כמות אורז מומלצת להיום ({attendeeCount} סועדים):</span>
                  <span className="text-orange-700 text-sm">{displayRiceCups} כוסות אורז</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>מים רותחים (יחס 1 ל-2):</span>
                  <span className="text-blue-700 text-sm">{displayWaterCups} כוסות מים</span>
                </div>
                <p className="text-[11px] text-amber-800 pt-1">
                  🧂 <strong>תיבול:</strong> קצת שמן, מלח, פלפל שחור (מרק עוף – לא חייב / אופציונלי).
                </p>
                <p className="text-[11px] text-slate-500">
                  * מחושב לפי ברירת המחדל המדויקת שלכם: 2.5 כוסות אורז ל-7 אנשים.
                </p>
              </div>
            )}

            {currentSideKey === 'bulgur' && (
              <div className="text-xs text-amber-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>כמות בורגול להיום ({attendeeCount} סועדים):</span>
                  <span className="text-amber-800 text-sm">{displayRiceCups} כוסות בורגול</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>מים רותחים (יחס 1 ל-2):</span>
                  <span className="text-blue-700 text-sm">{displayWaterCups} כוסות מים</span>
                </div>
                <p className="text-[11px] text-amber-800 pt-1">
                  🧂 <strong>תיבול:</strong> שמן ומלח בנדיבות • <strong>20 דקות במיקרוגל</strong> בכלי מתאים מכוסה חלקית.
                </p>
              </div>
            )}

            {currentSideKey === 'couscous' && (
              <div className="text-xs text-amber-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>שקיות קוסקוס (350 גרם):</span>
                  <span className="text-amber-800 text-sm">{roundedPackages} שקיות</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>מים רותחים:</span>
                  <span className="text-blue-700 text-sm">{roundedPackages * 2} כוסות מים</span>
                </div>
                <p className="text-[11px] text-amber-800 pt-1">
                  🥣 <strong>מתכון פשוט:</strong> מערבבים קוסקוס יבש עם 2-3 כפות שמן, מלח וכורכום, שופכים מים רותחים, מכסים 6 דקות ומאווררים במזלג!
                </p>
              </div>
            )}

            {currentSideKey === 'chips' && (
              <div className="text-xs text-amber-900 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span>שקיות צ'יפס (1.5 ק"ג עבה):</span>
                  <span className="text-orange-700 text-sm">{roundedPackages} שקיות</span>
                </div>
                <p className="text-[11px] text-amber-800 pt-1">
                  🍟 <strong>הכנה:</strong> 20-25 דקות בתנור / נינג'ה על 200 מעלות עם מעט שמן ומלח.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setRecipeTab(currentSideKey); setShowRecipeModal(true); }}
              className="w-full mt-1.5 py-1.5 px-2.5 bg-white hover:bg-amber-100 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span>פתח מתכון מלא והוראות הכנה צעד-אחר-צעד 📖</span>
            </button>
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

      {/* 🔮 PEEK TO NEXT WEEK CARD (SUNDAY AFTER THAT) */}
      {onOpenSchedule && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-3xl p-4 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              🔮
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-slate-900">
                רוצים לדעת מי התורן ביום ראשון הבא?
              </h4>
              <p className="text-[11px] text-slate-500">
                הלו"ז של שבוע הבא פתוח לצפייה מראש כבר עכשיו
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenSchedule(1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-xs transition active:scale-95 shrink-0 flex items-center gap-1"
          >
            <span>לו"ז שבוע הבא</span>
            <span>➔</span>
          </button>
        </div>
      )}

      {/* 📖 RECIPES & COOKING INSTRUCTIONS MODAL */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                  📖
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">מתכונים והוראות הכנה</h3>
                  <p className="text-[11px] text-slate-500">מיקרוגל, סיר וכמויות מחושבות להיום</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipe Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl text-[11px] font-bold">
              {Object.values(SIDE_DISH_CONFIG).map(s => (
                <button
                  key={s.id}
                  onClick={() => setRecipeTab(s.id)}
                  className={`py-1.5 px-1 rounded-xl text-center transition ${
                    recipeTab === s.id
                      ? 'bg-white text-slate-900 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="text-base">{s.icon}</div>
                  <div className="text-[10px] mt-0.5">{s.label}</div>
                </button>
              ))}
            </div>

            {/* Active Recipe Content */}
            {(() => {
              const activeConfig = SIDE_DISH_CONFIG[recipeTab] || SIDE_DISH_CONFIG.rice;
              return (
                <div className="space-y-3 pt-1">
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-orange-900 flex items-center gap-1.5">
                        <span>{activeConfig.icon}</span>
                        <span>{activeConfig.label}</span>
                      </span>
                      <span className="text-[10px] bg-orange-200/80 text-orange-900 font-bold px-2 py-0.5 rounded-full">
                        ⏱️ {activeConfig.cookMethod}
                      </span>
                    </div>
                    <p className="text-[11px] text-orange-800">
                      {activeConfig.desc}
                    </p>
                  </div>

                  {/* Calculated ingredients for today */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
                    <h4 className="font-extrabold text-slate-800 flex items-center gap-1">
                      <span>📏</span>
                      <span>כמויות מדויקות להיום ({attendeeCount} סועדים):</span>
                    </h4>
                    {recipeTab === 'rice' && (
                      <div className="space-y-1 text-slate-700 text-xs">
                        <div className="flex items-center justify-between font-bold text-orange-700">
                          <span>אורז:</span>
                          <span>{displayRiceCups} כוסות (מפתח 2.5 כוסות ל-7 איש)</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-blue-700">
                          <span>מים רותחים (יחס 1:2):</span>
                          <span>{displayWaterCups} כוסות מים</span>
                        </div>
                      </div>
                    )}
                    {recipeTab === 'bulgur' && (
                      <div className="space-y-1 text-slate-700 text-xs">
                        <div className="flex items-center justify-between font-bold text-amber-800">
                          <span>בורגול:</span>
                          <span>{displayRiceCups} כוסות</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-blue-700">
                          <span>מים רותחים (יחס 1:2):</span>
                          <span>{displayWaterCups} כוסות מים</span>
                        </div>
                      </div>
                    )}
                    {recipeTab === 'couscous' && (
                      <div className="space-y-1 text-slate-700 text-xs">
                        <div className="flex items-center justify-between font-bold text-amber-800">
                          <span>קוסקוס מהיר:</span>
                          <span>{roundedPackages} שקיות (350 גרם כ"א)</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-blue-700">
                          <span>מים רותחים:</span>
                          <span>{roundedPackages * 2} כוסות מים רותחים</span>
                        </div>
                      </div>
                    )}
                    {recipeTab === 'chips' && (
                      <div className="space-y-1 text-slate-700 text-xs">
                        <div className="flex items-center justify-between font-bold text-orange-700">
                          <span>צ'יפס סטייק עבה:</span>
                          <span>{roundedPackages} שקיות (1.5 ק"ג כ"א)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seasoning */}
                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl text-xs space-y-1">
                    <span className="font-extrabold text-amber-950 block">🧂 תיבול מומלץ:</span>
                    <p className="text-amber-900 text-xs leading-relaxed">
                      {activeConfig.seasoning}
                    </p>
                  </div>

                  {/* Step by step instructions */}
                  <div className="space-y-2">
                    <span className="font-extrabold text-xs text-slate-800 block">📝 הוראות הכנה מהירות:</span>
                    <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                      {activeConfig.instructions.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowRecipeModal(false)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition"
              >
                הבנתי, סגור מתכון 👨‍🍳
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
