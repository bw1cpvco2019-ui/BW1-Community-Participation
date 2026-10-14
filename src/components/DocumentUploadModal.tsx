import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Link as LinkIcon,
  FileText,
  Presentation,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  ProgramDocument,
  SCHEDULE_DATA
} from '../data/scheduleData';
import {
  saveDocumentBlob,
  detectDocType,
  formatBytes
} from '../utils/documentStorage';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWeek: number | null;
  onAddDocument: (week: number, doc: ProgramDocument) => Promise<void>;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  targetWeek,
  onAddDocument
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
  const [selectedWeek, setSelectedWeek] = useState<number>(targetWeek || 1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState<string>('');
  const [docType, setDocType] = useState<ProgramDocument['type']>('pdf');
  const [description, setDescription] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentWeekInfo = SCHEDULE_DATA.mondays.find((m) => m.week === (targetWeek || selectedWeek));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name);
      const detected = detectDocType(file.name, file.type);
      setDocType(detected);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDocName(file.name);
      const detected = detectDocType(file.name, file.type);
      setDocType(detected);
      setErrorMsg(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const weekToUse = targetWeek || selectedWeek;
    if (!weekToUse) {
      setErrorMsg('እባክዎ ሳምንቱን ይምረጡ');
      return;
    }

    if (activeTab === 'upload') {
      if (!selectedFile) {
        setErrorMsg('እባክዎ የሚጫን ፋይል ይምረጡ');
        return;
      }
      if (!docName.trim()) {
        setErrorMsg('እባክዎ የሰነዱን ስም ያስገቡ');
        return;
      }

      setIsSubmitting(true);
      try {
        const docId = `doc-w${weekToUse}-${Date.now()}`;
        // Store binary in IndexedDB
        await saveDocumentBlob(docId, selectedFile);

        const newDoc: ProgramDocument = {
          id: docId,
          name: docName.trim(),
          size: selectedFile.size,
          type: docType,
          mimeType: selectedFile.type,
          uploadedAt: new Date().toISOString(),
          week: weekToUse,
          description: description.trim() || undefined,
          storageKey: docId
        };

        await onAddDocument(weekToUse, newDoc);
        onClose();
        resetForm();
      } catch (err: unknown) {
        console.error(err);
        setErrorMsg('ፋይሉን ማከማቸት አልተቻለም። እባክዎ እንደገና ይሞክሩ።');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Link mode
      if (!docName.trim()) {
        setErrorMsg('እባክዎ የሰነዱን ወይም የቪዲዮውን ርዕስ ያስገቡ');
        return;
      }
      if (!linkUrl.trim() || !linkUrl.startsWith('http')) {
        setErrorMsg('እባክዎ ትክክለኛ የድረ-ገጽ አድራሻ (http:// ወይም https:// የሚጀምር) ያስገቡ');
        return;
      }

      setIsSubmitting(true);
      try {
        const docId = `link-w${weekToUse}-${Date.now()}`;
        const newDoc: ProgramDocument = {
          id: docId,
          name: docName.trim(),
          type: 'link',
          uploadedAt: new Date().toISOString(),
          week: weekToUse,
          description: description.trim() || undefined,
          url: linkUrl.trim()
        };

        await onAddDocument(weekToUse, newDoc);
        onClose();
        resetForm();
      } catch (err: unknown) {
        console.error(err);
        setErrorMsg('ሊንኩን ማያያዝ አልተቻለም።');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setDocName('');
    setDocType('pdf');
    setDescription('');
    setLinkUrl('');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200 animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#16324F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B98A22] text-[#0F2438] flex items-center justify-center shadow-xs">
              <UploadCloud size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">የፕሮግራም ዶክመንት ማከማቻ</h3>
              <p className="text-xs text-white/70">
                {targetWeek
                  ? `ለሳምንት ${targetWeek} — ${currentWeekInfo?.professional || ''} ሰነድ ማያያዣ`
                  : 'ለተመረጠው የሰኞ ፕሮግራም ሰነድ ወይም ፋይል ማያያዣ'}
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

        {/* Tab Switcher: Upload File vs Web Link */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMsg(null);
            }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#B98A22] text-[#16324F]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <UploadCloud size={15} />
            <span>ፋይል ከኮምፒውተር ስቀል</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('link');
              setErrorMsg(null);
            }}
            className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'link'
                ? 'border-[#B98A22] text-[#16324F]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <LinkIcon size={15} />
            <span>የደመና / ድረ-ገጽ ሊንክ አያይዝ</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Week Selector (if not pre-locked to a specific week) */}
          {!targetWeek && (
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                የሚቀርብበት የሰኞ ሳምንት ምረጥ
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 bg-white"
              >
                {SCHEDULE_DATA.mondays.map((m) => (
                  <option key={m.week} value={m.week}>
                    ሳምንት {m.week} — {m.eth_month} {m.eth_day} ({m.professional})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'upload' ? (
            <>
              {/* Drag & Drop Zone */}
              <div>
                <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                  ፋይል ምረጥ (PDF፣ PowerPoint፣ Word፣ Excel፣ ምስል)
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    selectedFile
                      ? 'border-[#4C7A62] bg-emerald-50/40'
                      : 'border-stone-300 hover:border-[#16324F] bg-stone-50/50 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.pptx,.ppt,.docx,.doc,.xlsx,.xls,.csv,.png,.jpg,.jpeg,.txt"
                  />

                  {selectedFile ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#4C7A62] flex items-center justify-center mb-2">
                        <Check size={24} />
                      </div>
                      <span className="text-sm font-bold text-stone-800 break-all">
                        {selectedFile.name}
                      </span>
                      <span className="text-xs text-stone-500 mt-0.5">
                        {formatBytes(selectedFile.size)}
                      </span>
                      <span className="text-[11px] text-[#16324F] mt-2 underline">
                        ሌላ ፋይል ለመቀየር እዚህ ይጫኑ
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center mb-2">
                        <UploadCloud size={24} />
                      </div>
                      <span className="text-sm font-semibold text-stone-700">
                        ፋይሉን እዚህ ይጎትቱ ወይም ለመምረጥ ይጫኑ
                      </span>
                      <span className="text-xs text-stone-400 mt-1">
                        PDF, PPTX, DOCX, XLSX, ምስሎች እስከ 50MB
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Name */}
              <div>
                <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                  የሰነዱ ስም
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="ምሳሌ፡ የደንበኞች አያያዝ ስልጠና ስላይድ..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20"
                />
              </div>

              {/* Document Type Selector */}
              <div>
                <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                  የሰነድ ዓይነት
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'pdf', label: 'PDF ሰነድ', icon: FileText },
                    { id: 'presentation', label: 'ስላይድ (PPT)', icon: Presentation },
                    { id: 'word', label: 'ዎርድ (Word)', icon: FileCode },
                    { id: 'excel', label: 'ኤክሴል (Excel)', icon: FileSpreadsheet },
                    { id: 'image', label: 'ምስል (Image)', icon: ImageIcon }
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = docType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setDocType(t.id as any)}
                        className={`p-2 rounded-xl text-xs font-medium flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#16324F] text-white border-[#16324F] shadow-xs'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-[10px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Web link input */}
              <div>
                <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                  የሰነዱ ወይም የቪዲዮው ርዕስ
                </label>
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="ምሳሌ፡ የጉግል ድራይቭ ሰነዶች ማህደር፣ ቪዲዮ..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
                  የድረ-ገጽ አድራሻ (URL)
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://drive.google.com/... ወይም https://..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  የጉግል ድራይቭ (Google Drive)፣ ዋን ድራይቭ፣ ዩቲዩብ ወይም የድረ-ገጽ ሊንክ ማስገባት ይችላሉ
                </span>
              </div>
            </>
          )}

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-stone-700 mb-1.5 block">
              ማብራሪያ ወይም ይዘት (አማራጭ)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="ስለ ሰነዱ አጭር ማስታወሻ ወይም የተካተቱ ነጥቦች..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#16324F]/20 resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              ሰርዝ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#16324F] text-white hover:bg-[#0F2438] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>እየተቀመጠ ነው...</span>
              ) : (
                <>
                  <UploadCloud size={14} />
                  <span>ሰነዱን አከማች</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
