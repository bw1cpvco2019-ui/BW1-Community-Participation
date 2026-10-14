import React, { useState } from 'react';
import {
  Briefcase,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Star,
  X,
  ChevronRight
} from 'lucide-react';
import {
  SCHEDULE_DATA,
  EntryRecord,
  Professional,
  getAvatarColor,
  getInitials,
  MondayWeek
} from '../data/scheduleData';

interface ProfessionalsTabProps {
  entries: Record<number, EntryRecord>;
  onSelectWeek?: (weekNumber: number) => void;
}

export const ProfessionalsTab: React.FC<ProfessionalsTabProps> = ({
  entries,
  onSelectWeek
}) => {
  const [selectedProf, setSelectedProf] = useState<Professional | null>(null);
  const [contactNotice, setContactNotice] = useState<string | null>(null);

  // Compute stats for each professional
  const professionalsWithStats = SCHEDULE_DATA.professionals.map((prof) => {
    const assignedWeeks = SCHEDULE_DATA.mondays.filter(
      (m: MondayWeek) => m.professional === prof.name
    );
    const completedWeeks = assignedWeeks.filter(
      (m) => entries[m.week]?.status === 'done'
    ).length;

    const totalAttended = assignedWeeks.reduce(
      (acc, m) => acc + (entries[m.week]?.attended ?? 0),
      0
    );

    const ratedWeeks = assignedWeeks.filter(
      (m) => entries[m.week]?.feedback != null && Number(entries[m.week]?.feedback) > 0
    );
    const avgFeedback =
      ratedWeeks.length > 0
        ? (
            ratedWeeks.reduce((acc, m) => acc + Number(entries[m.week]?.feedback ?? 0), 0) /
            ratedWeeks.length
          ).toFixed(1)
        : '—';

    return {
      ...prof,
      assignedWeeks,
      totalWeeks: assignedWeeks.length,
      completed: completedWeeks,
      totalAttended,
      avgFeedback
    };
  });

  const handleContact = (type: 'email' | 'phone', val?: string) => {
    if (!val) return;
    if (type === 'email') {
      window.location.href = `mailto:${val}`;
    } else {
      window.location.href = `tel:${val}`;
    }
    setContactNotice(`${val} ተመርጧል`);
    setTimeout(() => setContactNotice(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-[#0F2438]">የጽ/ቤቱ ባለሙያዎችና አቅራቢዎች</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            የተመደቡ ተረኞች፣ የሥራ ኃላፊነት እና የዕውቀት ሽግግር አፈጻጸም ማጠቃለያ
          </p>
        </div>

        {contactNotice && (
          <span className="text-xs font-semibold text-[#16324F] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 animate-fade-in">
            {contactNotice}
          </span>
        )}
      </div>

      {/* Grid of Professionals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {professionalsWithStats.map((p) => {
          const bannerColor = getAvatarColor(p.name);
          const initials = getInitials(p.name);

          return (
            <div
              key={p.name}
              className="bg-white rounded-2xl border border-stone-200/70 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Banner */}
                <div
                  className="h-20 relative transition-opacity"
                  style={{ backgroundColor: bannerColor }}
                >
                  <div
                    className="absolute -bottom-8 left-5 w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white border-4 border-white shadow-md"
                    style={{ backgroundColor: bannerColor }}
                  >
                    {initials}
                  </div>
                </div>

                {/* Profile Details */}
                <div className="px-5 pt-10 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-stone-900 leading-tight">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 mb-4">
                        <Briefcase size={13} className="text-stone-400" />
                        <span>{p.role}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProf(p)}
                      title="የባለሙያውን ሳምንታት በዝርዝር እይ"
                      className="text-xs text-[#16324F] font-semibold hover:underline flex items-center gap-0.5 bg-stone-50 px-2 py-1 rounded-md border border-stone-200"
                    >
                      <span>ዝርዝር</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>

                  {/* 3 Metric Tiles */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2.5 bg-stone-50/80 rounded-xl border border-stone-100">
                      <div className="text-xl font-black text-[#16324F]">{p.totalWeeks}</div>
                      <div className="text-[10px] text-stone-500 font-semibold mt-0.5">
                        ሳምንት
                      </div>
                    </div>

                    <div className="text-center p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100/60">
                      <div className="text-xl font-black text-[#4C7A62]">{p.completed}</div>
                      <div className="text-[10px] text-[#4C7A62] font-semibold mt-0.5">
                        ተጠናቅቋል
                      </div>
                    </div>

                    <div className="text-center p-2.5 bg-amber-50/60 rounded-xl border border-amber-100/60">
                      <div className="text-xl font-black text-[#B98A22]">{p.avgFeedback}</div>
                      <div className="text-[10px] text-amber-700 font-semibold mt-0.5">
                        ግምገማ
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Footer */}
              <div className="px-5 pb-5 pt-2 border-t border-stone-100 mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleContact('email', p.email)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-50 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60 transition-colors"
                  >
                    <Mail size={13} />
                    <span>ኢሜይል</span>
                  </button>

                  <button
                    onClick={() => handleContact('phone', p.phone)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-stone-50 text-xs font-semibold text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200/60 transition-colors"
                  >
                    <Phone size={13} />
                    <span>ስልክ</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal for Selected Professional */}
      {selectedProf && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
            {/* Modal Header */}
            <div
              className="p-6 text-white relative"
              style={{ backgroundColor: getAvatarColor(selectedProf.name) }}
            >
              <button
                onClick={() => setSelectedProf(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-black text-white border border-white/30">
                  {getInitials(selectedProf.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedProf.name}</h3>
                  <p className="text-xs text-white/80 mt-0.5 flex items-center gap-1">
                    <Briefcase size={12} />
                    {selectedProf.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body: List of assigned weeks */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
                የተመደቡባቸው የሰኞ ቀናትና የቀረቡ ርዕሶች፦
              </h4>

              {SCHEDULE_DATA.mondays
                .filter((m) => m.professional === selectedProf.name)
                .map((m) => {
                  const entry = entries[m.week];
                  const isDone = entry?.status === 'done';
                  return (
                    <div
                      key={m.week}
                      className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#16324F] text-white flex flex-col items-center justify-center text-xs font-bold flex-shrink-0">
                          <span>{m.week}</span>
                          <span className="text-[8px] opacity-75">ሳ</span>
                        </div>
                        <div>
                          <div className="text-xs text-stone-400 font-medium">
                            {m.eth_month} {m.eth_day}፣ {m.eth_year} ዓ.ም. ({m.greg})
                          </div>
                          <div className="text-sm font-bold text-stone-800 mt-0.5">
                            {entry?.topic || 'ርዕሰ ጉዳይ አልተመዘገበም'}
                          </div>

                          {entry && (entry.attended != null || entry.feedback != null) && (
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500">
                              {entry.attended != null && (
                                <span>{entry.attended} ተሳታፊ ተገኝቷል</span>
                              )}
                              {entry.feedback != null && (
                                <span className="flex items-center gap-1 text-amber-600 font-medium">
                                  <Star size={12} className="fill-amber-500 text-amber-500" />
                                  {Number(entry.feedback).toFixed(1)} ነጥብ
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4C7A62] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <CheckCircle2 size={12} /> ተጠናቅቋል
                          </span>
                        ) : m.is_holiday ? (
                          <span className="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            በዓል
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                            <Clock size={12} /> ታቅዷል
                          </span>
                        )}

                        {onSelectWeek && (
                          <button
                            onClick={() => {
                              setSelectedProf(null);
                              onSelectWeek(m.week);
                            }}
                            className="text-xs text-[#16324F] hover:underline font-semibold"
                          >
                            ወደዚህ ሳምንት ሂድ →
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedProf(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#16324F] text-white hover:bg-[#0F2438] transition-colors"
              >
                ዝጋ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
