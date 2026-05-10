import React, { useState } from 'react';

function formatMonth(ym) {
  if (!ym) return '';
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
}

function ConfirmDeleteModal({ company, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,.2)] w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
          <span className="text-[15px] font-bold text-[#1A202C]">Remove Experience</span>
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-md bg-[#F0F2F7] border border-[#E2E8F0] text-[#4A5568]
                       flex items-center justify-center hover:bg-[#E2E8F0] transition-colors"
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-[#4A5568]">
            Remove <strong className="text-[#1A202C]">{company}</strong> from your work experience? This cannot be undone.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-[#E2E8F0]">
          <button
            onClick={onCancel}
            className="px-3 py-[5px] rounded-md text-xs font-semibold text-[#4A5568]
                       bg-white border border-[#E2E8F0] hover:bg-[#F0F2F7] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-[5px] rounded-md text-xs font-semibold text-white
                       bg-[#DC2626] border border-[#DC2626] hover:bg-[#B91C1C] transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceItem({ exp, isLast, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const startLabel = formatMonth(exp.start_date);
  const endLabel   = exp.is_current ? 'Present' : formatMonth(exp.end_date) || 'Present';
  const dateRange  = startLabel ? `${startLabel} – ${endLabel}` : endLabel !== 'Present' ? endLabel : '';

  // Duration calculation
  const getDuration = () => {
    if (!exp.start_date) return '';
    const start = new Date(exp.start_date + '-01');
    const end   = exp.is_current || !exp.end_date ? new Date() : new Date(exp.end_date + '-01');
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (months < 1) return '< 1 month';
    const yrs = Math.floor(months / 12);
    const mos = months % 12;
    return [yrs > 0 && `${yrs} yr${yrs > 1 ? 's' : ''}`, mos > 0 && `${mos} mo`].filter(Boolean).join(' ');
  };

  const duration = getDuration();

  return (
    <>
      {/* matches .tl-item */}
      <div className={`flex gap-4 py-5 ${!isLast ? 'border-b border-[#E2E8F0]' : ''}`}>

        {/* Left column: logo + connecting line — matches .tl-left, .tl-logo, .tl-line */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div
            className="w-11 h-11 rounded-md bg-[#F0F2F7] border border-[#E2E8F0]
                       flex items-center justify-center text-sm font-extrabold text-[#4F46E5]"
            aria-label={exp.company}
          >
            {exp.company.charAt(0).toUpperCase()}
          </div>
          {!isLast && <div className="w-0.5 flex-1 bg-[#E2E8F0] mt-1.5 min-h-[20px]" />}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          {/* Role + actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {/* Designation — matches .tl-role */}
              <p className="text-[15px] font-bold text-[#1A202C] leading-snug mb-[2px] truncate">
                {exp.designation}
              </p>
              {/* Company — matches .tl-company */}
              <p className="text-[14px] font-semibold text-[#4F46E5] mb-1 truncate">
                {exp.company}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <button
                onClick={() => onEdit(exp)}
                title="Edit"
                className="w-8 h-8 rounded-md bg-white border border-[#E2E8F0] text-[#4A5568]
                           flex items-center justify-center hover:bg-[#F0F2F7] hover:border-[#CBD5E1]
                           transition-colors"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                title="Remove"
                className="w-8 h-8 rounded-md bg-white border border-[#E2E8F0] text-[#DC2626]
                           flex items-center justify-center hover:bg-[#FEE2E2] hover:border-[#DC2626]/30
                           transition-colors"
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Meta row — date range + duration — matches .tl-meta */}
          {(dateRange || duration) && (
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              {dateRange && (
                <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {dateRange}
                </span>
              )}
              {duration && (
                <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {duration}
                </span>
              )}
              {exp.is_current && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]
                                 font-semibold bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  Current
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {exp.description && (
            <p className="text-[13px] text-[#4A5568] leading-[1.65] whitespace-pre-wrap">
              {exp.description}
            </p>
          )}
        </div>
      </div>

      {showConfirm && (
        <ConfirmDeleteModal
          company={exp.company}
          onConfirm={() => { setShowConfirm(false); onDelete(exp.id); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
