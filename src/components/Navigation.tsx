import React from 'react';
import { LayoutDashboard, CalendarDays, CalendarRange, Users, FolderArchive } from 'lucide-react';

export type TabType = 'dashboard' | 'weekly' | 'calendar' | 'professionals' | 'repository';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  entriesCount?: number;
  totalWeeks?: number;
  documentsCount?: number;
}

const TABS: { id: TabType; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'ዳሽቦርድ', icon: LayoutDashboard },
  { id: 'weekly', label: 'ሳምንታዊ መርሐ ግብር', icon: CalendarDays },
  { id: 'calendar', label: 'ወርሃዊ ቀን መቁጠሪያ', icon: CalendarRange },
  { id: 'professionals', label: 'ባለሙያዎች', icon: Users },
  { id: 'repository', label: 'ዶክመንት ማከማቻ', icon: FolderArchive },
];

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  documentsCount
}) => {
  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-20 shadow-xs no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-none py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer rounded-t-lg ${
                  isActive
                    ? 'border-[#B98A22] text-[#16324F] bg-stone-50/70'
                    : 'border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50/50'
                }`}
              >
                <Icon size={17} className={isActive ? 'text-[#B98A22]' : 'text-stone-400'} />
                <span>{tab.label}</span>
                {tab.id === 'repository' && documentsCount !== undefined && documentsCount > 0 && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.2 rounded-full ${
                      isActive ? 'bg-[#16324F] text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {documentsCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
