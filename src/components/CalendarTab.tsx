import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import {
  SCHEDULE_DATA,
  MonthSegment,
  EntryRecord,
  WEEKDAYS_ETH,
  formatDateIso,
  findMondayByGregDate,
  getAvatarColor,
  getInitials
} from '../data/scheduleData';

interface CalendarTabProps {
  entries: Record<number, EntryRecord>;
  onSelectWeek?: (weekNumber: number) => void;
}

interface MonthViewProps {
  segment: MonthSegment;
  entries: Record<number, EntryRecord>;
  onSelectWeek?: (weekNumber: number) => void;
}

const MonthGrid: React.FC<MonthViewProps> = ({ segment, entries, onSelectWeek }) => {
  // Generate calendar days
  const days: { day: number | null; greg: string | null }[] = [];

  // Add leading empty days based on start_weekday (0 = Monday, ..., 6 = Sunday)
  for (let i = 0; i < segment.start_weekday; i++) {
    days.push({ day: null, greg: null });
  }

  const startDate = new Date(segment.start_greg + 'T00:00:00');
  for (let d = 1; d <= segment.length; d++) {
    const currDate = new Date(startDate);
    currDate.setDate(currDate.getDate() + d - 1);
    days.push({ day: d, greg: formatDateIso(currDate) });
  }

  // Trailing empty slots to complete the final week row
  while (days.length % 7 !== 0) {
    days.push({ day: null, greg: null });
  }

  // Count stats for this month
  let mondaySessionsCount = 0;
  let completedCount = 0;
  let holidayCount = 0;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/70 shadow-lg shadow-stone-200/40 overflow-hidden">
      {/* Month Card Header */}
      <div className="relative px-6 py-5 bg-gradient-to-br from-[#16324F] via-[#1A3D5C] to-[#0F2438] text-white overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-[#B98A22]/10 -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full bg-[#B98A22]/5 translate-y-10 -translate-x-8 pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#B98A22] uppercase mb-1">
              የኢትዮጵያ የወር ቀን መቁጠሪያ
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">
              {segment.name} {segment.year} ዓ.ም.
            </h3>
            <p className="text-xs text-white/60 mt-1">
              የወሩ ርዝመት፦ <span className="font-semibold text-white/90">{segment.length} ቀን</span> ({segment.start_greg})
            </p>
          </div>

          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
            <CalendarDays size={28} className="text-[#B98A22]" />
          </div>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 gap-1 px-4 pt-4 pb-2 border-b border-stone-100">
        {WEEKDAYS_ETH.map((weekday, idx) => (
          <div
            key={weekday}
            className={`text-center text-[11px] font-bold py-2 rounded-lg ${
              idx === 0
                ? 'bg-gradient-to-b from-[#B98A22]/20 to-[#B98A22]/5 text-[#B98A22] border border-[#B98A22]/20'
                : 'text-stone-400'
            }`}
          >
            {weekday}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 p-4">
        {days.map((slot, index) => {
          if (!slot.day) {
            return (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-xl bg-stone-50/30"
              />
            );
          }

          const isMonday = index % 7 === 0;
          const mondayInfo = isMonday && slot.greg ? findMondayByGregDate(slot.greg) : null;
          const entry = mondayInfo ? entries[mondayInfo.week] : null;
          const mondayWeek = mondayInfo
            ? SCHEDULE_DATA.mondays.find((m) => m.week === mondayInfo.week)
            : null;
          const isHoliday = mondayWeek?.is_holiday || entry?.status === 'holiday';
          const isDone = entry?.status === 'done';

          if (isMonday && mondayInfo) {
            mondaySessionsCount++;
            if (isDone) completedCount++;
            if (isHoliday) holidayCount++;

            const avatarColor = getAvatarColor(mondayInfo.professional);
            const initials = getInitials(mondayInfo.professional);

            const cardClasses = isHoliday
              ? 'bg-gradient-to-br from-[#AD5A42]/15 to-[#AD5A42]/5 ring-2 ring-[#AD5A42]/40 hover:ring-[#AD5A42]'
              : isDone
              ? 'bg-gradient-to-br from-[#4C7A62]/15 to-[#4C7A62]/5 ring-2 ring-[#4C7A62]/60 hover:ring-[#4C7A62]'
              : 'bg-gradient-to-br from-[#B98A22]/15 to-[#B98A22]/5 ring-2 ring-[#B98A22]/40 hover:ring-[#B98A22]';

            return (
              <button
                key={`day-${index}`}
                type="button"
                onClick={() => onSelectWeek && onSelectWeek(mondayInfo.week)}
                title={`ሳምንት ${mondayInfo.week} — ${mondayInfo.professional}${
                  entry?.topic ? ` — ${entry.topic}` : ''
                } (${isHoliday ? 'የበዓል ቀን' : isDone ? 'ተጠናቅቋል' : 'ታቅዷል'})`}
                className={`aspect-square rounded-xl p-1 sm:p-1.5 flex flex-col items-center justify-between transition-all duration-200 relative overflow-hidden group cursor-pointer text-left shadow-2xs hover:scale-105 ${cardClasses}`}
              >
                <div className="w-full flex items-center justify-between">
                  <span className="font-extrabold text-xs sm:text-sm text-[#0F2438] leading-none">
                    {slot.day}
                  </span>
                  {isDone && !isHoliday && (
                    <span className="w-2 h-2 rounded-full bg-[#4C7A62] ring-1 ring-white" />
                  )}
                  {isHoliday && (
                    <span className="w-2 h-2 rounded-full bg-[#AD5A42] ring-1 ring-white" />
                  )}
                </div>

                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-bold text-white shadow-xs"
                  style={{ backgroundColor: avatarColor }}
                >
                  {initials}
                </div>

                <div className="w-full text-center">
                  <span className="text-[8px] sm:text-[9px] text-stone-600 font-bold block truncate leading-tight">
                    ሳ{mondayInfo.week}
                  </span>
                </div>
              </button>
            );
          }

          // Regular non-Monday calendar day
          return (
            <div
              key={`day-${index}`}
              className="aspect-square rounded-xl bg-stone-50/80 border border-stone-100 flex items-center justify-center text-xs text-stone-400 font-medium transition-colors hover:bg-stone-100"
            >
              {slot.day}
            </div>
          );
        })}
      </div>

      {/* Month Card Footer Stats */}
      <div className="px-5 py-3.5 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#B98A22]/15 flex items-center justify-center">
            <span className="font-bold text-[#B98A22] text-xs">{mondaySessionsCount}</span>
          </div>
          <span className="text-stone-700 font-semibold">የሰኞ ማቅረቢያዎች</span>
        </div>

        <div className="flex items-center gap-3">
          {completedCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4C7A62]" />
              <span className="text-[#4C7A62] font-semibold">{completedCount} ተጠናቅቋል</span>
            </div>
          )}
          {holidayCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#AD5A42]" />
              <span className="text-[#AD5A42] font-semibold">{holidayCount} በዓል</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CalendarTab: React.FC<CalendarTabProps> = ({ entries, onSelectWeek }) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);
  const segments = SCHEDULE_DATA.segments;
  const currentSegment = segments[selectedMonthIndex];

  return (
    <div className="space-y-5">
      {/* Month Selector Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-xs p-4 flex items-center justify-between gap-3">
        <button
          onClick={() => setSelectedMonthIndex((prev) => Math.max(0, prev - 1))}
          disabled={selectedMonthIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 disabled:opacity-35 hover:bg-stone-100 hover:border-stone-300 transition-all text-xs sm:text-sm font-semibold text-stone-700 cursor-pointer disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          <span>ቀዳሚ ወር</span>
        </button>

        <div className="text-center">
          <div className="text-base sm:text-lg font-black text-[#0F2438]">
            {currentSegment.name} {currentSegment.year} ዓ.ም.
          </div>
          <div className="text-xs text-stone-400 mt-0.5 font-medium">
            ወር {selectedMonthIndex + 1} ከ {segments.length}
          </div>
        </div>

        <button
          onClick={() => setSelectedMonthIndex((prev) => Math.min(segments.length - 1, prev + 1))}
          disabled={selectedMonthIndex === segments.length - 1}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 disabled:opacity-35 hover:bg-stone-100 hover:border-stone-300 transition-all text-xs sm:text-sm font-semibold text-stone-700 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>ቀጣይ ወር</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Month Calendar Grid */}
      <MonthGrid
        segment={currentSegment}
        entries={entries}
        onSelectWeek={onSelectWeek}
      />

      {/* Quick Month Quick-Picker Carousel */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-xs p-4">
        <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2.5">
          ወደ ሌላ ወር በቀጥታ ዝለል፦
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {segments.map((seg, idx) => (
            <button
              key={`${seg.name}-${seg.year}`}
              onClick={() => setSelectedMonthIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedMonthIndex === idx
                  ? 'bg-[#16324F] text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {seg.name} {seg.year}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Legend */}
      <div className="bg-white rounded-xl border border-stone-200/70 shadow-xs p-4 flex items-center gap-6 text-xs text-stone-700 justify-center flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg ring-2 ring-[#B98A22]/40 bg-gradient-to-br from-[#B98A22]/15 to-[#B98A22]/5" />
          <span className="font-medium">የሰኞ ፕሮግራም</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg ring-2 ring-[#4C7A62]/60 bg-gradient-to-br from-[#4C7A62]/15 to-[#4C7A62]/5" />
          <span className="font-medium">ተጠናቅቋል</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-lg ring-2 ring-[#AD5A42]/40 bg-gradient-to-br from-[#AD5A42]/15 to-[#AD5A42]/5" />
          <span className="font-medium">የበዓል ቀን (ቢሮ ዝግ)</span>
        </div>
      </div>
    </div>
  );
};
