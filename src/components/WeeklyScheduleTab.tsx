import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Check,
  X,
  Printer,
  User,
  Users,
  Star,
  MessageSquare,
  Save,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  Presentation,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Trash2,
  Plus,
  Paperclip,
  Lock
} from 'lucide-react';
import {
  SCHEDULE_DATA,
  EntryRecord,
  ProgramDocument,
  getAvatarColor,
  getInitials,
  MondayWeek
} from '../data/scheduleData';
import {
  getDocumentBlob,
  formatBytes
} from '../utils/documentStorage';
import { DocumentUploadModal } from './DocumentUploadModal';
import { AuthUser } from '../hooks/useAuth';

interface WeeklyScheduleTabProps {
  entries: Record<number, EntryRecord>;
  upsert: (week: number, patch: Partial<EntryRecord>) => Promise<void>;
  addDocument?: (week: number, doc: ProgramDocument) => Promise<void>;
  removeDocument?: (week: number, docId: string) => Promise<void>;
  initialSelectedWeek?: number | null;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
}

const STATUS_CONFIG = {
  planned: {
    label: 'ታቅዷል',
    color: '#B98A22',
    bg: '#F7F0E0',
    icon: Clock
  },
  done: {
    label: 'ተጠናቅቋል',
    color: '#4C7A62',
    bg: '#E6F0EC',
    icon: Check
  },
  holiday: {
    label: 'በዓል',
    color: '#AD5A42',
    bg: '#F4E8E4',
    icon: X
  }
};

interface FormState {
  topic?: string;
  status?: 'planned' | 'done' | 'holiday';
  invited?: number | string;
  attended?: number | string;
  feedback?: number | string;
  comment?: string;
}

