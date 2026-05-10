import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import { createPortal } from 'react-dom';

/* ─────────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────── */
const FULL_MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const SHORT_MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const MIN_YEAR   = 1950;

function buildGrid(year, month) {
  const firstDow = new Date(year, month, 1).getDay();
  const inMonth  = new Date(year, month + 1, 0).getDate();
  const inPrev   = new Date(year, month, 0).getDate();
  const cells    = [];
  for (let i = firstDow - 1; i >= 0; i--)
    cells.push({ d: inPrev - i, m: month === 0 ? 11 : month - 1, y: month === 0 ? year - 1 : year, ov: true });
  for (let d = 1; d <= inMonth; d++)
    cells.push({ d, m: month, y: year, ov: false });
  const rem = 42 - cells.length;
  for (let d = 1; d <= rem; d++)
    cells.push({ d, m: month === 11 ? 0 : month + 1, y: month === 11 ? year + 1 : year, ov: true });
  return cells;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640,
  );
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return mobile;
}

/* ─────────────────────────────────────────────────────────────────
   Icons
───────────────────────────────────────────────────────────────── */
function CalIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor"
      strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8"  y1="2" x2="8"  y2="6"/>
      <line x1="3"  y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function ChevDown({ open }) {
  return (
    <svg width="13" height="13" fill="none" stroke="currentColor"
      strokeWidth="2.5" viewBox="0 0 24 24"
      className={`transition-transform duration-200 flex-shrink-0
        ${open ? 'rotate-180 text-[#4F46E5]' : 'text-[#94A3B8]'}`}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function ArrowBtn({ dir, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-8 h-8 rounded-full flex items-center justify-center text-[#4A5568]
                 hover:bg-[#F0F2F7] active:bg-[#E2E8F0]
                 disabled:opacity-25 disabled:cursor-not-allowed
                 transition-colors duration-150"
    >
      <svg width="14" height="14" fill="none" stroke="currentColor"
        strokeWidth="2.5" viewBox="0 0 24 24">
        {dir === 'prev'
          ? <polyline points="15 18 9 12 15 6"/>
          : <polyline points="9 18 15 12 9 6"/>}
      </svg>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Year picker view
───────────────────────────────────────────────────────────────── */
function YearPicker({ navYear, maxYear, onSelect, onBack }) {
  const listRef = useRef(null);

  const years = useMemo(() =>
    Array.from({ length: maxYear - MIN_YEAR + 1 }, (_, i) => maxYear - i),
    [maxYear],
  );

  /* Scroll the selected year into view when the list mounts */
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector('[data-cur="true"]');
    el?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }, []);

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-[#F0F2F7]">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#4A5568]
                     hover:bg-[#F0F2F7] transition-colors duration-150"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor"
            strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span className="text-[14px] font-bold text-[#1A202C]">Select Year</span>
      </div>

      {/* Scrollable year list */}
      <div
        ref={listRef}
        className="max-h-[252px] overflow-y-auto py-2 px-2"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}
      >
        {years.map(y => {
          const isCur = y === navYear;
          return (
            <button
              key={y}
              type="button"
              data-cur={isCur}
              onClick={() => onSelect(y)}
              className={`
                w-full py-2.5 rounded-xl text-[14px] font-semibold
                text-center transition-all duration-100 mb-0.5
                ${isCur
                  ? 'bg-[#4F46E5] text-white shadow-[0_2px_8px_rgba(79,70,229,.35)]'
                  : 'text-[#374151] hover:bg-[#F3F4F6] hover:text-[#1A202C]'}
              `}
            >
              {y}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   CalendarGrid — month view with day cells
   Internal `view` state switches between 'calendar' and 'years'
───────────────────────────────────────────────────────────────── */
function CalendarGrid({
  navYear, navMonth,
  selMonth, selYear, selDay,
  maxYear, maxMonth, maxDay,
  onNavigate,
  onDayClick,
  onClear,
  onToday,
}) {
  const [view, setView] = useState('calendar');
  const cells = useMemo(() => buildGrid(navYear, navMonth), [navYear, navMonth]);

  const canPrev = !(navYear <= MIN_YEAR && navMonth === 0);
  const canNext = navYear < maxYear || (navYear === maxYear && navMonth < maxMonth);

  const go = (dir) => {
    if (dir === -1) {
      if (navMonth === 0) onNavigate(navYear - 1, 11);
      else onNavigate(navYear, navMonth - 1);
    } else {
      if (!canNext) return;
      if (navMonth === 11) onNavigate(navYear + 1, 0);
      else onNavigate(navYear, navMonth + 1);
    }
  };

  /* ── Year picker view ── */
  if (view === 'years') {
    return (
      <YearPicker
        navYear={navYear}
        maxYear={maxYear}
        onBack={() => setView('calendar')}
        onSelect={(y) => {
          onNavigate(y, navMonth);
          setView('calendar');
        }}
      />
    );
  }

  /* ── Calendar view ── */
  return (
    <div className="select-none">

      {/* Month / year navigation header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2.5">
        <ArrowBtn dir="prev" disabled={!canPrev} onClick={() => go(-1)} />

        <div className="flex items-center gap-1.5">
          {/* Month label (not interactive) */}
          <span className="text-[14.5px] font-bold text-[#1A202C] tracking-tight">
            {FULL_MONTHS[navMonth]}
          </span>

          {/* Year button — click to open year picker */}
          <button
            type="button"
            onClick={() => setView('years')}
            className="flex items-center gap-1 text-[14.5px] font-bold text-[#4F46E5]
                       hover:bg-[#EEF2FF] px-1.5 py-0.5 rounded-lg
                       transition-colors duration-150"
            title="Choose year"
          >
            {navYear}
            <svg width="11" height="11" fill="none" stroke="currentColor"
              strokeWidth="2.5" viewBox="0 0 24 24" className="opacity-70">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        <ArrowBtn dir="next" disabled={!canNext} onClick={() => go(1)} />
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 px-3 mb-1">
        {DAY_LABELS.map(d => (
          <div key={d}
            className="text-center text-[10.5px] font-semibold text-[#94A3B8]
                       uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 px-2 pb-3 gap-y-px">
        {cells.map(({ d, m, y, ov }, idx) => {
          const now     = new Date();
          const nowY    = now.getFullYear();
          const nowM    = now.getMonth();
          const nowD    = now.getDate();
          const isToday = d === nowD && m === nowM && y === nowY;

          const isFuture =
            y > maxYear ||
            (y === maxYear && m > maxMonth) ||
            (y === maxYear && m === maxMonth && d > maxDay);

          const isHidden = ov && isFuture;

          const inSelMonth = selMonth !== null && m === selMonth && y === selYear;
          const isSelDay   = inSelMonth && d === selDay;
          const isSelBg    = inSelMonth && !isSelDay;

          if (isHidden) return <div key={idx} className="aspect-square" />;

          return (
            <button
              key={idx}
              type="button"
              disabled={isFuture}
              onClick={() => !isFuture && onDayClick(y, m, d)}
              className={`
                relative aspect-square flex items-center justify-center
                mx-0.5 my-0.5 rounded-full text-[12.5px] font-medium
                transition-all duration-100
                ${isSelDay
                  ? 'bg-[#4F46E5] text-white font-bold shadow-[0_2px_10px_rgba(79,70,229,.4)]'
                  : isSelBg && !ov
                  ? 'bg-[#EEF2FF] text-[#4F46E5] font-semibold'
                  : isFuture
                  ? 'text-[#D1D5DB] cursor-not-allowed'
                  : ov
                  ? 'text-[#CBD5E1] hover:bg-[#F8F9FC] hover:text-[#94A3B8]'
                  : isToday
                  ? 'text-[#4F46E5] font-bold ring-[1.5px] ring-[#4F46E5] hover:bg-[#EEF2FF]'
                  : 'text-[#374151] hover:bg-[#F3F4F6]'}
              `}
            >
              {d}
              {isToday && !isSelDay && (
                <span className="absolute bottom-[3px] left-1/2 -translate-x-1/2
                                 w-[3px] h-[3px] rounded-full bg-[#4F46E5]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-[#F0F2F7]">
        <button
          type="button"
          onClick={onClear}
          className="text-[12.5px] font-semibold text-[#94A3B8] hover:text-[#4A5568]
                     px-2.5 py-1.5 rounded-lg hover:bg-[#F0F2F7]
                     transition-all duration-150 active:scale-95"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onToday}
          className="text-[12.5px] font-semibold text-[#4F46E5] hover:text-[#4338CA]
                     px-2.5 py-1.5 rounded-lg hover:bg-[#EEF2FF]
                     transition-all duration-150 active:scale-95"
        >
          Today
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DesktopPopup
   FIX: position:fixed so the calendar never drifts on scroll.
        A scroll/resize listener repositions it to stay flush
        below the trigger button at all times.
───────────────────────────────────────────────────────────────── */
const POPUP_W = 300;

function DesktopPopup({ triggerRef, onClose, errorMsg, ...grid }) {
  const popupRef = useRef(null);
  const [pos, setPos] = useState({ top: -9999, left: 0 });

  /* Compute viewport-relative position of the trigger */
  const reposition = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    let left = r.left;
    const top = r.bottom + 6;
    if (left + POPUP_W > window.innerWidth - 8)
      left = Math.max(8, window.innerWidth - POPUP_W - 8);
    setPos({ top, left });
  }, [triggerRef]);

  /* Initial position + keep in sync when page scrolls or resizes */
  useEffect(() => {
    reposition();
    /* capture:true catches scroll on any ancestor, not just window */
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [reposition]);

  /* Close on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) onClose();
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [onClose, triggerRef]);

  /* Escape key */
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={popupRef}
      style={{
        position: 'fixed',      /* fixed = relative to viewport, unaffected by scroll */
        top:  pos.top,
        left: pos.left,
        width: POPUP_W,
        zIndex: 9999,
      }}
      className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden
                 shadow-[0_20px_60px_rgba(0,0,0,.15),0_4px_16px_rgba(0,0,0,.07)]
                 animate-[dpSlideDown_.18s_cubic-bezier(.16,1,.3,1)_both]"
    >
      <CalendarGrid {...grid} />

      {errorMsg && (
        <div className="mx-3 mb-3 -mt-0.5 flex items-start gap-2
                        px-3 py-2 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
          <svg className="flex-shrink-0 mt-0.5" width="12" height="12"
            fill="none" stroke="#DC2626" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12"    y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="text-[11.5px] font-medium text-[#DC2626] leading-relaxed">
            {errorMsg}
          </span>
        </div>
      )}
    </div>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────
   MobileSheet — slide-up bottom sheet
───────────────────────────────────────────────────────────────── */
function MobileSheet({ tempSelMonth, tempSelYear, onApply, onCancel, ...grid }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const hasTemp = tempSelMonth !== null && tempSelYear !== null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[9999] transition-all duration-300
        ${visible ? 'bg-black/40 backdrop-blur-[2px]' : 'bg-transparent'}`}
    >
      <div className="absolute inset-0" onClick={onCancel} />
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl
                    shadow-[0_-8px_48px_rgba(0,0,0,.18)] flex flex-col
                    max-h-[88dvh] transition-transform duration-300 ease-out
                    ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#E2E8F0]" />
        </div>
        {/* Title */}
        <div className="px-5 pt-2 pb-3 flex items-center justify-between flex-shrink-0
                        border-b border-[#F0F2F7]">
          <p className="text-[16px] font-bold text-[#1A202C]">Select date</p>
          {hasTemp && (
            <span className="text-[12.5px] font-semibold text-[#4F46E5]
                             bg-[#EEF2FF] px-2.5 py-1 rounded-full">
              {SHORT_MONTHS[tempSelMonth]} {tempSelYear}
            </span>
          )}
        </div>
        {/* Calendar */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <CalendarGrid {...grid} />
        </div>
        {/* Sticky footer */}
        <div className="flex-shrink-0 flex gap-3 px-4 pb-8 pt-3 border-t border-[#F0F2F7]">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-full text-[14px] font-semibold text-[#4A5568]
                       border border-[#E2E8F0] hover:bg-[#F0F2F7] active:scale-[.98]
                       transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 py-3.5 rounded-full text-[14px] font-semibold text-white
                       bg-[#4F46E5] shadow-[0_4px_14px_rgba(79,70,229,.35)]
                       hover:bg-[#4338CA] active:scale-[.98] transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─────────────────────────────────────────────────────────────────
   DateField — trigger button + popup/sheet controller
───────────────────────────────────────────────────────────────── */
export function DateField({
  placeholder = 'Select date',
  monthValue,
  yearValue,
  onChange,
  onBlur,
  disabled = false,
  error,
  maxYear,
}) {
  const isMobile   = useIsMobile();
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);

  const now = new Date();
  const selMonthIdx = monthValue ? FULL_MONTHS.indexOf(monthValue) : null;
  const selYearInt  = yearValue  ? parseInt(yearValue, 10)         : null;

  const [navYear,  setNavYear]  = useState(() => selYearInt  ?? now.getFullYear());
  const [navMonth, setNavMonth] = useState(() => selMonthIdx !== null ? selMonthIdx : now.getMonth());
  const [selDay,   setSelDay]   = useState(1);

  /* Mobile temp selection */
  const [tempMonth, setTempMonth] = useState(null);
  const [tempYear,  setTempYear]  = useState(null);

  useEffect(() => {
    if (selMonthIdx !== null && selYearInt !== null) {
      setNavYear(selYearInt);
      setNavMonth(selMonthIdx);
    }
  }, [monthValue, yearValue]); // eslint-disable-line

  const openPicker = () => {
    if (disabled) return;
    setNavYear(selYearInt ?? now.getFullYear());
    setNavMonth(selMonthIdx !== null ? selMonthIdx : now.getMonth());
    if (isMobile) { setTempMonth(selMonthIdx); setTempYear(selYearInt); }
    setOpen(true);
  };

  const closePicker = useCallback(() => { setOpen(false); onBlur?.(); }, [onBlur]);

  const handleDayClick = (y, m, d) => {
    setSelDay(d);
    setNavYear(y); setNavMonth(m);
    if (isMobile) { setTempMonth(m); setTempYear(y); }
    else { onChange(FULL_MONTHS[m], String(y)); closePicker(); }
  };

  const handleApply = () => {
    if (tempMonth !== null && tempYear !== null)
      onChange(FULL_MONTHS[tempMonth], String(tempYear));
    closePicker();
  };

  const handleClear = () => { onChange('', ''); setSelDay(1); closePicker(); };

  const handleToday = () => {
    const m = now.getMonth(), y = now.getFullYear(), d = now.getDate();
    setNavYear(y); setNavMonth(m); setSelDay(d);
    if (isMobile) { setTempMonth(m); setTempYear(y); }
    else { onChange(FULL_MONTHS[m], String(y)); closePicker(); }
  };

  const hasValue  = Boolean(monthValue && yearValue);
  const dispValue = hasValue
    ? `${SHORT_MONTHS[FULL_MONTHS.indexOf(monthValue)]} ${yearValue}`
    : '';

  const calSelMonth = isMobile ? tempMonth : selMonthIdx;
  const calSelYear  = isMobile ? tempYear  : selYearInt;
  const calSelDay   = calSelMonth !== null && calSelYear !== null ? selDay : null;

  const maxY = maxYear ?? now.getFullYear();
  const maxM = now.getMonth();
  const maxD = now.getDate();

  const sharedGrid = {
    navYear, navMonth,
    selMonth: calSelMonth,
    selYear:  calSelYear,
    selDay:   calSelDay,
    maxYear: maxY, maxMonth: maxM, maxDay: maxD,
    onNavigate: (y, m) => { setNavYear(y); setNavMonth(m); },
    onDayClick: handleDayClick,
    onClear: handleClear,
    onToday: handleToday,
  };

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={openPicker}
        className={`
          w-full flex items-center gap-2.5 px-3.5 py-[11px]
          rounded-xl border text-left transition-all duration-200
          ${open
            ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15 bg-white'
            : error
            ? 'border-[#EF4444] bg-white'
            : disabled
            ? 'bg-[#F8FAFC] border-[#E2E8F0] cursor-not-allowed opacity-55'
            : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:shadow-[0_1px_4px_rgba(0,0,0,.06)]'}
        `}
      >
        <span className={`flex-shrink-0 transition-colors
          ${open ? 'text-[#4F46E5]' : error ? 'text-[#EF4444]' : 'text-[#94A3B8]'}`}>
          <CalIcon />
        </span>

        <span className={`flex-1 text-[14px] leading-none truncate
          ${hasValue ? 'text-[#1A202C] font-semibold' : 'text-[#94A3B8]'}`}>
          {hasValue ? dispValue : placeholder}
        </span>

        {hasValue && !disabled && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear date"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleClear(); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClear(); }}
            className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-[#E2E8F0]
                       hover:bg-[#CBD5E1] flex items-center justify-center cursor-pointer
                       transition-colors duration-150"
          >
            <svg width="8" height="8" fill="none" stroke="currentColor"
              strokeWidth="3" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </span>
        )}

        {!hasValue && <ChevDown open={open} />}
      </button>

      {open && (
        isMobile
          ? (
            <MobileSheet
              tempSelMonth={tempMonth}
              tempSelYear={tempYear}
              onApply={handleApply}
              onCancel={closePicker}
              {...sharedGrid}
            />
          ) : (
            <DesktopPopup
              triggerRef={triggerRef}
              onClose={closePicker}
              errorMsg={error}
              {...sharedGrid}
            />
          )
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MonthYearPicker — public export used by ExperienceModal.jsx
   API is identical to the previous version; no callers need changes.
───────────────────────────────────────────────────────────────── */
export function MonthYearPicker({
  label,
  required = false,
  monthValue,
  yearValue,
  onMonthChange,
  onYearChange,
  onBlur,
  disabled = false,
  monthError,
  yearError,
  maxYear,
}) {
  const error = monthError || yearError;

  const handleChange = useCallback((month, year) => {
    onMonthChange(month);
    onYearChange(year);
  }, [onMonthChange, onYearChange]);

  const isStart  = label?.toLowerCase().includes('from');
  const phText   = isStart ? 'Select start date' : 'Select end date';
  const labelCls = 'block text-[11.5px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1.5';

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className={labelCls}>
          {label}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </span>
      )}

      {disabled ? (
        <div className="flex items-center gap-2.5 px-3.5 py-[11px] rounded-xl
                        border border-[#BBF7D0] bg-[#F0FDF4]">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] flex-shrink-0 animate-pulse" />
          <span className="text-[14px] font-semibold text-[#16A34A]">Present</span>
          <span className="text-[12.5px] text-[#86EFAC]">— Currently working</span>
        </div>
      ) : (
        <DateField
          placeholder={phText}
          monthValue={monthValue}
          yearValue={yearValue}
          onChange={handleChange}
          onBlur={onBlur}
          error={error}
          maxYear={maxYear}
        />
      )}

      {error && (
        <span className="flex items-center gap-1.5 mt-0.5
                         text-[11.5px] font-medium text-[#DC2626]">
          <svg className="flex-shrink-0" width="11" height="11"
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8"  x2="12"    y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

export default DateField;
