import React, { useState, useMemo } from 'react';
import {
  FileText,
  Presentation,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Link as LinkIcon,
  Download,
  ExternalLink,
  Trash2,
  Search,
  Filter,
  Plus,
  FolderArchive,
  Layers,
  FileCheck2,
  User,
  Calendar,
  Grid,
  List,
  Eye
} from 'lucide-react';
import {
  EntryRecord,
  ProgramDocument,
  SCHEDULE_DATA,
  getAvatarColor,
  getInitials
} from '../data/scheduleData';
import {
  getDocumentBlob,
  formatBytes
} from '../utils/documentStorage';
import { DocumentUploadModal } from './DocumentUploadModal';
import { AuthUser } from '../hooks/useAuth';

interface DocumentRepositoryTabProps {
  entries: Record<number, EntryRecord>;
  onAddDocument: (week: number, doc: ProgramDocument) => Promise<void>;
  onRemoveDocument: (week: number, docId: string) => Promise<void>;
  onSelectWeek?: (weekNumber: number) => void;
  currentUser?: AuthUser | null;
  onOpenLogin?: () => void;
}

export const DocumentRepositoryTab: React.FC<DocumentRepositoryTabProps> = ({
  entries,
  onAddDocument,
  onRemoveDocument,
  onSelectWeek,
  currentUser,
  onOpenLogin
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedProf, setSelectedProf] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [targetUploadWeek, setTargetUploadWeek] = useState<number | null>(null);

  // Collect all documents across all weeks
  const allDocuments = useMemo(() => {
    const list: (ProgramDocument & {
      weekData: (typeof SCHEDULE_DATA.mondays)[0];
      topicTitle: string;
    })[] = [];

    for (const m of SCHEDULE_DATA.mondays) {
      const entry = entries[m.week];
      if (entry?.documents && entry.documents.length > 0) {
        for (const doc of entry.documents) {
          list.push({
            ...doc,
            weekData: m,
            topicTitle: entry.topic || 'ርዕሰ ጉዳይ አልተመዘገበም'
          });
        }
      }
    }

    return list;
  }, [entries]);

  // Statistics
  const totalDocsCount = allDocuments.length;
  const weeksWithDocs = new Set(allDocuments.map((d) => d.week)).size;
  const presentationsCount = allDocuments.filter((d) => d.type === 'presentation').length;
  const pdfsCount = allDocuments.filter((d) => d.type === 'pdf').length;
  const sheetsCount = allDocuments.filter((d) => d.type === 'excel').length;
  const linksCount = allDocuments.filter((d) => d.type === 'link').length;

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      // Type filter
      if (selectedType !== 'all' && doc.type !== selectedType) {
        return false;
      }

      // Professional filter
      if (selectedProf !== 'all' && doc.weekData.professional !== selectedProf) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = doc.name.toLowerCase();
        const desc = (doc.description || '').toLowerCase();
        const topic = doc.topicTitle.toLowerCase();
        const prof = doc.weekData.professional.toLowerCase();
        const weekStr = `ሳምንት ${doc.week}`;
        if (
          !name.includes(q) &&
          !desc.includes(q) &&
          !topic.includes(q) &&
          !prof.includes(q) &&
          !weekStr.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [allDocuments, selectedType, selectedProf, searchQuery]);

  // Handle open/download document
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

    // If it's a sample document without local binary
    alert(
      `«${doc.name}» የፕሮግራሙ ሰነድ ነው (መጠን፦ ${formatBytes(doc.size)})። አዲስ ፋይሎችን በ «ፋይል ስቀል» አማራጭ በማያያዝ ሙሉ በሙሉ በኮምፒውተርዎ ላይ ማከማቸት ይችላሉ።`
    );
  };

  const handleDeleteDoc = async (week: number, docId: string, name: string, presenter: string) => {
    if (!currentUser) {
      alert('ሰነድ ለማጥፋት እባክዎ እንደ ባለሙያ ወይም እንደ አድሚን ይግቡ።');
      onOpenLogin && onOpenLogin();
      return;
    }

    const canDelete =
      currentUser.role === 'admin' ||
      (currentUser.role === 'professional' && currentUser.professionalName === presenter);

    if (!canDelete) {
      alert(`ይህንን ሰነድ ማጥፋት የሚችሉት ተረኛው ባለሙያ (${presenter}) ወይም አድሚን ብቻ ናቸው።`);
      return;
    }

    if (window.confirm(`«${name}» የሚለውን ሰነድ ከማከማቻው ማጥፋት ይፈልጋሉ?`)) {
      await onRemoveDocument(week, docId);
    }
  };

  const getDocTypeIcon = (type: ProgramDocument['type']) => {
    switch (type) {
      case 'presentation':
        return <Presentation size={18} className="text-amber-700" />;
      case 'pdf':
        return <FileText size={18} className="text-red-700" />;
      case 'word':
        return <FileCode size={18} className="text-blue-700" />;
      case 'excel':
        return <FileSpreadsheet size={18} className="text-emerald-700" />;
      case 'image':
        return <ImageIcon size={18} className="text-purple-700" />;
      case 'link':
        return <LinkIcon size={18} className="text-cyan-700" />;
      default:
        return <FileText size={18} className="text-stone-600" />;
    }
  };

  const getDocTypeBadge = (type: ProgramDocument['type']) => {
    switch (type) {
      case 'presentation':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-[10px] font-bold">ስላይድ (PPT)</span>;
      case 'pdf':
        return <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md text-[10px] font-bold">PDF ሰነድ</span>;
      case 'word':
        return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-[10px] font-bold">ዎርድ (Word)</span>;
      case 'excel':
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold">ኤክሴል (Excel)</span>;
      case 'image':
        return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md text-[10px] font-bold">ምስል</span>;
      case 'link':
        return <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded-md text-[10px] font-bold">የደመና ሊንክ</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md text-[10px] font-bold">ፋይል</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0F2438] flex items-center gap-2">
            <FolderArchive className="text-[#B98A22]" size={24} />
            <span>የፕሮግራም ዶክመንት ማከማቻ (Document Archive)</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            የሁሉም 52 የሰኞ ፕሮግራሞች የማቅረቢያ ስላይዶች፣ ማንዋሎች፣ የስልጠና ሰነዶችና ቃለ-ጉባኤዎች ማዕከል
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              alert('ዶክመንት ለማከማቸት እባክዎ እንደ ባለሙያ ወይም እንደ አድሚን ይግቡ።');
              if (onOpenLogin) onOpenLogin();
              return;
            }
            setTargetUploadWeek(null);
            setIsUploadModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#16324F] text-white hover:bg-[#0F2438] transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>አዲስ ዶክመንት ጨምር</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 mb-1 flex items-center gap-1.5">
            <Layers size={14} className="text-[#16324F]" />
            <span>ጠቅላላ ሰነዶች</span>
          </div>
          <div className="text-2xl font-black text-[#16324F]">{totalDocsCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">በማከማቻው ውስጥ</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 mb-1 flex items-center gap-1.5">
            <FileCheck2 size={14} className="text-[#4C7A62]" />
            <span>የተሸፈኑ ሳምንታት</span>
          </div>
          <div className="text-2xl font-black text-[#4C7A62]">{weeksWithDocs}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">ከ 52 ሳምንት</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 mb-1 flex items-center gap-1.5">
            <Presentation size={14} className="text-amber-700" />
            <span>ማቅረቢያ ስላይዶች</span>
          </div>
          <div className="text-2xl font-black text-amber-700">{presentationsCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">የስልጠና ፓወር ፖይንት</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs">
          <div className="text-xs font-semibold text-stone-500 mb-1 flex items-center gap-1.5">
            <FileText size={14} className="text-red-700" />
            <span>ፒዲኤፍና ማንዋሎች</span>
          </div>
          <div className="text-2xl font-black text-red-700">{pdfsCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">የመመሪያ ሰነዶች</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs col-span-2 sm:col-span-1">
          <div className="text-xs font-semibold text-stone-500 mb-1 flex items-center gap-1.5">
            <LinkIcon size={14} className="text-cyan-700" />
            <span>ደመና / ድረ-ገጽ</span>
          </div>
          <div className="text-2xl font-black text-cyan-700">{linksCount + sheetsCount}</div>
          <div className="text-[11px] text-stone-400 mt-0.5">ሊንክ እና ኤክሴል ፎርማት</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/70 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="በሰነዱ ስም፣ ርዕስ፣ ወይም ባለሙያ ፈልግ..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 focus:border-[#16324F]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
              >
                አጥራ
              </button>
            )}
          </div>

          {/* Doc Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 bg-white cursor-pointer"
            >
              <option value="all">ሁሉም የሰነድ ዓይነቶች</option>
              <option value="pdf">PDF ሰነዶች</option>
              <option value="presentation">የማቅረቢያ ስላይዶች (PPT)</option>
              <option value="word">ዎርድ ሰነዶች (Word)</option>
              <option value="excel">ኤክሴል ሰንጠረዦች (Excel)</option>
              <option value="image">ምስሎች</option>
              <option value="link">የድረ-ገጽ / የደመና ሊንኮች</option>
            </select>
          </div>

          {/* Presenter filter */}
          <div>
            <select
              value={selectedProf}
              onChange={(e) => setSelectedProf(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 bg-white cursor-pointer"
            >
              <option value="all">ሁሉም አቅራቢዎች</option>
              {SCHEDULE_DATA.professionals.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View mode toggle & summary */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <div className="flex items-center gap-2">
            <span>
              የተገኙ ሰነዶች፦ <strong className="text-stone-800">{filteredDocuments.length}</strong>
            </span>
            {(searchQuery || selectedType !== 'all' || selectedProf !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedProf('all');
                }}
                className="text-[#16324F] font-semibold hover:underline cursor-pointer ml-2"
              >
                ማጣሪያዎችን አጽዳ
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-stone-800 shadow-2xs' : 'text-stone-400'
              }`}
              title="የካርድ እይታ"
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-stone-800 shadow-2xs' : 'text-stone-400'
              }`}
              title="የሰንጠረዥ እይታ"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200/70 shadow-xs space-y-3">
          <FolderArchive size={40} className="mx-auto text-stone-300" />
          <h4 className="text-base font-bold text-stone-700">ምንም የተገኘ ዶክመንት የለም</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            የተመረጠውን ማጣሪያ ይቀይሩ ወይም «አዲስ ዶክመንት ጨምር» የሚለውን በመጫን ለፕሮግራሙ ሰነድ ያያይዙ።
          </p>
          <button
            onClick={() => {
              setTargetUploadWeek(null);
              setIsUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#16324F] text-white hover:bg-[#0F2438] cursor-pointer"
          >
            <Plus size={14} />
            <span>ሰነድ አያይዝ</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => {
            const avatarColor = getAvatarColor(doc.weekData.professional);
            const initials = getInitials(doc.weekData.professional);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header: Doc Type & Week Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
                        {getDocTypeIcon(doc.type)}
                      </div>
                      {getDocTypeBadge(doc.type)}
                    </div>

                    <button
                      onClick={() => onSelectWeek && onSelectWeek(doc.week)}
                      className="text-xs font-bold text-[#16324F] bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      title="ወደዚህ ሳምንት መርሐ ግብር ሂድ"
                    >
                      ሳምንት {doc.week}
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-sm font-bold text-stone-900 leading-snug line-clamp-2 mb-1.5">
                    {doc.name}
                  </h4>
                  {doc.description && (
                    <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">
                      {doc.description}
                    </p>
                  )}

                  {/* Program Context / Topic */}
                  <div className="bg-stone-50 rounded-xl p-2.5 mb-3 border border-stone-100">
                    <div className="text-[11px] font-semibold text-stone-700 truncate">
                      ርዕስ፦ {doc.topicTitle}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-stone-500">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {initials}
                      </div>
                      <span className="truncate">{doc.weekData.professional}</span>
                      <span>•</span>
                      <span>
                        {doc.weekData.eth_month} {doc.weekData.eth_day}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400 text-[11px]">
                    {doc.size ? formatBytes(doc.size) : 'የደመና ሰነድ'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        handleDeleteDoc(doc.week, doc.id, doc.name, doc.weekData.professional)
                      }
                      title="ሰነዱን አጥፋ"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>

                    <button
                      onClick={() => handleOpenDoc(doc)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#16324F] text-white hover:bg-[#0F2438] transition-colors cursor-pointer shadow-2xs"
                    >
                      {doc.type === 'link' ? (
                        <>
                          <ExternalLink size={13} />
                          <span>ሊንክ ክፈት</span>
                        </>
                      ) : (
                        <>
                          <Download size={13} />
                          <span>ክፈት / አውርድ</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone-200/70 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#E1EBE4]/80 text-[#0F2438] text-xs font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">የሰነዱ ስም</th>
                  <th className="py-3 px-3">ዓይነት</th>
                  <th className="py-3 px-3">ሳምንት / ቀን</th>
                  <th className="py-3 px-3">አቅራቢ</th>
                  <th className="py-3 px-3">መጠን</th>
                  <th className="py-3 px-4 text-right">ድርጊት</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900 leading-tight">{doc.name}</div>
                      {doc.description && (
                        <div className="text-xs text-stone-400 truncate max-w-xs mt-0.5">
                          {doc.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">{getDocTypeBadge(doc.type)}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#16324F]">ሳምንት {doc.week}</span>
                      <div className="text-xs text-stone-400">
                        {doc.weekData.eth_month} {doc.weekData.eth_day}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-stone-800">{doc.weekData.professional}</span>
                    </td>
                    <td className="py-3 px-3 text-xs text-stone-500">
                      {doc.size ? formatBytes(doc.size) : 'ሊንክ'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDoc(doc)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-[#16324F] text-white hover:bg-[#0F2438] transition-colors cursor-pointer"
                        >
                          {doc.type === 'link' ? <ExternalLink size={12} /> : <Download size={12} />}
                          <span>{doc.type === 'link' ? 'ክፈት' : 'አውርድ'}</span>
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteDoc(doc.week, doc.id, doc.name, doc.weekData.professional)
                          }
                          className="p-1 text-stone-400 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        targetWeek={targetUploadWeek}
        onAddDocument={onAddDocument}
      />
    </div>
  );
};
