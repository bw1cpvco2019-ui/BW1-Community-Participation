export interface MondayWeek {
  week: number;
  greg: string; // YYYY-MM-DD
  eth_month: string;
  eth_day: number;
  eth_year: number;
  professional: string;
  is_holiday: boolean;
  is_join?: boolean;
}

export interface Professional {
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

export interface MonthSegment {
  name: string;
  year: number;
  start_greg: string;
  length: number;
  start_weekday: number; // 0 = Monday, ..., 6 = Sunday
}

export interface ProgramDocument {
  id: string;
  name: string;
  size?: number; // bytes
  type: 'pdf' | 'presentation' | 'word' | 'excel' | 'image' | 'link' | 'other';
  mimeType?: string;
  uploadedAt: string;
  week: number;
  description?: string;
  url?: string; // external link if type === 'link'
  storageKey?: string; // key in IndexedDB for file blob
}

export interface EntryRecord {
  week: number;
  topic?: string;
  status: 'planned' | 'done' | 'holiday';
  invited?: number;
  attended?: number | null;
  feedback?: number | null;
  comment?: string;
  updated_at?: string;
  documents?: ProgramDocument[];
}

export const INITIAL_ENTRIES: Record<number, EntryRecord> = {
  1: {
    week: 1,
    topic: "አገልግሎት አሰጣት",
    status: "done",
    invited: 8,
    attended: 6,
    feedback: 5,
    comment: "",
    updated_at: "2026-09-04T16:47:54.52+00:00",
    documents: [
      {
        id: "doc-w1-1",
        name: "የአገልግሎት አሰጣጥ ስታንዳርድ እና ማንዋል.pdf",
        size: 1420000,
        type: "pdf",
        uploadedAt: "2026-09-04T16:50:00.000Z",
        week: 1,
        description: "የደንበኞች አገልግሎት አሰጣጥ መሰረታዊ መመሪያ ሰነድ"
      },
      {
        id: "doc-w1-2",
        name: "የአገልግሎት አሰጣጥ ስላይድ ማቅረቢያ.pptx",
        size: 3200000,
        type: "presentation",
        uploadedAt: "2026-09-04T16:52:00.000Z",
        week: 1,
        description: "በስልጠናው ወቅት የቀረበ የፓወር ፖይንት ሰነድ"
      }
    ]
  },
  2: {
    week: 2,
    topic: "የብሎክ አደረጃጀት እና መለሶ ማጠናከር",
    status: "done",
    invited: 8,
    attended: 6,
    feedback: 4.5,
    comment: "",
    updated_at: "2026-09-04T18:47:32.596+00:00",
    documents: [
      {
        id: "doc-w2-1",
        name: "የህብረተሰብ ተሳትፎ የብሎክ አደረጃጀት መመሪያ.pdf",
        size: 2150000,
        type: "pdf",
        uploadedAt: "2026-09-04T18:48:00.000Z",
        week: 2,
        description: "የቦሌ ወረዳ 01 የብሎኮች ማጠናከሪያ መመሪያ"
      }
    ]
  },
  3: {
    week: 3,
    topic: "የተግባቦት መርህ",
    status: "done",
    invited: 8,
    attended: 6,
    feedback: 4.5,
    comment: "",
    updated_at: "2026-09-04T18:48:50.692+00:00"
  },
  4: {
    week: 4,
    topic: "ተሞክሮ",
    status: "done",
    invited: 8,
    attended: 5,
    feedback: 4,
    comment: "",
    updated_at: "2026-09-04T18:49:38.196+00:00"
  },
  5: {
    week: 5,
    topic: "በቴክኖሎጂ ማዘመን",
    status: "done",
    invited: 8,
    attended: 7,
    feedback: 5,
    comment: "",
    updated_at: "2026-09-04T18:50:25.876+00:00",
    documents: [
      {
        id: "doc-w5-1",
        name: "በቴክኖሎጂ ማዘመንና የዲጂታል አሰራር ስልጠና.pptx",
        size: 4500000,
        type: "presentation",
        uploadedAt: "2026-09-04T18:50:40.000Z",
        week: 5,
        description: "የቢሮ አሰራርን በቴክኖሎጂ ለማዘመን የተዘጋጀ ስላይድ"
      }
    ]
  },
  6: {
    week: 6,
    topic: "የቅየሳ ምንነት",
    status: "done",
    invited: 8,
    attended: 7,
    feedback: 4.5,
    comment: "",
    updated_at: "2026-09-04T18:51:26.844+00:00"
  },
  7: {
    week: 7,
    topic: "የበጎ ፈቃድ መርሆች",
    status: "done",
    invited: 8,
    attended: 6,
    feedback: 4.5,
    comment: "",
    updated_at: "2026-09-04T18:52:20.548+00:00",
    documents: [
      {
        id: "doc-w7-1",
        name: "የበጎ ፈቃድ አገልግሎት መመሪያና ፖሊሲ.pdf",
        size: 1850000,
        type: "pdf",
        uploadedAt: "2026-09-04T18:52:30.000Z",
        week: 7,
        description: "የበጎ ፈቃድ አስተባባሪዎች መመሪያ ሰነድ"
      }
    ]
  },
  8: {
    week: 8,
    topic: "የእውቀት ሽግግር ማካፈል",
    status: "done",
    invited: 9,
    attended: 7,
    feedback: 4.5,
    comment: "",
    updated_at: "2026-09-04T18:53:31.98+00:00"
  },
  9: {
    week: 9,
    topic: "የማንሰራራት ቀን",
    status: "done",
    invited: 15,
    attended: 10,
    feedback: 5,
    comment: "",
    updated_at: "2026-09-07T14:07:46.745+00:00"
  },
  10: {
    week: 10,
    topic: "የእለት ውሎ ምዝገባ",
    status: "done",
    invited: 9,
    attended: 7,
    feedback: 4.5,
    comment: "",
    updated_at: "2026-09-16T19:40:23.77+00:00",
    documents: [
      {
        id: "doc-w10-1",
        name: "የእለት ውሎ መመዝገቢያ ፎርማት.xlsx",
        size: 89000,
        type: "excel",
        uploadedAt: "2026-09-16T19:41:00.000Z",
        week: 10,
        description: "የሰራተኞች የእለት ተእለት ተግባራት መከታተያ ፎርም"
      }
    ]
  },
  11: {
    week: 11,
    topic: "ስነ ምግባር",
    status: "done",
    invited: 9,
    attended: 8,
    feedback: 4.5,
    comment: "",
    updated_at: "2026-09-21T14:52:44.498+00:00"
  },
  12: {
    week: 12,
    topic: "ተሞክሮ (የለውጥ ዝግጅት)",
    status: "done",
    invited: 9,
    attended: 8,
    feedback: 4,
    comment: "",
    updated_at: "2026-10-06T20:29:31.583+00:00"
  },
  13: {
    week: 13,
    topic: "ሙያዊ እውቀት 90 (ስታንዳርድ አፈጻጸም ሪፖርት ስልት)",
    status: "done",
    invited: 10,
    attended: 7,
    feedback: 5,
    comment: "ጊዜውን የጠበቀ ስልጠና ነው በዚሁ ይቀጥል።",
    updated_at: "2026-10-06T20:31:37.711+00:00",
    documents: [
      {
        id: "doc-w13-1",
        name: "የስታንዳርድ አፈጻጸም ሪፖርት አቀራረብ ስልት.pdf",
        size: 2600000,
        type: "pdf",
        uploadedAt: "2026-10-06T20:32:00.000Z",
        week: 13,
        description: "የሪፖርት አዘገጃጀት እና የስታንዳርድ አፈጻጸም መመሪያ"
      }
    ]
  },
  14: {
    week: 14,
    topic: "አገልግሎት አሰጣጥ",
    status: "done",
    invited: 30,
    attended: 8,
    feedback: 4.5,
    comment: "",
    updated_at: "2026-10-06T14:37:23.052+00:00"
  }
};

export const SCHEDULE_DATA = {
  mondays: [
    { week: 1, greg: "2026-07-13", eth_month: "ሐምሌ", eth_day: 6, eth_year: 2018, professional: "ስመኝ ቡኑ", is_holiday: false, is_join: false },
    { week: 2, greg: "2026-07-20", eth_month: "ሐምሌ", eth_day: 13, eth_year: 2018, professional: "አብዲሳ ጫላ", is_holiday: false, is_join: false },
    { week: 3, greg: "2026-07-27", eth_month: "ሐምሌ", eth_day: 20, eth_year: 2018, professional: "ደሞዜ በቀለ", is_holiday: false, is_join: false },
    { week: 4, greg: "2026-08-03", eth_month: "ሐምሌ", eth_day: 27, eth_year: 2018, professional: "የምስራች መኮንን", is_holiday: false, is_join: false },
    { week: 5, greg: "2026-08-10", eth_month: "ነሐሴ", eth_day: 4, eth_year: 2018, professional: "ግዛቸው በቀለ ባልቻ", is_holiday: false, is_join: false },
    { week: 6, greg: "2026-08-17", eth_month: "ነሐሴ", eth_day: 11, eth_year: 2018, professional: "ታሪኬ ወዳጆ", is_holiday: false, is_join: false },
    { week: 7, greg: "2026-08-24", eth_month: "ነሐሴ", eth_day: 18, eth_year: 2018, professional: "አዱኔ ሀይሉ", is_holiday: false, is_join: false },
    { week: 8, greg: "2026-08-31", eth_month: "ነሐሴ", eth_day: 25, eth_year: 2018, professional: "ሚልኪያስ አመሀ", is_holiday: false, is_join: false },
    { week: 9, greg: "2026-09-07", eth_month: "ጳጉሜ", eth_day: 2, eth_year: 2018, professional: "ሚሊዮን ከበደ", is_holiday: false, is_join: true },
    { week: 10, greg: "2026-09-14", eth_month: "መስከረም", eth_day: 4, eth_year: 2019, professional: "አብዲሳ ጫላ", is_holiday: false, is_join: false },
    { week: 11, greg: "2026-09-21", eth_month: "መስከረም", eth_day: 11, eth_year: 2019, professional: "ደሞዜ በቀለ", is_holiday: false, is_join: false },
    { week: 12, greg: "2026-09-28", eth_month: "መስከረም", eth_day: 18, eth_year: 2019, professional: "የምስራች መኮንን", is_holiday: false, is_join: false },
    { week: 13, greg: "2026-10-05", eth_month: "መስከረም", eth_day: 25, eth_year: 2019, professional: "ግዛቸው በቀለ ባልቻ", is_holiday: false, is_join: false },
    { week: 14, greg: "2026-10-12", eth_month: "ጥቅምት", eth_day: 2, eth_year: 2019, professional: "ታሪኬ ወዳጆ", is_holiday: false, is_join: false },
    { week: 15, greg: "2026-10-19", eth_month: "ጥቅምት", eth_day: 9, eth_year: 2019, professional: "አዱኔ ሀይሉ", is_holiday: false, is_join: false },
    { week: 16, greg: "2026-10-26", eth_month: "ጥቅምት", eth_day: 16, eth_year: 2019, professional: "ሚልኪያስ አመሀ", is_holiday: false, is_join: false },
    { week: 17, greg: "2026-11-02", eth_month: "ጥቅምት", eth_day: 23, eth_year: 2019, professional: "ታሪኩ አዱኛ", is_holiday: false, is_join: false },
    { week: 18, greg: "2026-11-09", eth_month: "ጥቅምት", eth_day: 30, eth_year: 2019, professional: "ሚሊዮን ከበደ", is_holiday: false, is_join: false },
    { week: 19, greg: "2026-11-16", eth_month: "ኅዳር", eth_day: 7, eth_year: 2019, professional: "አብዲሳ ጫላ", is_holiday: false, is_join: false },
    { week: 20, greg: "2026-11-23", eth_month: "ኅዳር", eth_day: 14, eth_year: 2019, professional: "ደሞዜ በቀለ", is_holiday: false, is_join: false },
    { week: 21, greg: "2026-11-30", eth_month: "ኅዳር", eth_day: 21, eth_year: 2019, professional: "የምስራች መኮንን", is_holiday: false, is_join: false },
    { week: 22, greg: "2026-12-07", eth_month: "ኅዳር", eth_day: 28, eth_year: 2019, professional: "ግዛቸው በቀለ ባልቻ", is_holiday: false, is_join: false },
    { week: 23, greg: "2026-12-14", eth_month: "ታኅሳስ", eth_day: 5, eth_year: 2019, professional: "ታሪኬ ወዳጆ", is_holiday: false, is_join: false },
    { week: 24, greg: "2026-12-21", eth_month: "ታኅሳስ", eth_day: 12, eth_year: 2019, professional: "አዱኔ ሀይሉ", is_holiday: false, is_join: false },
    { week: 25, greg: "2026-12-28", eth_month: "ታኅሳስ", eth_day: 19, eth_year: 2019, professional: "ሚልኪያስ አመሀ", is_holiday: false, is_join: false },
    { week: 26, greg: "2027-01-04", eth_month: "ታኅሳስ", eth_day: 26, eth_year: 2019, professional: "ታሪኩ አዱኛ", is_holiday: false, is_join: false },
    { week: 27, greg: "2027-01-11", eth_month: "ጥር", eth_day: 3, eth_year: 2019, professional: "ሚሊዮን ከበደ", is_holiday: false, is_join: false },
    { week: 28, greg: "2027-01-18", eth_month: "ጥር", eth_day: 10, eth_year: 2019, professional: "አብዲሳ ጫላ", is_holiday: false, is_join: false },
    { week: 29, greg: "2027-01-25", eth_month: "ጥር", eth_day: 17, eth_year: 2019, professional: "ደሞዜ በቀለ", is_holiday: false, is_join: false },
    { week: 30, greg: "2027-02-01", eth_month: "ጥር", eth_day: 24, eth_year: 2019, professional: "የምስራች መኮንን", is_holiday: false, is_join: false },
    { week: 31, greg: "2027-02-08", eth_month: "የካቲት", eth_day: 1, eth_year: 2019, professional: "ግዛቸው በቀለ ባልቻ", is_holiday: false, is_join: false },
    { week: 32, greg: "2027-02-15", eth_month: "የካቲት", eth_day: 8, eth_year: 2019, professional: "ታሪኬ ወዳጆ", is_holiday: false, is_join: false },
    { week: 33, greg: "2027-02-22", eth_month: "የካቲት", eth_day: 15, eth_year: 2019, professional: "አዱኔ ሀይሉ", is_holiday: false, is_join: false },
    { week: 34, greg: "2027-03-01", eth_month: "የካቲት", eth_day: 22, eth_year: 2019, professional: "ሚልኪያስ አመሀ", is_holiday: false, is_join: false },
    { week: 35, greg: "2027-03-08", eth_month: "የካቲት", eth_day: 29, eth_year: 2019, professional: "ታሪኩ አዱኛ", is_holiday: false, is_join: false },
    { week: 36, greg: "2027-03-15", eth_month: "መጋቢት", eth_day: 6, eth_year: 2019, professional: "ሚሊዮን ከበደ", is_holiday: false, is_join: false },
    { week: 37, greg: "2027-03-22", eth_month: "መጋቢት", eth_day: 13, eth_year: 2019, professional: "አብዲሳ ጫላ", is_holiday: false, is_join: false },
    { week: 38, greg: "2027-03-29", eth_month: "መጋቢት", eth_day: 20, eth_year: 2019, professional: "ደሞዜ በቀለ", is_holiday: false, is_join: false },
    { week: 39, greg: "2027-04-05", eth_month: "መጋቢት", eth_day: 27, eth_year: 2019, professional: "የምስራች መኮንን", is_holiday: false, is_join: false },
    { week: 40, greg: "2027-04-12", eth_month: "ሚያዝያ", eth_day: 4, eth_year: 2019, professional: "ግዛቸው በቀለ ባልቻ", is_holiday: false, is_join: false },
    { week: 41, greg: "2027-04-19", eth_month: "ሚያዝያ", eth_day: 11, eth_year: 2019, professional: "ታሪኬ ወዳጆ", is_holiday: false, is_join: false },
    { week: 42, greg: "2027-04-26", eth_month: "ሚያዝያ", eth_day: 18, eth_year: 2019, professional: "አዱኔ ሀይሉ", is_holiday: false, is_join: false },
    { week: 43, greg: "2027-05-03", eth_month: "ሚያዝያ", eth_day: 25, eth_year: 2019, professional: "ሚልኪያስ አመሀ", is_holiday: false, is_join: false },
    { week: 44, greg: "2027-05-10", eth_month: "ግንቦት", eth_day: 2, eth_year: 2019, professional: "ታሪኩ አዱኛ", is_holiday: false, is_join: false },
    { week: 45, greg: "2027-05-17", eth_month: "ግንቦት", eth_day: 9, eth_year: 2019, professional: "ሚሊዮን ከበደ", is_holiday: true, is_join: false },
    { week: 46, greg: "2027-05-24", eth_month: "ግንቦት", eth_day: 16, eth_year: 2019, professional: "አብዲሳ ጫላ", is_holiday: false, is_join: false },
    { week: 47, greg: "2027-05-31", eth_month: "ግንቦት", eth_day: 23, eth_year: 2019, professional: "ደሞዜ በቀለ", is_holiday: false, is_join: false },
    { week: 48, greg: "2027-06-07", eth_month: "ግንቦት", eth_day: 30, eth_year: 2019, professional: "የምስራች መኮንን", is_holiday: false, is_join: false },
    { week: 49, greg: "2027-06-14", eth_month: "ሰኔ", eth_day: 7, eth_year: 2019, professional: "ግዛቸው በቀለ ባልቻ", is_holiday: false, is_join: false },
    { week: 50, greg: "2027-06-21", eth_month: "ሰኔ", eth_day: 14, eth_year: 2019, professional: "ታሪኬ ወዳጆ", is_holiday: false, is_join: false },
    { week: 51, greg: "2027-06-28", eth_month: "ሰኔ", eth_day: 21, eth_year: 2019, professional: "አዱኔ ሀይሉ", is_holiday: false, is_join: false },
    { week: 52, greg: "2027-07-05", eth_month: "ሰኔ", eth_day: 28, eth_year: 2019, professional: "ሚልኪያስ አመሀ", is_holiday: false, is_join: false }
  ] as MondayWeek[],

  professionals: [
    { name: "ሚሊዮን ከበደ", role: "የጽ/ቤት ሀላፊ", phone: "+251911000001", email: "million.kebede@bole01.gov.et" },
    { name: "ታሪኩ አዱኛ", role: "አስተባባሪ", phone: "+251911000002", email: "tariku.adugna@bole01.gov.et" },
    { name: "አብዲሳ ጫላ", role: "ስራ ሂደት", phone: "+251911000003", email: "abdisa.chala@bole01.gov.et" },
    { name: "ደሞዜ በቀለ", role: "ስራ ሂደት", phone: "+251911000004", email: "demoze.bekele@bole01.gov.et" },
    { name: "የምስራች መኮንን", role: "ስራ ሂደት", phone: "+251911000005", email: "yemisrach.mekonnen@bole01.gov.et" },
    { name: "ግዛቸው በቀለ ባልቻ", role: "ባለሙያ", phone: "+251911000006", email: "gizachew.bekele@bole01.gov.et" },
    { name: "ታሪኬ ወዳጆ", role: "ባለሙያ", phone: "+251911000007", email: "tarike.wedajo@bole01.gov.et" },
    { name: "አዱኔ ሀይሉ", role: "ባለሙያ", phone: "+251911000008", email: "adune.haylu@bole01.gov.et" },
    { name: "ሚልኪያስ አመሀ", role: "ባለሙያ", phone: "+251911000009", email: "milkias.ameha@bole01.gov.et" },
    { name: "ስመኝ ቡኑ", role: "ተጋባዥ / ባለሙያ", phone: "+251911000010", email: "smegn.bunu@bole01.gov.et" }
  ] as Professional[],

  pagume_week: 9,
  holiday_reason: "የኢድ አልአድሃ (አረፋ) በዓል በዚህ ቀን ላይ ስለሚውል ቢሮዎች ስለሚዘጉ ፕሮግራሙ አይቀርብም። ይህ ቀን በጨረቃ እይታ ላይ የተመሰረተ በመሆኑ በ1-2 ቀን ሊቀያየር ይችላል፣ ሲቃረብ ያረጋግጡ።",
  total_weeks: 52,

  segments: [
    { name: "ሐምሌ", year: 2018, start_greg: "2026-07-08", length: 30, start_weekday: 2 },
    { name: "ነሐሴ", year: 2018, start_greg: "2026-08-07", length: 30, start_weekday: 4 },
    { name: "ጳጉሜ", year: 2018, start_greg: "2026-09-06", length: 5, start_weekday: 6 },
    { name: "መስከረም", year: 2019, start_greg: "2026-09-11", length: 30, start_weekday: 4 },
    { name: "ጥቅምት", year: 2019, start_greg: "2026-10-11", length: 30, start_weekday: 6 },
    { name: "ኅዳር", year: 2019, start_greg: "2026-11-10", length: 30, start_weekday: 1 },
    { name: "ታኅሳስ", year: 2019, start_greg: "2026-12-10", length: 30, start_weekday: 3 },
    { name: "ጥር", year: 2019, start_greg: "2027-01-09", length: 30, start_weekday: 5 },
    { name: "የካቲት", year: 2019, start_greg: "2027-02-08", length: 30, start_weekday: 0 },
    { name: "መጋቢት", year: 2019, start_greg: "2027-03-10", length: 30, start_weekday: 2 },
    { name: "ሚያዝያ", year: 2019, start_greg: "2027-04-09", length: 30, start_weekday: 4 },
    { name: "ግንቦት", year: 2019, start_greg: "2027-05-09", length: 30, start_weekday: 6 },
    { name: "ሰኔ", year: 2019, start_greg: "2027-06-08", length: 30, start_weekday: 1 }
  ] as MonthSegment[]
};

export const WEEKDAYS_ETH = ["ሰኞ", "ማክሰኞ", "ረቡዕ", "ሐሙስ", "ዓርብ", "ቅዳሜ", "እሁድ"];

export const AVATAR_PALETTE = [
  "#16324F",
  "#B98A22",
  "#4C7A62",
  "#AD5A42",
  "#6B4E9E",
  "#2E6E7E",
  "#8A5A2B",
  "#3C5B3C",
  "#7A3B4A"
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
}

export function getCurrentMondayWeek(): MondayWeek | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (const m of SCHEDULE_DATA.mondays) {
    const mondayDate = new Date(m.greg + "T00:00:00");
    const sundayDate = new Date(mondayDate);
    sundayDate.setDate(sundayDate.getDate() + 6);
    if (today >= mondayDate && today <= sundayDate) {
      return m;
    }
  }
  // If not currently in range, find the next closest future week or return week 14 (current active week)
  const nextFuture = SCHEDULE_DATA.mondays.find(m => new Date(m.greg + "T00:00:00") >= today);
  return nextFuture || SCHEDULE_DATA.mondays[13]; // Default to Week 14
}

export function formatDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function findMondayByGregDate(dateStr: string): { week: number; professional: string } | null {
  const target = new Date(dateStr + "T00:00:00");
  for (const item of SCHEDULE_DATA.mondays) {
    const start = new Date(item.greg + "T00:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    if (target >= start && target < end) {
      return { week: item.week, professional: item.professional };
    }
  }
  return null;
}
