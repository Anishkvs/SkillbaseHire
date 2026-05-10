import React, { useRef, useEffect } from 'react';
import { getAvatarColor, calcDuration } from './constants';

/* ── Company Avatar ─────────────────────────────────────────────── */
function CompanyAvatar({ name }) {
  const { bg, text, border } = getAvatarColor(name);
  return (
    <div
      style={{ background: bg, color: text, border: `1.5px solid ${border}` }}
      className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-extrabold flex-shrink-0 select-none"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* ── Three-dot Dropdown Menu ────────────────────────────────────── */
function ActionMenu({ isOpen, onOpen, onClose, onEdit, onDelete }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>

      {/* Trigger */}
      <button
        onClick={() => isOpen ? onClose() : onOpen()}
        aria-label="More options"
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150
          ${isOpen
            ? 'bg-[#EEF2FF] text-[#4F46E5]'
            : 'text-[#94A3B8] hover:text-[#4A5568] hover:bg-[#F0F2F7]'}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5"  r="1.8"/>
          <circle cx="12" cy="12" r="1.8"/>
          <circle cx="12" cy="19" r="1.8"/>
        </svg>
      </button>

      {/* Floating panel */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-[200] w-[176px]
                     bg-white rounded-xl border border-[#E2E8F0]
                     shadow-[0_12px_32px_rgba(0,0,0,.13),0_2px_8px_rgba(0,0,0,.07)]
                     overflow-hidden origin-top-right
                     animate-[dpOpen_.15s_cubic-bezier(.16,1,.3,1)_both]"
        >
          {/* Edit */}
          <button
            role="menuitem"
            onMouseDown={(e) => { e.preventDefault(); onClose(); onEdit(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5
                       text-[13px] font-medium text-[#1A202C]
                       hover:bg-[#F0F2F7] active:bg-[#E8EAEF]
                       transition-colors duration-100 text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
              <svg width="13" height="13" fill="none" stroke="#4F46E5" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </span>
            Edit employment
          </button>

          <div className="mx-3 h-px bg-[#F0F2F7]" />

          {/* Delete */}
          <button
            role="menuitem"
            onMouseDown={(e) => { e.preventDefault(); onClose(); onDelete(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5
                       text-[13px] font-medium text-[#DC2626]
                       hover:bg-[#FFF5F5] active:bg-[#FEE2E2]
                       transition-colors duration-100 text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-[#FEE2E2] flex items-center justify-center flex-shrink-0">
              <svg width="13" height="13" fill="none" stroke="#DC2626" strokeWidth="2.2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Description with expand/collapse ──────────────────────────── */
function Description({ text, isExpanded, onToggle }) {
  if (!text) return null;
  const lines = text.split('\n').filter(l => l.trim());
  const preview = lines.slice(0, 3);
  const hasMore = lines.length > 3;

  const renderLine = (line, i) => {
    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
    return (
      <p key={i} className={`text-[13px] text-[#4A5568] leading-[1.7] ${isBullet ? 'flex items-start gap-1.5' : ''}`}>
        {isBullet && <span className="text-[#4F46E5] mt-[3px] flex-shrink-0">•</span>}
        <span>{isBullet ? line.trim().replace(/^[•\-]\s*/, '') : line}</span>
      </p>
    );
  };

  return (
    <div className="mt-3 space-y-1">
      {(isExpanded ? lines : preview).map(renderLine)}
      {hasMore && (
        <button
          onClick={onToggle}
          className="text-[13px] font-semibold text-[#4F46E5] hover:text-[#4338CA]
                     hover:underline transition-colors mt-0.5 focus:outline-none"
        >
          {isExpanded ? 'read less' : 'read more'}
        </button>
      )}
    </div>
  );
}

/* ── Delete Confirm ─────────────────────────────────────────────── */
export function DeleteConfirmModal({ company, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,.18)]
                   w-full max-w-[360px] overflow-hidden animate-[scaleIn_.2s_ease-out_both]"
      >
        <div className="px-6 pt-6 pb-5">
          {/* Warning icon */}
          <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] flex items-center justify-center mb-4 mx-auto">
            <svg width="22" height="22" fill="none" stroke="#DC2626" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 className="text-[16px] font-bold text-[#1A202C] mb-2 text-center">Delete Experience?</h3>
          <p className="text-[13px] text-[#4A5568] leading-relaxed text-center">
            Are you sure you want to remove this work experience from your profile?
            {company && (
              <> <strong className="text-[#1A202C]">({company})</strong></>
            )}
          </p>
        </div>
        <div className="flex gap-2.5 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-full text-[13.5px] font-semibold text-[#4A5568]
                       border border-[#E2E8F0] hover:bg-[#F0F2F7] hover:border-[#CBD5E1]
                       transition-all active:scale-[.98]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-full text-[13.5px] font-semibold
                       text-[#DC2626] bg-[#FEE2E2] border border-[#FECACA]
                       hover:bg-[#FCA5A5]/40 hover:border-[#FCA5A5]
                       transition-all active:scale-[.98]"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Card ──────────────────────────────────────────────────── */
export default function ExperienceCard({
  exp, isLast, isExpanded,
  onEdit, onDelete, onToggleExpand,
  isMenuOpen, onMenuOpen, onMenuClose,
}) {
  const { dateRange, duration } = calcDuration(
    exp.start_month, exp.start_year,
    exp.end_month,   exp.end_year,
    exp.is_current
  );

  return (
    <div
      className={`group flex gap-4 py-5 transition-colors
        ${!isLast ? 'border-b border-[#E2E8F0]' : ''}`}
    >
      {/* Left: company avatar + timeline line */}
      <div className="flex flex-col items-center gap-0 flex-shrink-0">
        <CompanyAvatar name={exp.company} />
        {!isLast && <div className="w-px flex-1 bg-[#E2E8F0] mt-2 min-h-[20px]" />}
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0">

        {/* Row 1: company + menu */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-[#1A202C] leading-snug truncate">
              {exp.company}
            </h3>
            {(exp.employment_type || duration) && (
              <p className="text-[12.5px] text-[#94A3B8] font-medium mt-0.5">
                {[exp.employment_type, duration].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <ActionMenu
            isOpen={isMenuOpen}
            onOpen={onMenuOpen}
            onClose={onMenuClose}
            onEdit={() => onEdit(exp)}
            onDelete={() => onDelete(exp.id)}
          />
        </div>

        {/* Row 2: designation */}
        {exp.designation && (
          <p className="text-[13.5px] font-semibold text-[#1A202C] mt-2">
            {exp.designation}
          </p>
        )}

        {/* Row 3: date range + duration */}
        {dateRange && (
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="flex items-center gap-1.5 text-[12px] text-[#94A3B8]">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8"  y1="2" x2="8"  y2="6"/>
                <line x1="3"  y1="10" x2="21" y2="10"/>
              </svg>
              {dateRange} · {duration}
            </span>
            {exp.is_current && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                               text-[10.5px] font-semibold bg-[#DCFCE7] text-[#16A34A]
                               border border-[#16A34A]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                Current
              </span>
            )}
          </div>
        )}

        {/* Row 4: description */}
        <Description
          text={exp.description}
          isExpanded={isExpanded}
          onToggle={() => onToggleExpand(exp.id)}
        />
      </div>
    </div>
  );
}
