import React, { useState } from 'react';
import { 
  Calendar, CheckCircle, AlertTriangle, ShieldCheck, 
  Users, RefreshCw, Info, Check, UserCheck, UserPlus,
  Wand2, Shuffle, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAYS_OF_WEEK } from '../data/initialData';
import { validateMemberAttendance } from '../utils/helpers';

export default function ScheduleTab({
  members = [],
  schedule = {},
  weeklyAttendance = {},
  onToggleMemberDay,
  onOpenSwapModal,
  pairs = [],
  onOpenSettings,
  onAutoGenerateSchedule,
}) {
  const [filterMode, setFilterMode] = useState('all');

  // Calculate total attendees for each day of the week
  const dayTotals = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.key] = members.filter(m => !!weeklyAttendance[m.id]?.[day.key]).length;
    return acc;
  }, {});

  const handleGenerateClick = () => {
    if (pairs.length === 0) {
      alert('טרם יצרתם זוגות! עברו להגדרות או צרו זוגות קודם כדי לייצר את הלו"ז.');
      onOpenSettings();
      return;
    }

    onAutoGenerateSchedule();
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ea580c', '#f97316', '#3b82f6', '#10b981']
    });
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-3 sm:px-4 max-w-md mx-auto">
      
      {/* 📌 FLEXIBLE ATTENDANCE RULES BANNER */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-4 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h2 className="font-extrabold text-sm">נוכחות שבועית גמישה</h2>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">3 ימים בשבוע</span>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          מגיעים כ-3 ימים בשבוע (ראשון ושלישי הם ימי הליבה, אך אפשר לסמן חיסור במידת הצורך).
        </p>

        <div className="grid grid-cols-5 gap-1 pt-1 text-center text-[10px]">
          {DAYS_OF_WEEK.map(d => (
            <div key={d.key} className="py-1 rounded-lg bg-white/10 text-blue-200">
              <div className="font-bold text-white">{d.name}</div>
              <div className="font-black text-amber-300 mt-0.5">{dayTotals[d.key] || 0} סועדים</div>
            </div>
          ))}
        </div>
      </div>

      {/* 🪄 AUTO-SCHEDULE GENERATOR BUTTON */}
      <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-4 text-white shadow-md flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 font-black text-sm">
            <Wand2 className="w-4 h-4 text-amber-200" />
            <span>מחולל לו"ז לפי הזוגות</span>
          </div>
          <p className="text-[11px] text-orange-100 mt-0.5">
            {pairs.length > 0 
              ? `יש ${pairs.length} זוגות מוכנים. שבץ אותם ברצף!` 
              : 'הגדר זוגות תחילה, ואז חולל ברצף'}
          </p>
        </div>

        <button
          onClick={handleGenerateClick}
          className="bg-white text-orange-700 hover:bg-orange-50 font-black text-xs px-3.5 py-2.5 rounded-2xl shadow-md transition active:scale-95 shrink-0 flex items-center gap-1"
        >
          <span>חולל לו"ז ברצף 🪄</span>
        </button>
      </div>

      {/* 📅 WEEKLY SHIFTS (SUNDAY - THURSDAY) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>תורנויות השבוע (בישול + כלים)</span>
          </h3>
          <button
            onClick={onOpenSettings}
            className="text-xs font-bold text-orange-600 hover:text-orange-700"
          >
            ערוך זוגות ⚙️
          </button>
        </div>

        <div className="space-y-2.5">
          {DAYS_OF_WEEK.map(day => {
            const dayShift = schedule[day.key] || { actualMembers: [], completed: false };
            const assignedMembers = members.filter(m => (dayShift.actualMembers || []).includes(m.id));
            const countForDay = dayTotals[day.key] || 0;

            return (
              <div 
                key={day.key}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex flex-col items-center justify-center font-black">
                    <span className="text-xs leading-none">{day.name}</span>
                    <span className="text-[9px] font-bold text-slate-500 mt-0.5">
                      {countForDay} איש
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-800">
                        {assignedMembers.length > 0 
                          ? assignedMembers.map(m => m.name).join(' & ') 
                          : 'טרם שובץ זוג (לחץ "חולל לו"ז")'}
                      </span>
                      {dayShift.completed && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                          הושלם ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <span>{assignedMembers.map(m => m.avatar).join(' ')}</span>
                      <span>אחראים על בישול וסיום שטיפת כלים</span>
                    </div>
                  </div>
                </div>

                {assignedMembers.length > 0 && (
                  <button
                    onClick={() => onOpenSwapModal(day.key)}
                    className="bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 p-2 rounded-xl text-slate-600 hover:text-orange-700 transition active:scale-95 shrink-0"
                    title="בקש חילוף ליום זה"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 👥 MEMBER ATTENDANCE MATRIX & FLEXIBLE ATTENDANCE */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>ימי הגעה ודיווח חיסור</span>
            </h3>
            <p className="text-[11px] text-slate-500">לחץ לסימון הגעה או כיבוי במידה ולא מגיעים</p>
          </div>

          {members.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition ${
                  filterMode === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                הכל
              </button>
              <button
                onClick={() => setFilterMode('needs_fix')}
                className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition ${
                  filterMode === 'needs_fix'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                חריגות
              </button>
            </div>
          )}
        </div>

        {members.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-xs text-slate-500">עדיין לא הוגדרו חברי צוות במערכת.</p>
            <button
              onClick={onOpenSettings}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>הוסף חברי צוות בהגדרות</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {members
              .filter(member => {
                if (filterMode === 'needs_fix') {
                  const validation = validateMemberAttendance(weeklyAttendance[member.id] || {});
                  return !validation.isValid;
                }
                return true;
              })
              .map(member => {
                const memberDays = weeklyAttendance[member.id] || {};
                const validation = validateMemberAttendance(memberDays);

                const badgeColors = {
                  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  warning: 'bg-amber-100 text-amber-800 border-amber-200',
                  error: 'bg-rose-100 text-rose-800 border-rose-200',
                }[validation.statusType];

                return (
                  <div key={member.id} className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{member.avatar || '👤'}</span>
                        <span className="font-extrabold text-xs text-slate-800">{member.name}</span>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeColors}`}>
                        {validation.statusText}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5">
                      {DAYS_OF_WEEK.map(day => {
                        const isSelected = !!memberDays[day.key];

                        return (
                          <button
                            key={day.key}
                            onClick={() => onToggleMemberDay(member.id, day.key)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <span>יום {day.short}׳</span>
                            <span className={`text-[8px] mt-0.5 ${isSelected ? 'text-orange-200 font-bold' : 'text-slate-400'}`}>
                              {isSelected ? 'מגיע ✓' : 'נעדר'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

    </div>
  );
}
