import React, { useState } from 'react';
import { 
  Calendar, CheckCircle, AlertTriangle, ShieldCheck, 
  Users, RefreshCw, Info, Check, UserCheck 
} from 'lucide-react';
import { DAYS_OF_WEEK } from '../data/initialData';
import { validateMemberAttendance } from '../utils/helpers';

export default function ScheduleTab({
  members = [],
  schedule = {},
  weeklyAttendance = {},
  onToggleMemberDay,
  onOpenSwapModal,
  pairs = [],
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'needs_fix'

  // Calculate total attendees for each day of the week
  const dayTotals = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.key] = members.filter(m => !!weeklyAttendance[m.id]?.[day.key]).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4 pb-20 pt-2 px-3 sm:px-4 max-w-md mx-auto">
      
      {/* 📌 RULES BANNER */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-4 shadow-md space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <h2 className="font-extrabold text-sm">חוקי הנוכחות בצוות</h2>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          כל עובד מגיע <span className="font-bold text-amber-300">3 ימים בשבוע</span>:
          ימי <span className="underline font-bold">ראשון ושלישי הם חובה</span>, ויום נוסף לבחירה (שני, רביעי או חמישי).
        </p>

        <div className="grid grid-cols-5 gap-1 pt-1 text-center text-[10px]">
          {DAYS_OF_WEEK.map(d => (
            <div key={d.key} className={`py-1 rounded-lg ${d.mandatory ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40' : 'bg-white/10 text-blue-200'}`}>
              <div>{d.name}</div>
              <div className="text-[9px] mt-0.5">{d.mandatory ? 'חובה' : 'בחירה'}</div>
              <div className="font-black text-white mt-0.5">{dayTotals[d.key] || 0} סועדים</div>
            </div>
          ))}
        </div>
      </div>

      {/* 📅 WEEKLY SHIFTS (SUNDAY - THURSDAY) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span>תורנויות השבוע (בישול + כלים)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">זוגות קבועים</span>
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
                  <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black ${
                    day.mandatory 
                      ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
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
                          : 'טרם שובץ זוג'}
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

                <button
                  onClick={() => onOpenSwapModal(day.key)}
                  className="bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 p-2 rounded-xl text-slate-600 hover:text-orange-700 transition active:scale-95 shrink-0"
                  title="בקש חילוף ליום זה"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 👥 MEMBER ATTENDANCE MATRIX & RULE CHECKER */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>שיבוץ נוכחות אישי</span>
            </h3>
            <p className="text-[11px] text-slate-500">לחץ על יום כדי להדליק/לכבות נוכחות</p>
          </div>

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
              דורש תיקון
            </button>
          </div>
        </div>

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
                          className={`py-1.5 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center relative ${
                            isSelected
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span>{day.short}׳</span>
                          {day.mandatory && (
                            <span className={`text-[8px] font-black ${isSelected ? 'text-orange-200' : 'text-orange-600'}`}>
                              חובה
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
}
