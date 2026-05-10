import React, { useState } from 'react';
import ExperienceCard, { DeleteConfirmModal } from './ExperienceCard';
import ExperienceModal from './ExperienceModal';
import SkeletonLoader from './SkeletonLoader';
import { useWorkExperience } from './useWorkExperience';
import { calcTotalExperience } from './constants';

/* ── Empty state ────────────────────────────────────────────────── */
function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center py-10 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] flex items-center justify-center mb-4">
        <svg width="28" height="28" fill="none" stroke="#4F46E5" strokeWidth="1.75" viewBox="0 0 24 24">
          <rect x="2" y="7" width="20" height="14" rx="2"/>
          <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
        </svg>
      </div>
      <p className="text-[15px] font-semibold text-[#1A202C] mb-1">No experience added yet</p>
      <p className="text-[13px] text-[#94A3B8] mb-5 max-w-xs leading-relaxed">
        Adding your work experience helps recruiters understand your background and improves your profile strength.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                   bg-[#4F46E5] text-white shadow-[0_4px_12px_rgba(79,70,229,.3)]
                   hover:bg-[#4338CA] hover:shadow-[0_4px_16px_rgba(79,70,229,.4)]
                   transition-all active:scale-[.98]"
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add Experience
      </button>
    </div>
  );
}

/* ── Section Header ─────────────────────────────────────────────── */
function SectionHeader({ totalExp, onAdd }) {
  return (
    <div className="flex items-center justify-between px-5 py-[14px] border-b border-[#E2E8F0]">
      <div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" fill="none" stroke="#4F46E5" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
          </svg>
          <h2 className="text-[15px] font-bold text-[#1A202C]">Experience</h2>
        </div>
        {totalExp && (
          <p className="text-[12px] text-[#94A3B8] font-medium mt-0.5 pl-6">
            Total experience {totalExp}
          </p>
        )}
      </div>

      <button
        onClick={onAdd}
        title="Add experience"
        className="w-8 h-8 rounded-lg flex items-center justify-center
                   text-[#4F46E5] bg-[#EEF2FF] border border-[#4F46E5]/20
                   hover:bg-[#E0E7FF] hover:border-[#4F46E5]/40
                   transition-all active:scale-95"
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>
  );
}

/* ── Main Export ────────────────────────────────────────────────── */
/**
 * WorkExperience section — drop in anywhere on the candidate profile.
 *
 * Props:
 *   initialExperiences  {array}    Pre-loaded records from backend
 *   onSave(data, id)    {async}    id=null → new, id=number → update
 *   onDelete(id)        {async}    Called before optimistic update
 *   loading             {boolean}  Show skeleton while data loads
 */
export default function WorkExperience({
  initialExperiences = [],
  onSave,
  onDelete,
  loading = false,
}) {
  const {
    experiences, isModalOpen, editingId,
    formData, draftStatus, isLoading, isSkeleton,
    isFormValid, expandedIds, deleteId,
    openAdd, openEdit, closeModal,
    setField, touchField, fieldError,
    saveExperience, confirmDelete, cancelDelete, executeDelete,
    toggleExpand,
  } = useWorkExperience(initialExperiences);

  const totalExp = calcTotalExperience(experiences);
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <>
      {/* ── Card shell — matches .card in candidate_profile.html ── */}
      {/* overflow-hidden intentionally omitted so action-menu dropdowns are not clipped */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl mb-5
                      shadow-[0_1px_3px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.06)]">

        <SectionHeader totalExp={totalExp} onAdd={openAdd} />

        {/* Body */}
        {loading || isSkeleton ? (
          <SkeletonLoader count={2} />
        ) : experiences.length === 0 ? (
          <EmptyState onAdd={openAdd} />
        ) : (
          <div className="px-5 pb-1">
            {experiences.map((exp, idx) => (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                isLast={idx === experiences.length - 1}
                isExpanded={expandedIds.has(exp.id)}
                onEdit={openEdit}
                onDelete={confirmDelete}
                onToggleExpand={toggleExpand}
                isMenuOpen={openMenuId === exp.id}
                onMenuOpen={() => setOpenMenuId(exp.id)}
                onMenuClose={() => setOpenMenuId(null)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Add / Edit modal ── */}
      <ExperienceModal
        isOpen={isModalOpen}
        editingId={editingId}
        formData={formData}
        draftStatus={draftStatus}
        isLoading={isLoading}
        isFormValid={isFormValid}
        fieldError={fieldError}
        setField={setField}
        touchField={touchField}
        onSave={() => saveExperience(onSave)}
        onCancel={closeModal}
      />

      {/* ── Delete confirmation ── */}
      {deleteId !== null && (
        <DeleteConfirmModal
          company={experiences.find(e => e.id === deleteId)?.company ?? ''}
          onConfirm={() => executeDelete(onDelete)}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}
