export const EMPLOYMENT_TYPES = [
  'Full Time',
  'Part Time',
  'Contract',
  'Freelance',
  'Internship',
  'Apprenticeship',
  'Self-employed',
];

export const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

export const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const CUR_YEAR = new Date().getFullYear();
export const YEARS = Array.from({ length: 40 }, (_, i) => CUR_YEAR - i);

export const MAX_DESC_CHARS = 4000;

// Deterministic color per company initial — matches SkillBaseHire accent palette
export const AVATAR_COLORS = [
  { bg: '#EEF2FF', text: '#4F46E5', border: 'rgba(79,70,229,.2)'  }, // indigo
  { bg: '#F0FDF4', text: '#16A34A', border: 'rgba(22,163,74,.2)'  }, // green
  { bg: '#FEF3C7', text: '#D97706', border: 'rgba(217,119,6,.2)'  }, // amber
  { bg: '#EDE9FE', text: '#7C3AED', border: 'rgba(124,58,237,.2)' }, // purple
  { bg: '#DBEAFE', text: '#2563EB', border: 'rgba(37,99,235,.2)'  }, // blue
  { bg: '#FEE2E2', text: '#DC2626', border: 'rgba(220,38,38,.2)'  }, // red
  { bg: '#F0F9FF', text: '#0369A1', border: 'rgba(3,105,161,.2)'  }, // sky
  { bg: '#FDF4FF', text: '#9333EA', border: 'rgba(147,51,234,.2)' }, // fuchsia
];

export function getAvatarColor(name = '') {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export function calcDuration(startMonth, startYear, endMonth, endYear, isCurrent) {
  if (!startMonth || !startYear) return { dateRange: '', duration: '', totalMonths: 0 };
  const sIdx = MONTHS.indexOf(startMonth);
  const sYear = parseInt(startYear, 10);
  let eIdx, eYear;
  if (isCurrent || !endMonth || !endYear) {
    const now = new Date();
    eIdx  = now.getMonth();
    eYear = now.getFullYear();
  } else {
    eIdx  = MONTHS.indexOf(endMonth);
    eYear = parseInt(endYear, 10);
  }
  const totalMonths = (eYear - sYear) * 12 + (eIdx - sIdx);
  const yrs = Math.floor(Math.max(0, totalMonths) / 12);
  const mos = Math.max(0, totalMonths) % 12;
  const duration = [yrs > 0 && `${yrs} yr${yrs > 1 ? 's' : ''}`, mos > 0 && `${mos} mo`]
    .filter(Boolean).join(' ') || '< 1 mo';
  const startLabel = `${SHORT_MONTHS[sIdx]} ${startYear}`;
  const endLabel   = isCurrent || !endMonth ? 'Present' : `${SHORT_MONTHS[eIdx]} ${endYear}`;
  return { dateRange: `${startLabel} – ${endLabel}`, duration, totalMonths: Math.max(0, totalMonths) };
}

export function calcTotalExperience(experiences) {
  const total = experiences.reduce((sum, e) => {
    const { totalMonths } = calcDuration(e.start_month, e.start_year, e.end_month, e.end_year, e.is_current);
    return sum + totalMonths;
  }, 0);
  const yrs = Math.floor(total / 12);
  const mos = total % 12;
  if (!yrs && !mos) return null;
  return [yrs > 0 && `${yrs} yr${yrs > 1 ? 's' : ''}`, mos > 0 && `${mos} mo`].filter(Boolean).join(' ');
}
