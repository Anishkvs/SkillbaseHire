import React, { useEffect, useRef, useState, useCallback } from 'react';
import { COUNTRIES, TZ_COUNTRY_MAP } from './constants';

/* ── Detect country from browser timezone ─────────────────── */
function detectCountry() {
  try {
    const tz   = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const code = TZ_COUNTRY_MAP[tz];
    if (code) return COUNTRIES.find(c => c.code === code) ?? null;
  } catch (_) {}
  return null;
}

/* ── Icons ────────────────────────────────────────────────── */
const IconChevron = ({ open }) => (
  <svg
    width="12" height="12" fill="none" stroke="currentColor"
    strokeWidth="2.5" viewBox="0 0 24 24"
    className={`transition-transform duration-200 text-slate-400 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const IconPhone = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"
       viewBox="0 0 24 24" className="text-slate-400 flex-shrink-0">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 012 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const IconSearch = () => (
  <svg width="14" height="14" fill="none" stroke="#94A3B8" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" fill="none" stroke="#059669" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const IconError = () => (
  <svg width="16" height="16" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const IconWarn = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ── Country Dropdown ─────────────────────────────────────── */
function CountryDropdown({ selected, onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const searchRef  = useRef(null);
  const listRef    = useRef(null);

  useEffect(() => {
    setTimeout(() => searchRef.current?.focus(), 60);
  }, []);

  const filtered = query.trim()
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.dial.includes(query) ||
        c.code.toLowerCase().includes(query.toLowerCase()))
    : COUNTRIES;

  const handleKey = useCallback(e => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div
      className="absolute top-[calc(100%+6px)] left-0 z-[9999] w-[300px] max-w-[calc(100vw-3rem)]
                 bg-white border border-slate-200 rounded-xl
                 shadow-[0_12px_32px_rgba(0,0,0,.13),0_2px_8px_rgba(0,0,0,.06)]
                 flex flex-col overflow-hidden
                 animate-[spfDrop_.15s_cubic-bezier(.16,1,.3,1)_both]"
    >
      {/* Search header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border-b border-slate-100">
        <IconSearch />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search country…"
          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-800
                     placeholder:text-slate-400 font-[inherit]"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Country list */}
      <div
        ref={listRef}
        className="max-h-[224px] overflow-y-auto overscroll-contain
                   [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200
                   [&::-webkit-scrollbar-thumb]:rounded"
      >
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">No countries found</p>
        ) : (
          filtered.map(c => (
            <button
              key={c.code}
              type="button"
              onClick={() => { onSelect(c); onClose(); }}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left
                          transition-colors
                          ${c.code === selected.code
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'hover:bg-slate-50 text-slate-700'}`}
            >
              <span className="text-[17px] flex-shrink-0">{c.flag}</span>
              <span className="flex-1 font-medium truncate">{c.name}</span>
              <span className={`text-xs font-semibold flex-shrink-0 ${c.code === selected.code ? 'text-indigo-500' : 'text-slate-400'}`}>
                {c.dial}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ── Main PhoneField component ────────────────────────────── */
export default function PhoneField({
  nameCode    = 'phone_code',
  namePhone   = 'phone',
  defaultCode = '',
  defaultNum  = '',
  label       = 'Mobile number',
  required    = false,
  onChange,
}) {
  /* Resolve initial country */
  const initial = defaultCode
    ? (COUNTRIES.find(c => c.dial === defaultCode) ?? null)
    : detectCountry();
  const [country, setCountry] = useState(initial ?? COUNTRIES[0]);
  const [num,     setNum    ] = useState(defaultNum);
  const [open,    setOpen   ] = useState(false);
  const wrapRef  = useRef(null);

  /* Derived validation state */
  const validState = (() => {
    if (!num)                                    return 'empty';
    if (num.length >= country.min && num.length <= country.max) return 'valid';
    return 'invalid';
  })();

  const rangeLabel = country.min === country.max
    ? `${country.min} digits`
    : `${country.min}–${country.max} digits`;

  /* Notify parent */
  useEffect(() => {
    onChange?.({ country, num, full: num ? `${country.dial} ${num}` : '', valid: validState === 'valid' });
  }, [country, num]);

  /* Close dropdown on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  /* Input handlers */
  const handleInput = e => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '').slice(0, country.max);
    setNum(cleaned);
  };
  const handleKeyPress = e => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };
  const handlePaste = e => {
    e.preventDefault();
    let pasted = (e.clipboardData ?? window.clipboardData).getData('text').replace(/[^0-9]/g, '');
    const prefix = country.dial.replace('+', '');
    if (pasted.startsWith(prefix) && pasted.length > country.max) pasted = pasted.slice(prefix.length);
    setNum(pasted.slice(0, country.max));
  };

  /* Border colour based on validation state */
  const borderClass = {
    empty:   'border-slate-300 focus-within:border-indigo-500 focus-within:ring-indigo-500/10',
    valid:   'border-emerald-500 ring-2 ring-emerald-500/10',
    invalid: 'border-red-500 ring-2 ring-red-500/10',
  }[validState];

  return (
    <div className="flex flex-col gap-1.5">
      {/* Label */}
      {label && (
        <label className="text-[13px] font-semibold text-slate-700 tracking-wide uppercase">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Input wrapper */}
      <div
        ref={wrapRef}
        className={`relative flex items-center h-12 bg-white rounded-[10px]
                    border-[1.5px] transition-all duration-200 ring-[3px] ring-transparent
                    ${borderClass}`}
      >
        {/* Country selector button */}
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-1.5 h-full px-3 bg-slate-50 rounded-l-[9px]
                     border-r border-slate-200 flex-shrink-0 transition-colors
                     hover:bg-indigo-50 focus:outline-none focus-visible:ring-2
                     focus-visible:ring-indigo-500 focus-visible:ring-inset"
        >
          <span className="text-[19px] leading-none">{country.flag}</span>
          <span className="hidden sm:block text-[13px] font-medium text-slate-800 max-w-[80px] truncate">
            {country.name}
          </span>
          <span className="text-[13px] font-semibold text-slate-500">{country.dial}</span>
          <IconChevron open={open} />
        </button>

        {/* Phone icon */}
        <span className="ml-3">
          <IconPhone />
        </span>

        {/* Number input */}
        <input
          type="text"
          inputMode="numeric"
          value={num}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          placeholder="Enter phone number"
          autoComplete="tel"
          aria-label="Phone number"
          className="flex-1 min-w-0 border-none outline-none bg-transparent
                     px-2 text-[15px] text-slate-800 placeholder:text-slate-400
                     placeholder:font-normal font-[inherit]"
        />

        {/* Validation icon */}
        <div className="w-10 flex-shrink-0 flex items-center justify-center">
          {validState === 'valid'   && <IconCheck />}
          {validState === 'invalid' && <IconError />}
        </div>

        {/* Country dropdown */}
        {open && (
          <CountryDropdown
            selected={country}
            onSelect={c => { setCountry(c); if (num) {} }}
            onClose={() => setOpen(false)}
          />
        )}
      </div>

      {/* Messages */}
      {validState === 'invalid' && (
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-red-600">
          <IconWarn />
          Please enter a valid phone number.
        </p>
      )}
      {(validState === 'empty' || validState === 'invalid') && (
        <p className="text-[12px] text-slate-400">Expected: {rangeLabel}</p>
      )}
      {validState === 'valid' && (
        <p className="text-[12px] text-emerald-600 font-medium">Valid phone number</p>
      )}

      {/* Hidden form fields */}
      <input type="hidden" name={nameCode}  value={country.dial} />
      <input type="hidden" name={namePhone} value={num} />
    </div>
  );
}
