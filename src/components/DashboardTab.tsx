import React, { useState } from 'react';
import {
  Calendar,
  TrendingUp,
  BookOpen,
  CircleAlert,
  Users,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  SCHEDULE_DATA,
  EntryRecord,
  getCurrentMondayWeek
} from '../data/scheduleData';

interface DashboardTabProps {
  entries: Record<number, EntryRecord>;
  onSelectWeek?: (weekNumber: number) => void;
}

interface PeriodStat {
  name: string;
  label: string;
  total: number;
  completed: number;
  topics: number;
  participation: number;
  pct: number;
}

function computePeriodStat(
  startWeek: number,
  endWeek: number,
  name: string,
  entries: Record<number, EntryRecord>
): PeriodStat {
  const weeks = SCHEDULE_DATA.mondays.filter(m => m.week >= startWeek && m.week <= endWeek);
  const total = weeks.length;
  let completed = 0;
  let topics = 0;
  let invitedSum = 0;
  let attendedSum = 0;
  let participationCount = 0;

  for (const m of weeks) {
    const entry = entries[m.week];
    if (entry?.status === 'done') {
      completed++;
    }
    if (entry?.topic && entry.topic.trim() !== '') {
      topics++;
    }
    if (entry?.invited != null && entry?.attended != null) {
      invitedSum += Number(entry.invited);
      attendedSum += Number(entry.attended);
      participationCount++;
    }
  }

  const participation = participationCount > 0 && invitedSum > 0 ? attendedSum / invitedSum : 0;
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  const label = first && last
    ? `${first.eth_month} ${first.eth_day}/${first.eth_year} – ${last.eth_month} ${last.eth_day}/${last.eth_year}`
    : '';

  return {
    name,
    label,
    total,
    completed,
    topics,
    participation,
    pct: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ entries, onSelectWeek }) => {
  const [periodTab, setPeriodTab] = useState<'quarter' | 'half' | 'year'>('quarter');

  const totalWeeks = SCHEDULE_DATA.total_weeks;
  const entriesList = Object.values(entries);

  const completedCount = entriesList.filter(e => e.status === 'done').length;
  const plannedCount = entriesList.filter(e => e.status === 'planned').length;
  const holidayCount = entriesList.filter(e => e.status === 'holiday').length;
  const topicsCount = entriesList.filter(e => e.topic && e.topic.trim() !== '').length;

  const totalInvited = entriesList.reduce((acc, curr) => acc + (curr.invited ?? 0), 0);
  const totalAttended = entriesList.reduce((acc, curr) => acc + (curr.attended ?? 0), 0);
  const avgParticipation = totalInvited > 0 ? Math.round((totalAttended / totalInvited) * 100) : 0;

  const ratedEntries = entriesList.filter(e => e.feedback != null && Number(e.feedback) > 0);
  const avgRating = ratedEntries.length > 0
    ? (ratedEntries.reduce((acc, curr) => acc + Number(curr.feedback ?? 0), 0) / ratedEntries.length).toFixed(1)
    : '—';

  const overallCompletionPct = Math.round((completedCount / totalWeeks) * 100);
  const remainingCount = totalWeeks - completedCount;

  // Calendar time progress
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const elapsedWeeksCount = SCHEDULE_DATA.mondays.filter(
    m => new Date(m.greg + 'T00:00:00') <= today
  ).length;
  const elapsedPct = Math.min(100, Math.round((elapsedWeeksCount / totalWeeks) * 100));

  const currentMonday = getCurrentMondayWeek();

  // Period statistics calculations
  const quarterSize = Math.round(totalWeeks / 4); // 13
  const halfSize = Math.round(totalWeeks / 2); // 26

  const quarters: PeriodStat[] = [
    computePeriodStat(1, quarterSize, 'ሩብ 1 (1ኛ ሩብ ዓመት)', entries),
    computePeriodStat(quarterSize + 1, 2 * quarterSize, 'ሩብ 2 (2ኛ ሩብ ዓመት)', entries),
    computePeriodStat(2 * quarterSize + 1, 3 * quarterSize, 'ሩብ 3 (3ኛ ሩብ ዓመት)', entries),
    computePeriodStat(3 * quarterSize + 1, totalWeeks, 'ሩብ 4 (4ኛ ሩብ ዓመት)', entries)
  ];

  const halves: PeriodStat[] = [
    computePeriodStat(1, halfSize, 'ግማሽ 1 (የመጀመሪያው 6 ወር)', entries),
    computePeriodStat(halfSize + 1, totalWeeks, 'ግማሽ 2 (ሁለተኛው 6 ወር)', entries)
  ];

  const fullYear: PeriodStat[] = [
    computePeriodStat(1, totalWeeks, 'ሙሉ ዓመት (12 ወር)', entries)
  ];

  const activePeriods = periodTab === 'quarter' ? quarters : periodTab === 'half' ? halves : fullYear;

  // Upcoming 5 planned programs
  const upcomingMondays = SCHEDULE_DATA.mondays
    .filter(m => {
      const entry = entries[m.week];
      return !entry || entry.status === 'planned';
    })
    .slice(0, 5);

  const statsCards = [
    {
      label: 'ጠቅላላ ሰኞዎች',
      value: `${totalWeeks}`,
      sub: 'ሙሉ ዓመት ፕሮግራም',
      icon: Calendar,
      color: '#16324F',
      bg: '#E8EFF4'
    },
    {
      label: 'የተጠናቀቁ ማቅረቢያዎች',
      value: `${completedCount}`,
      sub: `ከ ${totalWeeks} ሳምንት`,
      icon: TrendingUp,
      color: '#4C7A62',
      bg: '#E6F0EC'
    },
    {
      label: 'የተሸፈኑ ርዕሶች',
      value: `${topicsCount}`,
      sub: 'ርዕሰ ጉዳይ ተሞልቷል',
      icon: BookOpen,
      color: '#B98A22',
      bg: '#F7F0E0'
    },
    {
      label: 'የቀሩ ፕሮግራሞች',
      value: `${remainingCount}`,
      sub: `${plannedCount} ታቅዷል፣ ${holidayCount} በዓል`,
      icon: CircleAlert,
      color: '#AD5A42',
      bg: '#F4E8E4'
    },
    {
      label: 'አማካይ የተሳትፎ መጠን',
      value: `${avgParticipation}%`,
      sub: `${totalAttended} ተሳታፊ ከ ${totalInvited}`,
      icon: Users,
      color: '#2E6E7E',
      bg: '#E0EEF1'
    },
    {
      label: 'አማካይ እርካታ ነጥብ (ከ5)',
      value: `${avgRating}`,
      sub: `ከ ${ratedEntries.length} ግምገማዎች`,
      icon: Award,
      color: '#6B4E9E',
      bg: '#EEE8F4'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Week Banner */}
      {currentMonday && (
        <div className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 rounded-2xl p-5 border border-[#B98A22]/35 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-[#B98A22]/15 flex items-center justify-center text-[#B98A22]">
              <Clock size={16} />
            </div>
            <h3 className="text-sm font-bold text-[#0F2438]">የአሁኑ ሳምንት ማሳሰቢያ</h3>
          </div>
          <p className="text-sm text-stone-700 leading-relaxed">
            ሳምንት <span className="font-bold text-[#16324F]">{currentMonday.week}</span> —{' '}
            <span className="font-semibold text-stone-900">
              {currentMonday.eth_month} {currentMonday.eth_day}/{currentMonday.eth_year} ዓ.ም.
            </span>{' '}
            ({currentMonday.greg}) — ተረኛ ባለሙያ፦{' '}
            <span className="font-bold text-[#0F2438] bg-amber-100/60 px-2 py-0.5 rounded-md inline-block">
              {currentMonday.professional}
            </span>
            {currentMonday.is_holiday ? (
              <span className="text-[#AD5A42] font-semibold ml-2 inline-block">
                — የበዓል ቀን፣ ቢሮዎች ስለሚዘጉ ፕሮግራሙ አይቀርብም
              </span>
            ) : entries[currentMonday.week]?.topic ? (
              <span className="text-stone-600 ml-2 inline-block">
                — ርዕስ፦ <span className="font-medium text-stone-800">«{entries[currentMonday.week].topic}»</span>
              </span>
            ) : (
              <span className="text-stone-400 italic ml-2 inline-block">
                — ርዕሰ ጉዳዩ ገና አልተመዘገበም
              </span>
            )}
          </p>
        </div>
      )}

      {/* Progress in Time Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-[#0F2438]">የፕሮግራሙ እድገት (በጊዜ መስመር)</h3>
          <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
            {elapsedWeeksCount} / {totalWeeks} ሳምንት ({elapsedPct}%)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-[#E1EBE4] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${elapsedPct}%`,
                background: 'linear-gradient(90deg, #B98A22, #D9B25C)'
              }}
            />
          </div>
        </div>
        <div className="flex justify-between text-[11px] text-stone-400 mt-1.5">
          <span>መጀመሪያ፡ ሐምሌ 6/2018</span>
          <span>ማጠቃለያ፡ ሰኔ 28/2019</span>
        </div>
      </div>

      {/* 6 Key Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shadow-xs"
                  style={{ backgroundColor: card.bg }}
                >
                  <Icon size={22} style={{ color: card.color }} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-0.5" style={{ color: card.color }}>
                {card.value}
              </div>
              <div className="text-sm font-semibold text-stone-800">{card.label}</div>
              <div className="text-xs text-stone-500 mt-0.5">{card.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Periodic Progress (Quarter, Half, Year) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200/70 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-[#0F2438]">ወቅታዊ እድገትና አፈጻጸም</h3>
          <div className="flex gap-1 border-b border-stone-100 sm:border-0">
            {(
              [
                { id: 'quarter', label: 'ሩብ ዓመት' },
                { id: 'half', label: 'ግማሽ ዓመት (6 ወር)' },
                { id: 'year', label: 'ዓመታዊ (12 ወር)' }
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriodTab(tab.id)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                  periodTab === tab.id
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-[#E1EBE4]/80 text-[#0F2438] text-xs font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3 rounded-l-lg">ወቅት</th>
                <th className="py-2.5 px-3">የቀን ክልል (ዓ.ም.)</th>
                <th className="py-2.5 px-3 text-center">ተጠናቅቋል</th>
                <th className="py-2.5 px-3 text-center">ርዕስ ተመዝግቧል</th>
                <th className="py-2.5 px-3 text-center">አማካይ ተሳትፎ</th>
                <th className="py-2.5 px-3 rounded-r-lg min-w-[130px]">የስኬት እድገት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {activePeriods.map((p) => (
                <tr key={p.name} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3 font-semibold text-stone-800">{p.name}</td>
                  <td className="py-3 px-3 text-xs text-stone-500">{p.label}</td>
                  <td className="py-3 px-3 text-center font-medium text-stone-700">
                    <span className="font-bold text-[#4C7A62]">{p.completed}</span> / {p.total}
                  </td>
                  <td className="py-3 px-3 text-center text-stone-700">{p.topics}</td>
                  <td className="py-3 px-3 text-center text-stone-700 font-medium">
                    {(p.participation * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2.5 bg-[#E1EBE4] rounded-full overflow-hidden min-w-[70px]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${p.pct}%`,
                            background: 'linear-gradient(90deg, #B98A22, #D9B25C)'
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-stone-600 min-w-[32px] text-right">
                        {p.pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-column Bottom Section: Process Status + Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Status Box */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-xs">
          <h3 className="text-base font-bold text-stone-800 mb-4">የፕሮግራም አጠቃላይ አፈጻጸም</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-stone-600 font-medium">ጠቅላላ ስኬት</span>
                <span className="font-bold text-[#16324F]">{overallCompletionPct}%</span>
              </div>
              <div className="h-3.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${overallCompletionPct}%`,
                    background: 'linear-gradient(90deg, #16324F, #2E6E7E)'
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                <div className="text-2xl font-bold text-[#4C7A62]">{completedCount}</div>
                <div className="text-xs font-medium text-[#4C7A62] mt-1">ተጠናቅቋል</div>
              </div>
              <div className="text-center p-3.5 bg-amber-50/70 border border-amber-100 rounded-xl">
                <div className="text-2xl font-bold text-amber-700">{plannedCount}</div>
                <div className="text-xs font-medium text-amber-600 mt-1">ታቅዷል</div>
              </div>
              <div className="text-center p-3.5 bg-red-50/70 border border-red-100 rounded-xl">
                <div className="text-2xl font-bold text-red-700">{holidayCount}</div>
                <div className="text-xs font-medium text-red-600 mt-1">በዓል</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Programs List */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-stone-800">ቀጣዩ የታቀዱ ፕሮግራሞች</h3>
            <span className="text-xs text-stone-400">የሚቀጥሉት 5 ሰኞዎች</span>
          </div>

          <div className="space-y-2.5">
            {upcomingMondays.length === 0 ? (
              <p className="text-sm text-stone-500 text-center py-6">
                ሁሉም ሳምንቶች ተጠናቅቀዋል ወይም ተዘግተዋል!
              </p>
            ) : (
              upcomingMondays.map((m) => {
                const entry = entries[m.week];
                return (
                  <div
                    key={m.week}
                    onClick={() => onSelectWeek && onSelectWeek(m.week)}
                    className="flex items-center gap-3 p-3 bg-stone-50 hover:bg-stone-100/90 rounded-xl transition-all cursor-pointer border border-stone-100"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#16324F] text-white flex flex-col items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs">
                      <span>{m.week}</span>
                      <span className="text-[9px] opacity-75">ሳምንት</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-stone-800 truncate">
                        {entry?.topic || 'ርዕሰ ጉዳይ አልተወሰነም'}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                        <span>
                          {m.eth_month} {m.eth_day}
                        </span>
                        <span>•</span>
                        <span className="font-medium text-stone-700">{m.professional}</span>
                        {m.is_holiday && (
                          <span className="text-red-600 font-medium">(በዓል)</span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={16} className="text-stone-400" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Overview and Policy Explanation Note */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/70 shadow-xs">
        <h3 className="text-sm font-bold text-[#0F2438] mb-2">የፕሮግራሙ ዓላማና ማጠቃለያ</h3>
        <p className="text-sm text-stone-600 leading-relaxed">
          ይህ የዕውቀት ሽግግር ፕሮግራም ከ{' '}
          <strong className="text-stone-800">
            {SCHEDULE_DATA.mondays[0].eth_month} {SCHEDULE_DATA.mondays[0].eth_day}/{SCHEDULE_DATA.mondays[0].eth_year}
          </strong>{' '}
          እስከ{' '}
          <strong className="text-stone-800">
            {SCHEDULE_DATA.mondays[totalWeeks - 1].eth_month} {SCHEDULE_DATA.mondays[totalWeeks - 1].eth_day}/{SCHEDULE_DATA.mondays[totalWeeks - 1].eth_year} ዓ.ም.
          </strong>{' '}
          ድረስ የሚዘልቅ 52 ሰኞዎችን ያቀፈ ነው። ከሳምንት {SCHEDULE_DATA.pagume_week} (ጳጉሜ) ጀምሮ ታሪኩ አዱኛ ወደ ተረኛ ዙር ገብተው የባለሙያዎች ብዛት ወደ {SCHEDULE_DATA.professionals.length} ከፍ ብሏል።
          ውሂብ (ርዕስ፣ ሁኔታ፣ የተጋበዙና የመጡ ተሳታፊዎች ቁጥር፣ የግምገማ ነጥብ እና ማስታወሻ) በ «ሳምንታዊ መርሐ ግብር» ገጽ ላይ ሲሞላ ዳሽቦርዱ እና ወርሃዊ ቀን መቁጠሪያው ወዲያውኑ በቅጽበት ይዘምናሉ።
        </p>
      </div>
    </div>
  );
};
