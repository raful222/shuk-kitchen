import React from 'react';
import { ShoppingBag, Users, AlertCircle, Utensils, Cloud, CloudCheck, CloudOff } from 'lucide-react';
import { getHebrewDateString } from '../utils/helpers';

export default function Header({ 
  todayAttendeesCount = 0, 
  activeSwapsCount = 0, 
  onOpenSwaps,
  currentTab,
  isCloudConnected = false,
  onOpenSettings,
}) {
  const hebrewDate = getHebrewDateString();

  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-md">
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
              🍗
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg tracking-tight">שוק-מטבח</h1>
                <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-medium">מחסני השוק</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs text-orange-100 font-medium">{hebrewDate}</p>
                <span>•</span>
                {/* Cloud Sync Status Badge */}
                <button
                  onClick={onOpenSettings}
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full flex items-center gap-1 transition ${
                    isCloudConnected 
                      ? 'bg-emerald-400/30 text-emerald-100 hover:bg-emerald-400/40' 
                      : 'bg-white/20 text-orange-100 hover:bg-white/30'
                  }`}
                  title={isCloudConnected ? 'מסד נתונים מחובר ומסונכרן בזמן אמת לכל הצוות' : 'לחץ לחיבור מסד נתונים בענן'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-emerald-300 animate-pulse' : 'bg-amber-300'}`} />
                  <span>{isCloudConnected ? 'סנכרון חי' : 'מקומי'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSwapsCount > 0 && (
              <button
                onClick={onOpenSwaps}
                className="flex items-center gap-1 bg-amber-400 text-amber-950 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-sm animate-pulse hover:bg-amber-300 transition"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span>{activeSwapsCount} חילוף</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold">
              <Users className="w-3.5 h-3.5 text-orange-200" />
              <span>{todayAttendeesCount} במשרד</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
