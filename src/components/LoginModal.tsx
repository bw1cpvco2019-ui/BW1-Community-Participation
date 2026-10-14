import React, { useState } from 'react';
import {
  X,
  Shield,
  UserCheck,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SCHEDULE_DATA, getAvatarColor, getInitials } from '../data/scheduleData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginAdmin: (pass: string) => { success: boolean; message?: string };
  onLoginProfessional: (name: string, pass: string) => { success: boolean; message?: string };
  onQuickLoginProfessional: (name: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginAdmin,
  onLoginProfessional,
  onQuickLoginProfessional
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'professional'>('professional');
  const [adminPassword, setAdminPassword] = useState<string>('admin2019');
  const [selectedProfName, setSelectedProfName] = useState<string>(
    SCHEDULE_DATA.professionals[0]?.name || ''
  );
  const [profPasscode, setProfPasscode] = useState<string>('1234');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = onLoginAdmin(adminPassword);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'መግባት አልተቻለም');
    }
  };

  const handleProfSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = onLoginProfessional(selectedProfName, profPasscode);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'መግባት አልተቻለም');
    }
  };

  const handleQuickLogin = (name: string) => {
    onQuickLoginProfessional(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200 animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#16324F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B98A22] text-[#0F2438] flex items-center justify-center shadow-xs">
              <Lock size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">የስርዓት መግቢያ (Login)</h3>
              <p className="text-xs text-white/70">
                ለቦሌ ወረዳ 01 አድሚን እና የዕውቀት ሽግግር አቅራቢ ባለሙያዎች
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Professional vs Admin */}
        <div className="grid grid-cols-2 border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('professional');
              setErrorMsg(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'professional'
                ? 'border-[#B98A22] text-[#16324F] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserCheck size={16} />
            <span>የባለሙያዎች መግቢያ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('admin');
              setErrorMsg(null);
            }}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'border-[#B98A22] text-[#16324F] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Shield size={16} />
            <span>የአድሚን መግቢያ</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'professional' ? (
            /* Professional Form */
            <form onSubmit={handleProfSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                  ስምዎን ይምረጡ (የተመደቡ ባለሙያ)
                </label>
                <select
                  value={selectedProfName}
                  onChange={(e) => setSelectedProfName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 bg-white font-medium cursor-pointer"
                >
                  {SCHEDULE_DATA.professionals.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} — {p.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">የይለፍ ቃል / PIN</label>
                  <span className="text-[11px] text-stone-400">ነባሪ፦ 1234</span>
                </div>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    value={profPasscode}
                    onChange={(e) => setProfPasscode(e.target.value)}
                    placeholder="1234"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#16324F] text-white hover:bg-[#0F2438] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <UserCheck size={16} />
                <span>እንደ ባለሙያ ግባ</span>
              </button>

              {/* 1-Click Quick Login Chips */}
              <div className="pt-3 border-t border-stone-200">
                <div className="flex items-center gap-1 text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
                  <Sparkles size={12} className="text-[#B98A22]" />
                  <span>በቀጥታ ለመግባት አንዱን ይምረጡ፦</span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {SCHEDULE_DATA.professionals.slice(0, 8).map((p) => {
                    const avatarColor = getAvatarColor(p.name);
                    const initials = getInitials(p.name);
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handleQuickLogin(p.name)}
                        className="p-2 rounded-xl border border-stone-200 bg-stone-50/80 hover:bg-stone-100 flex items-center gap-2 text-left transition-all cursor-pointer"
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor }}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-stone-800 truncate">{p.name}</div>
                          <div className="text-[10px] text-stone-400 truncate">{p.role}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </form>
          ) : (
            /* Admin Form */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 leading-relaxed">
                <strong>የአድሚን ፈቃድ፦</strong> ሁሉንም 52 ሳምንታት፣ ርዕሶችን፣ ሰነዶችን፣ የተሳታፊዎች ምዝገባንና የባለሙያዎች ቅንብርን ሙሉ በሙሉ የማስተዳደር ስልጣን ይሰጣል።
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 mb-1.5 block">
                  የአስተዳዳሪ ተጠቃሚ ስም
                </label>
                <input
                  type="text"
                  value="admin"
                  disabled
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 bg-stone-100 text-stone-600 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700">የአድሚን የይለፍ ቃል</label>
                  <span className="text-[11px] text-stone-400">ነባሪ፦ admin2019</span>
                </div>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="admin2019"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#16324F] text-white hover:bg-[#0F2438] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Shield size={16} />
                <span>እንደ አድሚን ግባ</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAdminPassword('admin2019');
                    onLoginAdmin('admin2019');
                    onClose();
                  }}
                  className="text-xs text-[#B98A22] font-bold hover:underline cursor-pointer"
                >
                  ⚡ በፈጣኑ የአድሚን የይለፍ ቃል (admin2019) ግባ
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
