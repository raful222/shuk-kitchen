import React, { useState } from 'react';
import { 
  Users, UserPlus, Trash2, Smartphone, Download, 
  Upload, RotateCcw, Globe, Check, Shield, Info, Edit2, Link as LinkIcon,
  Database, Cloud, CloudCheck, Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';

export default function SettingsTab({
  members = [],
  pairs = [],
  payboxLink = 'https://payboxapp.page.link/shuk-kitchen',
  onUpdatePayboxLink,
  firebaseConfig = null,
  onSaveFirebaseConfig,
  isCloudConnected = false,
  onAddMember,
  onRemoveMember,
  onResetData,
  onExportData,
  onImportData,
}) {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberAvatar, setNewMemberAvatar] = useState('👨‍🍳');
  const [payboxInput, setPayboxInput] = useState(payboxLink);
  const [payboxSaved, setPayboxSaved] = useState(false);

  // Firebase Config State
  const [firebaseInput, setFirebaseInput] = useState(
    firebaseConfig ? JSON.stringify(firebaseConfig, null, 2) : ''
  );
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [firebaseStatusMsg, setFirebaseStatusMsg] = useState('');

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

  const handleSavePaybox = (e) => {
    e.preventDefault();
    onUpdatePayboxLink(payboxInput.trim());
    setPayboxSaved(true);
    setTimeout(() => setPayboxSaved(false), 2000);
  };

  const handleSaveFirebase = (e) => {
    e.preventDefault();
    try {
      if (!firebaseInput.trim()) {
        onSaveFirebaseConfig(null);
        setFirebaseStatusMsg('ההגדרות נמחקו - עבודה במצב מקומי.');
        return;
      }

      // Try parsing JSON or JS object
      let parsed;
      try {
        parsed = JSON.parse(firebaseInput);
      } catch {
        // Handle case where user pastes JS object without quotes around keys
        const formatted = firebaseInput
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
          .replace(/'/g, '"');
        parsed = JSON.parse(formatted);
      }

      if (!parsed.projectId) {
        throw new Error('חסר projectId בהגדרות');
      }

      onSaveFirebaseConfig(parsed);
      setFirebaseStatusMsg('הגדרות Firebase נשמרו בהצלחה! מתחבר לסנכרון חי...');
      setTimeout(() => setFirebaseStatusMsg(''), 4000);
    } catch (err) {
      alert('פורמט ההגדרות אינו תקין. נא להדביק את ה-firebaseConfig המלא (JSON תקין).');
    }
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
      
      {/* ☁️ CLOUD DATABASE (FIREBASE REAL-TIME SYNC) */}
      <div className={`rounded-3xl p-5 shadow-sm border transition-all ${
        isCloudConnected 
          ? 'bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-emerald-300' 
          : 'bg-white border-slate-200/80'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold ${
              isCloudConnected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">סנכרון ענן בזמן אמת (Database)</h3>
              <p className="text-[11px] text-slate-500">
                {isCloudConnected 
                  ? '🟢 מחובר לענן! כל עדכון מסתנכרן מיד לכל העובדים' 
                  : '⚪ כרגע מקומי – חבר Firebase לעדכון שאר המכשירים'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveFirebase} className="mt-3 space-y-2.5">
          <label className="block text-xs font-bold text-slate-700">
            הדבק כאן את ה-Firebase Config שלך:
          </label>
          <textarea
            rows="3"
            value={firebaseInput}
            onChange={(e) => setFirebaseInput(e.target.value)}
            placeholder='{"apiKey": "...", "projectId": "shuk-...", ...}'
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-[11px] font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          {firebaseStatusMsg && (
            <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              {firebaseStatusMsg}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>מדריך: איך פותחים Firebase ב-2 דקות?</span>
              {showFirebaseGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="submit"
              className="bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:bg-slate-800 active:scale-95 transition"
            >
              שמור והתחבר
            </button>
          </div>
        </form>

        {/* Firebase Quick Setup Guide Accordion */}
        {showFirebaseGuide && (
          <div className="mt-3 p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 text-xs text-blue-950 space-y-2 leading-relaxed animate-in fade-in duration-200">
            <h4 className="font-black text-blue-900">4 שלבים פשוטים (חינם לחלוטין):</h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px]">
              <li>היכנסו ל-<strong>firebase.google.com</strong> עם חשבון גוגל ולחצו <em>Go to console</em>.</li>
              <li>לחצו <strong>Add project</strong> ותנו לו שם (למשל: <code>shuk-kitchen</code>).</li>
              <li>בתפריט צד בחרו <strong>Build ⬅️ Firestore Database</strong> ⬅️ לחצו <em>Create database</em> ובחרו <em>Start in test mode</em>.</li>
              <li>בהגדרות הפרויקט (גלגל שיניים ⬅️ Project Settings) לחצו על אייקון <strong>Web (&lt;/&gt;)</strong>, העתיקו את ה-<code>firebaseConfig</code> והדביקו כאן למעלה!</li>
            </ol>
            <p className="text-[10px] text-blue-800 font-semibold pt-1">
              * מעכשיו כל עדכון שמישהו יעשה (תשלום, קנייה, חילוף) יופיע מיד על המסך של כל שאר האנשים!
            </p>
          </div>
        )}
      </div>

      {/* 💳 PAYBOX LINK SETTINGS */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <LinkIcon className="w-4 h-4 text-blue-600" />
          <span>קישור לקבוצת ה-PayBox שלכם</span>
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

      {/* 📲 PWA INSTALL ON PHONE BANNER */}
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

      {/* 👥 TEAM MEMBERS MANAGEMENT */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-orange-600" />
            <span>חברי הצוות ({members.length})</span>
          </h3>
        </div>

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

              {members.length > 2 && (
                <button
                  onClick={() => onRemoveMember(member.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 transition"
                  title="מחק חבר צוות"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Member Form */}
        <form onSubmit={handleAddMemberSubmit} className="pt-2 border-t border-slate-100 space-y-2.5">
          <span className="text-xs font-bold text-slate-700 block">הוספת חבר צוות חדש:</span>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="שם מלא (למשל: יובל לוי)"
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

      {/* 💾 BACKUP & DATA MANAGEMENT */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>גיבוי וניהול נתונים</span>
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
            if (confirm('האם אתה בטוח שברצונך לאפס את הנתונים לברירת המחדל?')) {
              onResetData();
            }
          }}
          className="w-full text-center text-xs font-bold text-rose-600 hover:text-rose-700 py-1.5 transition"
        >
          איפוס נתונים לברירת המחדל הראשונית
        </button>
      </div>

    </div>
  );
}
