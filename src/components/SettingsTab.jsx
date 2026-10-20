import React, { useState } from 'react';
import { 
  Users, UserPlus, Trash2, Smartphone, Download, 
  Upload, RotateCcw, Globe, Check, Shield, Info, Edit2, Link as LinkIcon,
  Wand2, Shuffle, HeartHandshake, Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SettingsTab({
  members = [],
  pairs = [],
  payboxLink = 'https://payboxapp.page.link/shuk-kitchen',
  onUpdatePayboxLink,
  onAddMember,
  onRemoveMember,
  onAddPair,
  onRemovePair,
  onAutoPairMembers,
  onAutoGenerateSchedule,
  onResetData,
  onExportData,
  onImportData,
}) {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('👨‍🍳');
  const [payboxInput, setPayboxInput] = useState(payboxLink);
  const [payboxSaved, setPayboxSaved] = useState(false);

  // Pairing builder state
  const [pairMember1, setPairMember1] = useState('');
  const [pairMember2, setPairMember2] = useState('');

  const avatarOptions = ['👨‍🍳', '🍳', '🧑‍🍳', '🥗', '🍲', '🍽️', '🔪', '🍗', '🥩', '🥙'];

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    onAddMember({
      id: `m-${Date.now()}`,
      name: newMemberName.trim(),
      phone: newMemberPhone.trim() || '',
      avatar: newMemberAvatar,
      color: 'from-orange-500 to-amber-600',
      paidThisMonth: false,
    });

    setNewMemberName('');
    setNewMemberPhone('');
  };

  const handleCreatePair = (e) => {
    e.preventDefault();
    if (!pairMember1 || !pairMember2) {
      alert('נא לבחור שני חברי צוות לצמד');
      return;
    }
    if (pairMember1 === pairMember2) {
      alert('לא ניתן לבחור את אותו חבר צוות פעמיים בצמד');
      return;
    }

    const m1 = members.find(m => m.id === pairMember1);
    const m2 = members.find(m => m.id === pairMember2);

    const newPair = {
      id: `pair-${Date.now()}`,
      name: `צמד ${pairs.length + 1} (${m1?.name} & ${m2?.name})`,
      memberIds: [pairMember1, pairMember2],
    };

    onAddPair(newPair);
    setPairMember1('');
    setPairMember2('');
  };

  const handleAutoPairClick = () => {
    if (members.length < 2) {
      alert('צריך לפחות 2 חברי צוות כדי ליצור זוגות');
      return;
    }
    onAutoPairMembers();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleGenerateScheduleClick = () => {
    if (pairs.length === 0) {
      alert('אין זוגות עדיין! צרו זוגות קודם.');
      return;
    }
    onAutoGenerateSchedule();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    alert('הלו"ז השבועי חולל בהצלחה אחד אחרי השני! עברו לטאב "לו"ז" לצפייה.');
  };

  const handleSavePaybox = (e) => {
    e.preventDefault();
    onUpdatePayboxLink(payboxInput.trim());
    setPayboxSaved(true);
    setTimeout(() => setPayboxSaved(false), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        onImportData(json);
        alert('הנתונים יובאו בהצלחה!');
      } catch (err) {
        alert('שגיאה בקריאת הקובץ. וודא שזהו קובץ JSON תקין.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-20 pt-2 px-3 sm:px-4 max-w-md mx-auto">
      
      {/* 👥 1. TEAM MEMBERS MANAGEMENT */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-orange-600" />
            <span>חברי הצוות ({members.length})</span>
          </h3>
        </div>

        {members.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-2">
            עדיין לא הוספתם חברי צוות. הוסיפו את השם הראשון בטופס למטה:
          </p>
        ) : (
          <div className="space-y-2">
            {members.map(member => (
              <div
                key={member.id}
                className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{member.avatar}</span>
                  <div>
                    <h4 className="font-bold text-xs text-slate-800">{member.name}</h4>
                    {member.phone && <span className="text-[10px] text-slate-500">{member.phone}</span>}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 transition"
                  title="מחק חבר צוות"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Member Form */}
        <form onSubmit={handleAddMemberSubmit} className="pt-2 border-t border-slate-100 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 block">הוספת חבר צוות חדש:</span>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="שם מלא (למשל: דניאל כהן)"
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
            <input
              type="tel"
              value={newMemberPhone}
              onChange={(e) => setNewMemberPhone(e.target.value)}
              placeholder="טלפון נייד"
              className="w-28 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {avatarOptions.slice(0, 6).map(emoji => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setNewMemberAvatar(emoji)}
                  className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition ${
                    newMemberAvatar === emoji ? 'bg-orange-200 border border-orange-400 scale-110' : 'bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs hover:bg-orange-700 active:scale-95 transition flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>הוסף</span>
            </button>
          </div>
        </form>
      </div>

      {/* 🤝 2. PAIRING BUILDER & AUTOMATIC SCHEDULE GENERATION */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>הרכבת זוגות ולו"ז ברצף</span>
            </h3>
            <p className="text-[11px] text-slate-500">הצוותו לזוגות, והמערכת תשבץ אותם יום אחרי יום</p>
          </div>

          {members.length >= 2 && (
            <button
              onClick={handleAutoPairClick}
              className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-1.5 rounded-xl transition flex items-center gap-1"
            >
              <Shuffle className="w-3 h-3" />
              <span>חלק אוטומטית</span>
            </button>
          )}
        </div>

        {/* Existing pairs list */}
        {pairs.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-2">
            עדיין לא נוצרו זוגות. בחרו למטה שני חברים או לחצו "חלק אוטומטית".
          </p>
        ) : (
          <div className="space-y-2">
            {pairs.map((pair, idx) => {
              const pairMembers = members.filter(m => pair.memberIds.includes(m.id));
              return (
                <div
                  key={pair.id}
                  className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">
                        {pairMembers.map(m => m.name).join(' & ')}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {pairMembers.map(m => m.avatar).join(' ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemovePair(pair.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 transition"
                    title="מחק צמד"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}

            {/* Generate Schedule Button */}
            <button
              onClick={handleGenerateScheduleClick}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white font-black text-xs py-2.5 rounded-2xl shadow-md hover:from-orange-700 hover:to-amber-700 active:scale-98 transition flex items-center justify-center gap-1.5 mt-2"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-200" />
              <span>שבץ את הזוגות בלו"ז ברצף (אחד אחרי השני) 🪄</span>
            </button>
          </div>
        )}

        {/* Create new pair manually */}
        {members.length >= 2 && (
          <form onSubmit={handleCreatePair} className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">יצירת צמד באופן ידני:</span>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={pairMember1}
                onChange={(e) => setPairMember1(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800"
                required
              >
                <option value="">בחר/י חבר 1...</option>
                {members.map(m => (
                  <option key={`p1-${m.id}`} value={m.id}>{m.avatar} {m.name}</option>
                ))}
              </select>

              <select
                value={pairMember2}
                onChange={(e) => setPairMember2(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-800"
                required
              >
                <option value="">בחר/י חבר 2...</option>
                {members.filter(m => m.id !== pairMember1).map(m => (
                  <option key={`p2-${m.id}`} value={m.id}>{m.avatar} {m.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 rounded-xl transition flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>צור צמד זה</span>
            </button>
          </form>
        )}
      </div>

      {/* 💳 3. PAYBOX LINK SETTINGS */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4 text-blue-600" />
          <span>קישור לקבוצת ה-PayBox של הצוות</span>
        </h3>
        <p className="text-xs text-slate-500">
          הדביקו כאן את קישור ההצטרפות לקבוצת הפייבוקס לתשלום קופת האוכל:
        </p>

        <form onSubmit={handleSavePaybox} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={payboxInput}
              onChange={(e) => setPayboxInput(e.target.value)}
              placeholder="https://payboxapp.page.link/..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                payboxSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {payboxSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{payboxSaved ? 'נשמר ✓' : 'שמור'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 📲 4. PWA INSTALL ON PHONE BANNER */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-3xl p-4 shadow-md space-y-2">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-white" />
          <h2 className="font-extrabold text-sm">איך להפוך לאפליקציה בטלפון?</h2>
        </div>
        <div className="text-xs text-orange-50 space-y-1.5 leading-relaxed bg-black/15 p-3 rounded-2xl">
          <p>
            <strong>באייפון (Safari):</strong> לחצו על כפתור השיתוף (מרובע עם חץ למעלה) ⬅️ בחרו <strong>"הוסף למסך הבית" (Add to Home Screen)</strong>.
          </p>
          <p>
            <strong>באנדרואיד (Chrome):</strong> לחצו על 3 הנקודות למעלה ⬅️ בחרו <strong>"התקנת אפליקציה"</strong> או "הוסף למסך הבית".
          </p>
        </div>
      </div>

      {/* 💾 5. BACKUP & DATA MANAGEMENT */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>גיבוי ואיפוס נתונים</span>
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportData}
            className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>הורד גיבוי (JSON)</span>
          </button>

          <label className="p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>ייבא גיבוי</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <button
          onClick={() => {
            if (confirm('האם אתה בטוח שברצונך לאפס את כל הנתונים?')) {
              onResetData();
            }
          }}
          className="w-full text-center text-xs font-bold text-rose-600 hover:text-rose-700 py-1.5 transition"
        >
          איפוס כל הנתונים
        </button>
      </div>

    </div>
  );
}
