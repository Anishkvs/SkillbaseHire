import React from 'react';

// Matches .fc, .fg, .form-grid, .form-actions, .edit-panel from candidate_profile.html
const inputCls =
  'w-full bg-white border border-[#E2E8F0] rounded-md px-3 py-2 text-sm text-[#1A202C] ' +
  'outline-none transition-all placeholder:text-[#94A3B8] ' +
  'focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/10';

const labelCls = 'text-xs font-semibold text-[#4A5568]';

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-[5px]">
      <label className={labelCls}>
        {label}{required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-[11px] text-[#DC2626] font-medium">{error}</span>
      )}
    </div>
  );
}

export default function ExperienceForm({ formData, errors, isLoading, editingId, onChange, onSave, onCancel }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    // Matches .edit-panel — bg-page-bg, border-top, padding
    <div className="bg-[#F0F2F7] border-t border-[#E2E8F0] p-5">
      <form onSubmit={handleSubmit} noValidate>

        {/* 2-column grid — matches .form-grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">

          {/* Company */}
          <Field label="Company" required error={errors.company}>
            <input
              className={inputCls}
              type="text"
              placeholder="e.g. Aspire Systems"
              value={formData.company}
              onChange={e => onChange('company', e.target.value)}
              autoFocus
            />
          </Field>

          {/* Designation */}
          <Field label="Designation" required error={errors.designation}>
            <input
              className={inputCls}
              type="text"
              placeholder="e.g. QA Automation Engineer"
              value={formData.designation}
              onChange={e => onChange('designation', e.target.value)}
            />
          </Field>

          {/* Start Date */}
          <Field label="Start Date">
            <input
              className={inputCls}
              type="month"
              value={formData.start_date}
              onChange={e => onChange('start_date', e.target.value)}
            />
          </Field>

          {/* End Date + Currently working */}
          <Field label="End Date">
            <input
              className={inputCls}
              type="month"
              value={formData.end_date}
              disabled={formData.is_current}
              onChange={e => onChange('end_date', e.target.value)}
            />
            <label className="flex items-center gap-[6px] mt-[5px] text-[13px] text-[#4A5568] cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#4F46E5] cursor-pointer"
                checked={formData.is_current}
                onChange={e => {
                  onChange('is_current', e.target.checked);
                  if (e.target.checked) onChange('end_date', '');
                }}
              />
              Currently working here
            </label>
          </Field>

          {/* Description — spans full width (.fg.span-2) */}
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                className={`${inputCls} resize-y min-h-[80px]`}
                placeholder="Describe your role, responsibilities, and key achievements..."
                rows={3}
                value={formData.description}
                onChange={e => onChange('description', e.target.value)}
              />
            </Field>
          </div>
        </div>

        {/* Form actions — matches .form-actions */}
        <div className="flex items-center gap-2 mt-[14px]">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-md text-xs font-semibold
                       bg-[#4F46E5] text-white border border-[#4F46E5]
                       hover:bg-[#4338CA] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Saving…
              </>
            ) : (
              editingId !== null ? 'Update Experience' : 'Save Experience'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-3 py-[5px] rounded-md text-xs font-semibold
                       bg-white text-[#4A5568] border border-[#E2E8F0]
                       hover:bg-[#F0F2F7] hover:border-[#CBD5E1] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
