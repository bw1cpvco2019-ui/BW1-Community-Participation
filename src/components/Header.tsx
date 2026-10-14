import React, { useRef } from 'react';
import {
  CalendarRange,
  Download,
  Upload,
  RotateCcw,
  Printer,
  CheckCircle2,
  LogIn,
  LogOut,
  Shield,
  UserCheck
} from 'lucide-react';
import { SCHEDULE_DATA, getInitials } from '../data/scheduleData';
import { AuthUser } from '../hooks/useAuth';

interface HeaderProps {
  isSavedRecently: boolean;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onExport: () => void;
  onImport: (json: string) => boolean;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSavedRecently,
  currentUser,
  onOpenLogin,
  onLogout,
  onExport,
  onImport,
  onReset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const ok = onImport(text);
          if (ok) {
            alert('መረጃው በተሳካ ሁኔታ ገብቷል!');
          } else {
            alert('መረጃውን ማስገባት አልተቻለም። እባክዎ የፋይሉን ትክክለኛነት ያረጋግጡ።');
          }
        }
      };
      reader.readAsText(file);
    }
    // reset input value so re-importing works
    e.target.value = '';
  };

  const firstWeek = SCHEDULE_DATA.mondays[0];
  const lastWeek = SCHEDULE_DATA.mondays[SCHEDULE_DATA.mondays.length - 1];

  return (
    <header className="border-b border-stone-200">
      {/* Top Municipal Banner */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#16324F] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#16324F]/10">
              <CalendarRange size={24} className="text-[#B98A22]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#0F2438]">
                ቦሌ ወረዳ 01 የህብረተሰብ ተሳትፎና በጎ ፈቃድ ማስተባበሪያ ጽ/ቤት
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                Bole Sub-City Woreda 01 Community Participation & Voluntarism Coordination Office
              </div>
            </div>
          </div>

          {/* Quick utility controls & User Authentication */}
          <div className="flex items-center gap-2 self-end sm:self-auto no-print flex-wrap">
            <span
              className={`text-xs text-[#4C7A62] font-semibold flex items-center gap-1 transition-opacity duration-300 ${
                isSavedRecently ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <CheckCircle2 size={14} /> ተቀምጧል
            </span>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              title="መረጃ ከፋይል አስገባ (Import JSON)"
              className="px-2.5 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Upload size={13} />
              <span className="hidden md:inline">አስገባ</span>
            </button>

            <button
              onClick={onExport}
              title="መረጃ ወደ ፋይል አውርድ (Export JSON)"
              className="px-2.5 py-1.5 text-xs font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Download size={13} />
              <span className="hidden md:inline">አውርድ</span>
            </button>

            <button
              onClick={onReset}
              title="ወደ መጀመሪያው ውሂብ መልስ (Reset)"
              className="px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-red-700 bg-stone-100 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span className="hidden md:inline">መልስ</span>
            </button>

            {/* User Authentication Status */}
            <div className="h-5 w-px bg-stone-200 mx-1" />

            {currentUser ? (
              <div className="flex items-center gap-2 bg-stone-100/90 border border-stone-200/80 rounded-xl px-2.5 py-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs"
                  style={{ backgroundColor: currentUser.avatarColor }}
                >
                  {getInitials(currentUser.name)}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-stone-800 leading-none truncate max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[9px] text-stone-400 font-semibold leading-tight mt-0.5">
                    {currentUser.role === 'admin' ? 'አስተዳዳሪ' : currentUser.roleTitle}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="ከስርዓቱ ውጣ (Logout)"
                  className="ml-1 p-1 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#16324F] text-white hover:bg-[#0F2438] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <LogIn size={13} />
                <span>ግባ / Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Program Title Header */}
      <div className="bg-[#16324F] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#B98A22] text-[#0F2438] flex items-center justify-center flex-shrink-0 shadow-md">
                <CalendarRange size={26} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-[#B98A22] font-semibold tracking-wide uppercase leading-tight">
                  የዕውቀት ሽግግር ፕሮግራም
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
                  ወርቃማ ሰኞ
                </h1>
                <p className="text-xs text-white/60 mt-0.5">
                  {firstWeek.eth_month} {firstWeek.eth_day}/{firstWeek.eth_year} – {lastWeek.eth_month} {lastWeek.eth_day}/{lastWeek.eth_year} ዓ.ም.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="no-print flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all self-end sm:self-auto shadow-sm"
            >
              <Printer size={15} />
              <span>መርሐ ግብር አትም</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
