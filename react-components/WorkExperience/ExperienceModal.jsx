import React, { useEffect, useRef, useState } from 'react';
import { EMPLOYMENT_TYPES, MAX_DESC_CHARS } from './constants';
import { MonthYearPicker } from './DatePicker';

/* ── Shared underline input styles ─────────────────────────────── */
const ulInput =
  'w-full bg-transparent border-0 border-b-2 border-[#E2E8F0] pb-2 pt-1 ' +
  'text-[14px] text-[#1A202C] placeholder:text-[#94A3B8] outline-none ' +
  'transition-colors focus:border-[#4F46E5] peer';

const ulLabel =
  'block text-[11.5px] font-semibold text-[#94A3B8] uppercase tracking-wide mb-1';

/* ── Underline Field wrapper ────────────────────────────────────── */
function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col">
      <label className={ulLabel}>
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="mt-1 text-[11.5px] text-[#DC2626] font-medium flex items-center gap-1">
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

/* ── Select (underline) ─────────────────────────────────────────── */
function USelect({ value, onChange, onBlur, placeholder, options, disabled = false }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      disabled={disabled}
      className={`${ulInput} appearance-none cursor-pointer bg-no-repeat
        ${!value ? 'text-[#94A3B8]' : ''}
        disabled:opacity-40 disabled:cursor-not-allowed`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%2394A3B8' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundPosition: 'right 4px center', paddingRight: '24px' }}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ── Text input (underline) ─────────────────────────────────────── */
function UInput({ value, onChange, onBlur, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className={ulInput}
    />
  );
}

/* ── Draft status indicator ─────────────────────────────────────── */
function DraftBadge({ status }) {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium transition-all
      ${status === 'saving' ? 'text-[#94A3B8]' : 'text-[#16A34A]'}`}>
      {status === 'saving' ? (
        <>
          <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          Saving draft…
        </>
      ) : (
        <>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
          Draft saved
        </>
      )}
    </span>
  );
}

/* ── Main Modal ─────────────────────────────────────────────────── */
export default function ExperienceModal({
  isOpen, editingId, formData, draftStatus, isLoading, isFormValid,
  fieldError, setField, touchField, onSave, onCancel,
}) {
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef(null);
  const curYear = new Date().getFullYear();

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = 'hidden';
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isEdit = editingId !== null;

  return (
    /* Backdrop */
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center
                  transition-all duration-300
                  ${visible ? 'bg-black/50 backdrop-blur-[2px]' : 'bg-black/0'}`}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* Modal panel */}
      <div
        className={`relative w-full sm:max-w-lg bg-white flex flex-col
                    sm:rounded-2xl rounded-t-2xl
                    shadow-[0_24px_64px_rgba(0,0,0,.2)]
                    transition-all duration-300 ease-out
                    max-h-[92dvh] sm:max-h-[90vh]
                    ${visible
                      ? 'translate-y-0 sm:scale-100 sm:opacity-100'
                      : 'translate-y-full sm:translate-y-0 sm:scale-95 sm:opacity-0'}`}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-[#E2E8F0]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-bold text-[#1A202C] leading-tight">
                {isEdit ? 'Edit experience' : 'Add experience'}
              </h2>
              <p className="text-[12.5px] text-[#94A3B8] mt-1 leading-relaxed max-w-xs">
                Your journey details will help us match your profile to suitable jobs
              </p>
            </div>
            <button
              onClick={onCancel}
              className="w-8 h-8 flex-shrink-0 rounded-lg bg-[#F0F2F7] border border-[#E2E8F0]
                         text-[#94A3B8] flex items-center justify-center
                         hover:bg-[#E2E8F0] hover:text-[#4A5568] transition-all"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" ref={scrollRef}>

          {/* Employment type */}
          <Field label="Employment type" required error={fieldError('employment_type')}>
            <USelect
              value={formData.employment_type}
              onChange={v => setField('employment_type', v)}
              onBlur={() => touchField('employment_type')}
              placeholder="Select employment type"
              options={EMPLOYMENT_TYPES}
            />
          </Field>

          {/* Designation */}
          <Field label="Designation" required error={fieldError('designation')}>
            <UInput
              value={formData.designation}
              onChange={v => setField('designation', v)}
              onBlur={() => touchField('designation')}
              placeholder="e.g. Automation Test Lead"
            />
          </Field>

          {/* Company name */}
          <Field label="Company name" required error={fieldError('company')}>
            <UInput
              value={formData.company}
              onChange={v => setField('company', v)}
              onBlur={() => touchField('company')}
              placeholder="Company Name"
            />
          </Field>

          {/* Current company */}
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <div className="relative flex-shrink-0">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.is_current}
                onChange={e => {
                  setField('is_current', e.target.checked);
                  if (e.target.checked) { setField('end_month', ''); setField('end_year', ''); }
                }}
              />
              <div className="w-5 h-5 rounded-md border-2 border-[#E2E8F0] bg-white
                              peer-checked:bg-[#4F46E5] peer-checked:border-[#4F46E5]
                              transition-all flex items-center justify-center">
                {formData.is_current && (
                  <svg width="11" height="11" fill="none" stroke="white" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </div>
            </div>
            <div>
              <span className="text-[13.5px] font-semibold text-[#1A202C] group-hover:text-[#4F46E5] transition-colors">
                Mark as current company
              </span>
              <p className="text-[11.5px] text-[#94A3B8]">I currently work here</p>
            </div>
          </label>

          {/* Worked from */}
          <MonthYearPicker
            label="Worked from"
            required
            monthValue={formData.start_month}
            yearValue={formData.start_year}
            onMonthChange={v => setField('start_month', v)}
            onYearChange={v => setField('start_year', v)}
            onBlur={() => { touchField('start_month'); touchField('start_year'); }}
            maxYear={curYear}
            monthError={fieldError('start_month')}
            yearError={fieldError('start_year')}
          />

          {/* Worked till */}
          <MonthYearPicker
            label="Worked till"
            required
            disabled={formData.is_current}
            monthValue={formData.end_month}
            yearValue={formData.end_year}
            onMonthChange={v => setField('end_month', v)}
            onYearChange={v => setField('end_year', v)}
            onBlur={() => { touchField('end_month'); touchField('end_year'); }}
            maxYear={curYear}
            monthError={fieldError('end_month')}
            yearError={fieldError('end_year')}
          />

          {/* Job profile */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <span className={ulLabel}>
                Job profile<span className="text-[#DC2626] ml-0.5">*</span>
              </span>
              <span className={`text-[11px] font-medium ${formData.description.length > MAX_DESC_CHARS * 0.9 ? 'text-[#DC2626]' : 'text-[#94A3B8]'}`}>
                {formData.description.length}/{MAX_DESC_CHARS}
              </span>
            </div>
            <textarea
              value={formData.description}
              onChange={e => {
                if (e.target.value.length <= MAX_DESC_CHARS) setField('description', e.target.value);
              }}
              onBlur={() => touchField('description')}
              placeholder={`Describe your role and key contributions...\n\nTip: Start lines with "• " to add bullet points`}
              rows={5}
              className={`${ulInput} resize-y min-h-[100px] whitespace-pre-wrap`}
            />
            {/* Bullet button */}
            <button
              type="button"
              onClick={() => {
                const val = formData.description;
                const needsNewline = val.length > 0 && !val.endsWith('\n');
                setField('description', (needsNewline ? val + '\n' : val) + '• ');
              }}
              className="self-start mt-2 text-[11.5px] font-semibold text-[#4F46E5]
                         hover:text-[#4338CA] flex items-center gap-1 transition-colors"
            >
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6"  x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Add bullet point
            </button>
            {fieldError('description') && (
              <span className="mt-1 text-[11.5px] text-[#DC2626] font-medium">
                {fieldError('description')}
              </span>
            )}
          </div>

          {/* Bottom spacing on mobile for fixed footer */}
          <div className="h-2 sm:h-0" />
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-[#E2E8F0] bg-white sm:rounded-b-2xl">
          <div className="flex items-center justify-between gap-3">
            <DraftBadge status={draftStatus} />
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#4A5568]
                           border border-[#E2E8F0] hover:bg-[#F0F2F7] hover:border-[#CBD5E1]
                           transition-all active:scale-[.98]"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={!isFormValid || isLoading}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold text-white
                            transition-all active:scale-[.98]
                            ${isFormValid && !isLoading
                              ? 'bg-[#4F46E5] hover:bg-[#4338CA] shadow-[0_4px_12px_rgba(79,70,229,.35)] hover:shadow-[0_4px_16px_rgba(79,70,229,.45)]'
                              : 'bg-[#94A3B8] cursor-not-allowed shadow-none'}`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Saving…
                  </span>
                ) : isEdit ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
