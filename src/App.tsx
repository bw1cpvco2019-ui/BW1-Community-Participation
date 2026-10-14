/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useEntries } from './hooks/useEntries';
import { useAuth } from './hooks/useAuth';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardTab } from './components/DashboardTab';
import { WeeklyScheduleTab } from './components/WeeklyScheduleTab';
import { CalendarTab } from './components/CalendarTab';
import { ProfessionalsTab } from './components/ProfessionalsTab';
import { DocumentRepositoryTab } from './components/DocumentRepositoryTab';
import { LoginModal } from './components/LoginModal';
import { SCHEDULE_DATA } from './data/scheduleData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [targetWeek, setTargetWeek] = useState<number | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const {
    entries,
    loading,
    error,
    isSavedRecently,
    upsert,
    addDocument,
    removeDocument,
    resetToDefault,
    exportToJson,
    importFromJson
  } = useEntries();

  const {
    currentUser,
    loginAdmin,
    loginProfessional,
    quickLoginProfessional,
    logout
  } = useAuth();

  const handleSelectWeek = (weekNumber: number) => {
    setTargetWeek(weekNumber);
    setActiveTab('weekly');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalDocumentsCount = Object.values(entries).reduce(
    (acc, curr) => acc + (curr.documents?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-[#B98A22]/20 selection:text-[#0F2438]">
      {/* Municipal Branding & Title Header */}
      <Header
        isSavedRecently={isSavedRecently}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={logout}
        onExport={exportToJson}
        onImport={importFromJson}
        onReset={resetToDefault}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setTargetWeek(null);
        }}
        totalWeeks={SCHEDULE_DATA.total_weeks}
        documentsCount={totalDocumentsCount}
      />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-9 h-9 border-3 border-stone-200 border-t-[#16324F] rounded-full animate-spin" />
            <span className="text-xs text-stone-500 font-medium">የሰኞ ፕሮግራሞች እየተጫኑ ነው...</span>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 mb-6 flex items-center justify-between">
            <span>ማስታወሻ፦ {error}</span>
          </div>
        )}

        {!loading && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                entries={entries}
                onSelectWeek={handleSelectWeek}
              />
            )}

            {activeTab === 'weekly' && (
              <WeeklyScheduleTab
                entries={entries}
                upsert={upsert}
                addDocument={addDocument}
                removeDocument={removeDocument}
                initialSelectedWeek={targetWeek}
                currentUser={currentUser}
                onOpenLogin={() => setIsLoginModalOpen(true)}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarTab
                entries={entries}
                onSelectWeek={handleSelectWeek}
              />
            )}

            {activeTab === 'professionals' && (
              <ProfessionalsTab
                entries={entries}
                onSelectWeek={handleSelectWeek}
              />
            )}

            {activeTab === 'repository' && (
              <DocumentRepositoryTab
                entries={entries}
                onAddDocument={addDocument}
                onRemoveDocument={removeDocument}
                onSelectWeek={handleSelectWeek}
                currentUser={currentUser}
                onOpenLogin={() => setIsLoginModalOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Municipal Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 text-center mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs text-stone-500 font-medium">
            ወርቃማ ሰኞ · የዕውቀት ሽግግር ፕሮግራም — ሙሉ ዓመት የሰኞ ምሽት ስልጠና መክበብ
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            ቦሌ ክፍለ ከተማ ወረዳ 01 የህብረተሰብ ተሳትፎና በጎ ፈቃድ ማስተባበሪያ ጽ/ቤት
          </p>
        </div>
      </footer>

      {/* Login Modal for Admin and Professionals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginAdmin={loginAdmin}
        onLoginProfessional={loginProfessional}
        onQuickLoginProfessional={quickLoginProfessional}
      />
    </div>
  );
}