export const WeeklyScheduleTab: React.FC<WeeklyScheduleTabProps> = ({
  entries,
  upsert,
  addDocument,
  removeDocument,
  initialSelectedWeek,
  currentUser,
  onOpenLogin
}) => {
  const [editingWeek, setEditingWeek] = useState<number | null>(initialSelectedWeek ?? null);
  const [formState, setFormState] = useState<FormState>({});
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);
  const [uploadModalWeek, setUploadModalWeek] = useState<number | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'planned' | 'holiday'>('all');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [showOnlyMyWeeks, setShowOnlyMyWeeks] = useState<boolean>(false);

  const isUserAllowedToEdit = (weekNumber: number) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const weekData = SCHEDULE_DATA.mondays.find((m) => m.week === weekNumber);
    return currentUser.role === 'professional' && currentUser.professionalName === weekData?.professional;
  };

  const startEditing = (week: number) => {
    const weekData = SCHEDULE_DATA.mondays.find((m) => m.week === week);
    if (!currentUser) {
      alert('የሰኞ መርሐ ግብሩን ለመመዝገብ ወይም ለማረም እባክዎ እንደ ባለሙያ ወይም እንደ አድሚን ይግቡ።');
      onOpenLogin();
      return;
    }

    if (!isUserAllowedToEdit(week)) {
      alert(`ይህንን ሳምንት ማረም የሚችሉት ተረኛው ባለሙያ (${weekData?.professional}) ወይም አድሚን ብቻ ናቸው።`);
      return;
    }

    const current = entries[week];
    setFormState({
      topic: current?.topic ?? '',
      status: current?.status ?? 'planned',
      invited: current?.invited ?? 30,
      attended: current?.attended !== null && current?.attended !== undefined ? current.attended : '',
      feedback: current?.feedback !== null && current?.feedback !== undefined ? current.feedback : '',
      comment: current?.comment ?? ''
    });
    setEditingWeek(week);
  };

  const handleOpenUploadForWeek = (week: number) => {
    const weekData = SCHEDULE_DATA.mondays.find((m) => m.week === week);
    if (!currentUser) {
      alert('ዶክመንት ለማያያዝ እባክዎ እንደ ባለሙያ ወይም እንደ አድሚን ይግቡ።');
      onOpenLogin();
      return;
    }

    if (!isUserAllowedToEdit(week)) {
      alert(`ለዚህ ሳምንት ሰነድ ማያያዝ የሚችሉት ተረኛው ባለሙያ (${weekData?.professional}) ወይም አድሚን ብቻ ናቸው።`);
      return;
    }

    setUploadModalWeek(week);
  };

  const cancelEditing = () => {
    setEditingWeek(null);
    setFormState({});
  };

  const saveEditing = async (week: number) => {
    const attendedVal = formState.attended;
    const feedbackVal = formState.feedback;

    const payload: Partial<EntryRecord> = {
      topic: formState.topic ?? '',
      status: formState.status ?? 'planned',
      invited: Number(formState.invited) || 30,
      attended: attendedVal === '' || attendedVal == null ? null : Number(attendedVal),
      feedback: feedbackVal === '' || feedbackVal == null ? null : Number(feedbackVal),
      comment: formState.comment ?? ''
    };

    await upsert(week, payload);
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 1500);
    setEditingWeek(null);
    setFormState({});
  };

  const handleOpenDoc = async (doc: ProgramDocument) => {
    if (doc.type === 'link' && doc.url) {
      window.open(doc.url, '_blank', 'noopener,noreferrer');
      return;
    }

    if (doc.storageKey) {
      const blob = await getDocumentBlob(doc.storageKey);
      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = doc.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
        return;
      }
    }

    alert(`«${doc.name}» የፕሮግራሙ ሰነድ ነው (${formatBytes(doc.size)})።`);
  };

  const handleDeleteDoc = async (week: number, docId: string, name: string) => {
    if (window.confirm(`«${name}» የሚለውን ሰነድ ከዚህ ሳምንት ማጥፋት ይፈልጋሉ?`)) {
      if (removeDocument) {
        await removeDocument(week, docId);
      }
    }
  };

  const getDocTypeIcon = (type: ProgramDocument['type']) => {
    switch (type) {
      case 'presentation':
        return <Presentation size={15} className="text-amber-700" />;
      case 'pdf':
        return <FileText size={15} className="text-red-700" />;
      case 'word':
        return <FileCode size={15} className="text-blue-700" />;
      case 'excel':
        return <FileSpreadsheet size={15} className="text-emerald-700" />;
      case 'image':
        return <ImageIcon size={15} className="text-purple-700" />;
      case 'link':
        return <LinkIcon size={15} className="text-cyan-700" />;
      default:
        return <FileText size={15} className="text-stone-600" />;
    }
  };

  const filteredMondays = useMemo(() => {
    return SCHEDULE_DATA.mondays.filter((m: MondayWeek) => {
      const entry = entries[m.week];
      const status = entry?.status ?? (m.is_holiday ? 'holiday' : 'planned');

      // Status filter
      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }

      // Professional filter
      if (selectedProfessional !== 'all' && m.professional !== selectedProfessional) {
        return false;
      }

      // Show only my weeks (when professional logged in)
      if (showOnlyMyWeeks && currentUser?.role === 'professional') {
        if (m.professional !== currentUser.professionalName) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const topic = (entry?.topic || '').toLowerCase();
        const prof = m.professional.toLowerCase();
        const dateStr = `${m.eth_month} ${m.eth_day}`.toLowerCase();
        const weekNum = `ሳምንት ${m.week}`;
        if (!topic.includes(q) && !prof.includes(q) && !dateStr.includes(q) && !weekNum.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [entries, statusFilter, selectedProfessional, searchQuery, showOnlyMyWeeks, currentUser]);

  const myAssignedCount = useMemo(() => {
    if (!currentUser || currentUser.role !== 'professional') return 0;
    return SCHEDULE_DATA.mondays.filter((m) => m.professional === currentUser.professionalName).length;
  }, [currentUser]);

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
        <div>
          <h2 className="text-xl font-bold text-[#0F2438]">ሳምንታዊ መርሐ ግብር</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            የእያንዳንዱ ሳምንት ዝርዝር መረጃ፣ የርዕሰ ጉዳይ ማቅረቢያና የተሳታፊዎች ምዝገባ
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span
            className={`text-sm text-[#4C7A62] font-semibold flex items-center gap-1 transition-opacity duration-300 ${
              showSavedFeedback ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <CheckCircle2 size={16} /> ተቀምጧል
          </span>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-[#16324F] text-white hover:bg-[#0F2438] transition-colors shadow-xs cursor-pointer"
          >
            <Printer size={15} />
            <span>ማተም</span>
          </button>
        </div>
      </div>

      {/* Professional Welcome Banner */}
      {currentUser?.role === 'professional' && (
        <div className="bg-gradient-to-r from-amber-50/90 via-white to-amber-50/40 border border-[#B98A22]/35 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs no-print">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              {getInitials(currentUser.name)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 leading-tight">
                እንኳን ደህና መጡ {currentUser.name}!
              </h4>
              <p className="text-xs text-stone-600 mt-0.5">
                በዚህ ዓመት <strong className="text-[#16324F]">{myAssignedCount}</strong> ሳምንታት ተመድበውልዎታል፤ ርዕስዎን መመዝገብ፣ ሰነዶችን ማያያዝ ይችላሉ።
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowOnlyMyWeeks(!showOnlyMyWeeks)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs self-end sm:self-auto ${
              showOnlyMyWeeks
                ? 'bg-[#16324F] text-white'
                : 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50'
            }`}
          >
            <span>{showOnlyMyWeeks ? '✓ የእኔ ሳምንታት ብቻ (ነቅቷል)' : `የእኔ ተረኛ ሳምንታት ብቻ (${myAssignedCount})`}</span>
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs space-y-3 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="በርዕስ፣ በባለሙያ ወይም በሳምንት ፈልግ..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 focus:border-[#16324F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                አጥራ
              </button>
            )}
          </div>

          {/* Professional select */}
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 focus:border-[#16324F] bg-white appearance-none cursor-pointer"
            >
              <option value="all">ሁሉም ባለሙያዎች (ተረኞች)</option>
              {SCHEDULE_DATA.professionals.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} — {p.role}
                </option>
              ))}
            </select>
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-stone-500 mr-1 flex items-center gap-1">
              <Filter size={13} /> ሁኔታ፦
            </span>
            {[
              { id: 'all', label: 'ሁሉም' },
              { id: 'done', label: 'ተጠናቅቋል' },
              { id: 'planned', label: 'ታቅዷል' },
              { id: 'holiday', label: 'በዓል' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-[#16324F] text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Summary */}
        {(searchQuery || statusFilter !== 'all' || selectedProfessional !== 'all') && (
          <div className="flex items-center justify-between text-xs text-stone-500 pt-1 border-t border-stone-100">
            <span>
              የተገኙ ሰኞዎች፦ <strong className="text-stone-800">{filteredMondays.length}</strong> ከ {SCHEDULE_DATA.total_weeks}
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setSelectedProfessional('all');
              }}
              className="text-[#16324F] hover:underline font-medium cursor-pointer"
            >
              ሁሉንም ማጣሪያዎች አጽዳ
            </button>
          </div>
        )}
      </div>

      {/* Week Cards List */}
      <div className="space-y-3.5">
        {filteredMondays.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/70 shadow-xs">
            <p className="text-stone-500 text-sm">ከተመረጠው ማጣሪያ ጋር የሚስማማ የሰኞ ፕሮግራም አልተገኘም።</p>
          </div>
        ) : (
          filteredMondays.map((m) => {
            const entry = entries[m.week];
            const isEditing = editingWeek === m.week;
            const currentStatus = entry?.status ?? (m.is_holiday ? 'holiday' : 'planned');
            const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.planned;
            const StatusIcon = statusConfig.icon;

            // Special holiday default card display (if week is holiday and not customized)
            if (m.is_holiday && !entry && !isEditing) {
              return (
                <div
                  key={m.week}
                  className="bg-red-50/80 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                      <AlertCircle size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                          ሳምንት {m.week}
                        </span>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs font-semibold text-stone-700">
                          {m.eth_month} {m.eth_day}፣ {m.eth_year} ዓ.ም. ({m.greg})
                        </span>
                        <span className="text-xs text-stone-400">·</span>
                        <span className="text-xs text-stone-600">ተረኛ፦ {m.professional}</span>
                      </div>
                      <div className="text-sm font-medium text-red-900">
                        {SCHEDULE_DATA.holiday_reason}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => startEditing(m.week)}
                    className="no-print px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors"
                  >
                    አርም
                  </button>
                </div>
              );
            }

            return (
              <div
                key={m.week}
                className={`bg-white rounded-2xl border transition-all shadow-xs ${
                  isEditing
                    ? 'border-[#16324F] ring-2 ring-[#16324F]/10 shadow-md'
                    : 'border-stone-200/70 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-stretch">
                  {/* Left Column: Week Number Tag */}
                  <div
                    className="sm:w-16 flex-shrink-0 flex sm:flex-col items-center justify-between sm:justify-center p-3.5 sm:py-5 text-white rounded-t-2xl sm:rounded-t-none sm:rounded-l-2xl"
                    style={{ backgroundColor: statusConfig.color }}
                  >
                    <div className="text-xl sm:text-2xl font-black">{m.week}</div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold opacity-90 sm:mt-1">
                      ሳምንት
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Meta Tags Row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-2xs"
                            style={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color
                            }}
                          >
                            <StatusIcon size={12} />
                            {statusConfig.label}
                          </span>

                          {m.is_join && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              ጳጉሜ → መስከረም ዙር
                            </span>
                          )}

                          {entry?.documents && entry.documents.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                              <Paperclip size={11} className="text-[#B98A22]" />
                              {entry.documents.length} ሰነዶች
                            </span>
                          )}

                          <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                            <Calendar size={13} className="text-stone-400" />
                            {m.eth_month} {m.eth_day}፣ {m.eth_year} ዓ.ም.
                            <span className="text-stone-400">({m.greg})</span>
                          </span>
                        </div>

                        {/* Presentation Topic Title */}
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 mb-1 leading-snug">
                          {entry?.topic || (
                            <span className="text-stone-400 font-normal italic">
                              ርዕሰ ጉዳይ ገና አልተወሰነም
                            </span>
                          )}
                        </h3>

                        {/* Presenter Profile Badge */}
                        <div className="flex items-center gap-2.5 mt-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-2xs"
                            style={{ backgroundColor: getAvatarColor(m.professional) }}
                          >
                            {getInitials(m.professional)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-stone-800">
                              {m.professional}
                            </div>
                            <div className="text-xs text-stone-400 flex items-center gap-1">
                              <User size={11} />
                              <span>ተረኛ አቅራቢ</span>
                            </div>
                          </div>
                        </div>

                        {/* Attendance, Rating & Notes summary (if recorded) */}
                        {entry && (entry.attended != null || entry.feedback != null) && (
                          <div className="flex items-center gap-5 mt-3 pt-3 border-t border-stone-100 text-xs sm:text-sm">
                            {entry.attended != null && (
                              <div className="flex items-center gap-1.5 text-stone-700">
                                <Users size={15} className="text-stone-400" />
                                <span className="font-bold text-stone-900">{entry.attended}</span>
                                <span className="text-xs text-stone-400">
                                  / {entry.invited ?? 30} ተሳታፊ
                                </span>
                              </div>
                            )}

                            {entry.feedback != null && (
                              <div className="flex items-center gap-1.5 text-stone-700">
                                <Star size={15} className="text-amber-500 fill-amber-500" />
                                <span className="font-bold text-stone-900">
                                  {Number(entry.feedback).toFixed(1)}
                                </span>
                                <span className="text-xs text-stone-400">ከ 5</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Comment Notes */}
                        {entry?.comment && (
                          <div className="flex items-start gap-1.5 mt-2.5 text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-100">
                            <MessageSquare size={13} className="mt-0.5 text-stone-400 flex-shrink-0" />
                            <span className="italic">{entry.comment}</span>
                          </div>
                        )}

                        {/* Program Documents & Materials Section */}
                        <div className="mt-3.5 pt-3 border-t border-stone-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                              <Paperclip size={13} className="text-[#B98A22]" />
                              <span>የፕሮግራሙ ዶክመንቶች ({entry?.documents?.length || 0})</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => handleOpenUploadForWeek(m.week)}
                              className="no-print text-xs font-bold text-[#16324F] hover:text-[#0F2438] flex items-center gap-1 cursor-pointer bg-stone-50 hover:bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200 transition-colors"
                            >
                              <Plus size={13} />
                              <span>ዶክመንት አያይዝ</span>
                            </button>
                          </div>

                          {entry?.documents && entry.documents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                              {entry.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/60 hover:bg-stone-100/70 transition-all text-xs"
                                >
                                  <div className="flex items-center gap-2 min-w-0 mr-2">
                                    <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center flex-shrink-0">
                                      {getDocTypeIcon(doc.type)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-semibold text-stone-800 truncate" title={doc.name}>
                                        {doc.name}
                                      </div>
                                      <div className="text-[10px] text-stone-400">
                                        {doc.size ? formatBytes(doc.size) : 'የደመና ሊንክ'}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 flex-shrink-0 no-print">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenDoc(doc)}
                                      title={doc.type === 'link' ? 'ሊንክ ክፈት' : 'አውርድ'}
                                      className="p-1 rounded-md text-stone-600 hover:text-[#16324F] hover:bg-white cursor-pointer"
                                    >
                                      {doc.type === 'link' ? <ExternalLink size={13} /> : <Download size={13} />}
                                    </button>
                                    {removeDocument && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDoc(m.week, doc.id, doc.name)}
                                        title="ሰርዝ"
                                        className="p-1 rounded-md text-stone-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[11px] text-stone-400 italic">
                              የተያያዘ ሰነድ የለም — «ዶክመንት አያይዝ» የሚለውን በመጫን ፋይል ወይም ሊንክ ማከል ይችላሉ።
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="no-print self-end sm:self-start">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={cancelEditing}
                              className="px-3 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                            >
                              ሰርዝ
                            </button>
                            <button
                              onClick={() => saveEditing(m.week)}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#4C7A62] text-white hover:bg-[#3D6450] transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Save size={14} />
                              <span>አስቀምጥ</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(m.week)}
                            className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-[#16324F] hover:text-white transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            {!isUserAllowedToEdit(m.week) && <Lock size={12} className="text-stone-400" />}
                            <span>አርም / መዝግብ</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline Edit Form */}
                    {isEditing && (
                      <div className="mt-5 pt-4 border-t border-stone-200 space-y-4 bg-stone-50/70 p-4 rounded-xl border">
                        {/* Topic Input */}
                        <div>
                          <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                            የርዕሰ ጉዳይ ስም
                          </label>
                          <input
                            type="text"
                            value={formState.topic ?? ''}
                            onChange={(e) => setFormState({ ...formState, topic: e.target.value })}
                            placeholder="የሚቀርበውን ርዕሰ ጉዳይ እዚህ ያስገቡ..."
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 focus:border-[#16324F] bg-white"
                          />
                        </div>

                        {/* Status Select Buttons */}
                        <div>
                          <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                            የፕሮግራሙ ሁኔታ
                          </label>
                          <div className="flex gap-2">
                            {(Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]).map((key) => {
                              const cfg = STATUS_CONFIG[key];
                              const Icon = cfg.icon;
                              const isSelected = formState.status === key;
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setFormState({ ...formState, status: key })}
                                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                  style={
                                    isSelected
                                      ? { backgroundColor: cfg.color, color: '#ffffff' }
                                      : { backgroundColor: cfg.bg, color: cfg.color }
                                  }
                                >
                                  <Icon size={13} />
                                  {cfg.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3-Column Inputs: Invited, Attended, Feedback */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-stone-700 mb-1 block">
                              የተጋበዙ ብዛት
                            </label>
                            <input
                              type="number"
                              value={formState.invited ?? ''}
                              onChange={(e) =>
                                setFormState({ ...formState, invited: Number(e.target.value) })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 bg-white"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-700 mb-1 block">
                              የመጡ ተሳታፊዎች
                            </label>
                            <input
                              type="number"
                              value={formState.attended ?? ''}
                              onChange={(e) =>
                                setFormState({
                                  ...formState,
                                  attended: e.target.value === '' ? ('' as unknown as number) : Number(e.target.value)
                                })
                              }
                              placeholder="ምሳሌ፡ 8"
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 bg-white"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-semibold text-stone-700 mb-1 block">
                              የእርካታ ግምገማ (1 - 5)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              min="1"
                              max="5"
                              value={formState.feedback ?? ''}
                              onChange={(e) =>
                                setFormState({
                                  ...formState,
                                  feedback: e.target.value === '' ? ('' as unknown as number) : Number(e.target.value)
                                })
                              }
                              placeholder="ምሳሌ፡ 4.5"
                              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 bg-white"
                            />
                          </div>
                        </div>

                        {/* Comment Notes */}
                        <div>
                          <label className="text-xs font-semibold text-stone-700 mb-1 block">
                            ተጨማሪ አስተያየት ወይም ማስታወሻ
                          </label>
                          <textarea
                            value={formState.comment ?? ''}
                            onChange={(e) => setFormState({ ...formState, comment: e.target.value })}
                            rows={2}
                            placeholder="ስለ ስልጠናው ሂደት፣ የተነሱ ጥያቄዎች ወይም ማሻሻያ አስተያየቶች..."
                            className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 bg-white resize-none"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-4 py-2 rounded-xl text-xs font-medium bg-stone-200 text-stone-700 hover:bg-stone-300 transition-colors"
                          >
                            ተመለስ
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEditing(m.week)}
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4C7A62] text-white hover:bg-[#3D6450] transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Save size={14} />
                            <span>ለውጡን አስቀምጥ</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalWeek !== null}
        onClose={() => setUploadModalWeek(null)}
        targetWeek={uploadModalWeek}
        onAddDocument={async (w, doc) => {
          if (addDocument) {
            await addDocument(w, doc);
          }
        }}
      />
    </div>
  );
};
