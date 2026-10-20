import React, { useState } from 'react';
import { X, RefreshCw, CheckCircle, AlertTriangle, UserCheck, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAYS_OF_WEEK } from '../data/initialData';

export default function SwapModal({
  isOpen,
  onClose,
  members = [],
  schedule = {},
  swapRequests = [],
  onRequestSwap,
  onAcceptSwap,
  defaultDayKey = 'sun',
}) {
  const [selectedDay, setSelectedDay] = useState(defaultDayKey);
  const [requestingMemberId, setRequestingMemberId] = useState('');
  const [reason, setReason] = useState('');
  const [acceptingMemberId, setAcceptingMemberId] = useState('');

  if (!isOpen) return null;

  // Active open swaps
  const openSwaps = swapRequests.filter(s => s.status === 'open');

  // Currently assigned members for the selected day
  const assignedForDay = schedule[selectedDay]?.actualMembers || [];
  const assignedMemberObjects = members.filter(m => assignedForDay.includes(m.id));

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!requestingMemberId) {
      alert('נא לבחור איזה חבר צוות מבקש חילוף');
      return;
    }

    onRequestSwap({
      dayKey: selectedDay,
      requestingMemberId,
      reason: reason.trim() || 'בקשת חילוף לבישול ושטיפת כלים',
    });

    setReason('');
    setRequestingMemberId('');
  };

  const handleAccept = (swapId) => {
    if (!acceptingMemberId) {
      alert('נא לבחור מי מחליף');
      return;
    }

    onAcceptSwap(swapId, acceptingMemberId);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    setAcceptingMemberId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-orange-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-800">בקשת חילוף תורנות</h2>
              <p className="text-xs text-slate-500">בישול + שטיפת כלים</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-6">

          {/* Section 1: Active Swap Requests */}
          {openSwaps.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-black text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                בקשות חילוף שממתינות לאישור ({openSwaps.length})
              </h3>
              
              <div className="space-y-2.5">
                {openSwaps.map(swap => {
                  const dayObj = DAYS_OF_WEEK.find(d => d.key === swap.dayKey);
                  const requester = members.find(m => m.id === swap.requestingMemberId);
                  
                  // Eligible replacements: everyone except requester and currently assigned pair
                  const eligibleReplacements = members.filter(m => m.id !== swap.requestingMemberId);

                  return (
                    <div key={swap.id} className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-sm space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{requester?.avatar || '👤'}</span>
                            <span className="font-bold text-slate-800 text-sm">{requester?.name}</span>
                            <span className="text-[11px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                              יום {dayObj?.name}
                            </span>
                          </div>
                          {swap.reason && (
                            <p className="text-xs text-slate-600 mt-1 italic pr-6">
                              "{swap.reason}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200/60 flex items-center gap-2">
                        <select
                          value={acceptingMemberId}
                          onChange={(e) => setAcceptingMemberId(e.target.value)}
                          className="flex-1 bg-white border border-amber-300 text-xs rounded-xl px-2.5 py-2 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">מי מחליף/ה?</option>
                          {eligibleReplacements.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleAccept(swap.id)}
                          className="bg-emerald-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm hover:bg-emerald-700 active:scale-95 transition flex items-center gap-1 shrink-0"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>אני אחליף!</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Create new swap request */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <span>➕</span>
              <span>פתיחת בקשת חילוף חדשה</span>
            </h3>

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  באיזה יום צריך חילוף?
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {DAYS_OF_WEEK.map(d => (
                    <button
                      type="button"
                      key={d.key}
                      onClick={() => {
                        setSelectedDay(d.key);
                        setRequestingMemberId('');
                      }}
                      className={`py-1.5 text-xs rounded-xl font-bold transition text-center ${
                        selectedDay === d.key
                          ? 'bg-orange-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  מי התורן שמבקש חילוף?
                </label>
                <select
                  value={requestingMemberId}
                  onChange={(e) => setRequestingMemberId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">בחר/י שם מהתורנים...</option>
                  {assignedMemberObjects.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.avatar} {m.name} (משובץ ביום זה)
                    </option>
                  ))}
                  <option disabled>──────────</option>
                  {members.map(m => (
                    <option key={`all-${m.id}`} value={m.id}>
                      {m.avatar} {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  סיבת הבקשה (אופציונלי):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="למשל: יום מחלה / לא מגיע / פגישה..."
                    className="w-full bg-white border border-slate-300 rounded-xl pr-8 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md hover:bg-orange-700 active:scale-98 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>פרסם בקשת חילוף לצוות</span>
              </button>
            </form>
          </div>

          <div className="text-[11px] text-slate-500 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100 flex items-start gap-1.5">
            <span className="text-amber-600 font-bold shrink-0">💡 טיפ:</span>
            <span>תורן שמחליף חבר צוות לוקח על עצמו גם את הכנת האוכל וגם את שטיפת הכלים בסיום הארוחה.</span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-600 px-4 py-1.5 rounded-lg hover:bg-slate-200"
          >
            סגור
          </button>
        </div>

      </div>
    </div>
  );
}
