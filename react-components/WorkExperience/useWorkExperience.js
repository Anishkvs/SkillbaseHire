import { useState, useCallback, useRef, useEffect } from 'react';
import { MONTHS } from './constants';

const DRAFT_KEY = 'sbh_exp_draft';

// Newest start date first; experiences with no start date go to the end
function sortByDateDesc(list) {
  return [...list].sort((a, b) => {
    const aMs = a.start_year
      ? parseInt(a.start_year) * 12 + (MONTHS.indexOf(a.start_month) ?? 0)
      : -Infinity;
    const bMs = b.start_year
      ? parseInt(b.start_year) * 12 + (MONTHS.indexOf(b.start_month) ?? 0)
      : -Infinity;
    return bMs - aMs;
  });
}

const EMPTY_FORM = {
  employment_type: '',
  designation:     '',
  company:         '',
  is_current:      false,
  start_month:     '',
  start_year:      '',
  end_month:       '',
  end_year:        '',
  description:     '',
};

function validate(data) {
  const errs = {};
  if (!data.employment_type)    errs.employment_type = 'Employment type is required.';
  if (!data.designation.trim()) errs.designation     = 'Designation is required.';
  if (!data.company.trim())     errs.company         = 'Company name is required.';
  if (!data.start_month)        errs.start_month     = 'Select start month.';
  if (!data.start_year)         errs.start_year      = 'Select start year.';
  if (!data.is_current) {
    if (!data.end_month)        errs.end_month       = 'Select end month.';
    if (!data.end_year)         errs.end_year        = 'Select end year.';
    // Future end date check
    if (data.start_year && data.end_year && data.start_month && data.end_month) {
      const sMs = parseInt(data.start_year) * 12 + MONTHS.indexOf(data.start_month);
      const eMs = parseInt(data.end_year)   * 12 + MONTHS.indexOf(data.end_month);
      const now  = new Date();
      const nowMs = now.getFullYear() * 12 + now.getMonth();
      if (eMs < sMs)  errs.end_month  = 'End date must be after start date.';
      if (eMs > nowMs) errs.end_month = 'End date cannot be in the future.';
    }
  }
  if (!data.description.trim()) errs.description = 'Job profile is required.';
  return errs;
}

export function useWorkExperience(initialExperiences = []) {
  const [experiences,  setExperiences]  = useState(() => sortByDateDesc(initialExperiences));
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [editingId,    setEditingId]    = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});
  const [touched,      setTouched]      = useState({});
  const [isLoading,    setIsLoading]    = useState(false);
  const [isSkeleton,   setIsSkeleton]   = useState(false);
  const [draftStatus,  setDraftStatus]  = useState('');   // '' | 'saving' | 'saved'
  const [expandedIds,  setExpandedIds]  = useState(new Set());
  const [deleteId,     setDeleteId]     = useState(null); // confirmation modal

  const draftTimer = useRef(null);

  /* ── Draft auto-save ───────────────────────────────────────────── */
  useEffect(() => {
    if (!isModalOpen) return;
    clearTimeout(draftTimer.current);
    setDraftStatus('saving');
    draftTimer.current = setTimeout(() => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(formData)); } catch {}
      setDraftStatus('saved');
      setTimeout(() => setDraftStatus(''), 2000);
    }, 1000);
    return () => clearTimeout(draftTimer.current);
  }, [formData, isModalOpen]);

  /* ── Modal open/close ──────────────────────────────────────────── */
  const openAdd = useCallback(() => {
    const draft = (() => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch { return null; } })();
    setFormData(draft || EMPTY_FORM);
    setErrors({});
    setTouched({});
    setEditingId(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((exp) => {
    setFormData({
      employment_type: exp.employment_type || '',
      designation:     exp.designation     || '',
      company:         exp.company         || '',
      is_current:      Boolean(exp.is_current),
      start_month:     exp.start_month     || '',
      start_year:      exp.start_year      || '',
      end_month:       exp.end_month       || '',
      end_year:        exp.end_year        || '',
      description:     exp.description     || '',
    });
    setErrors({});
    setTouched({});
    setEditingId(exp.id);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraftStatus('');
  }, []);

  /* ── Form field change ─────────────────────────────────────────── */
  const setField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const touchField = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  /* ── Is form valid (for Save button) ──────────────────────────── */
  const isFormValid = Object.keys(validate(formData)).length === 0;

  /* ── Save ──────────────────────────────────────────────────────── */
  const saveExperience = useCallback(async (onSave) => {
    const allTouched = Object.fromEntries(Object.keys(EMPTY_FORM).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setIsLoading(true);
    try {
      if (onSave) await onSave(formData, editingId);
      if (editingId !== null) {
        setExperiences(prev => sortByDateDesc(prev.map(e => e.id === editingId ? { ...e, ...formData } : e)));
      } else {
        setExperiences(prev => sortByDateDesc([{ id: Date.now(), ...formData }, ...prev]));
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      closeModal();
    } finally {
      setIsLoading(false);
    }
  }, [formData, editingId, closeModal]);

  /* ── Delete ────────────────────────────────────────────────────── */
  const confirmDelete = useCallback((id) => setDeleteId(id), []);
  const cancelDelete  = useCallback(() => setDeleteId(null), []);
  const executeDelete = useCallback(async (onDelete) => {
    if (onDelete) await onDelete(deleteId);
    setExperiences(prev => prev.filter(e => e.id !== deleteId));
    setDeleteId(null);
  }, [deleteId]);

  /* ── Expand/collapse description ───────────────────────────────── */
  const toggleExpand = useCallback((id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /* ── Realtime field errors (only show after touch) ─────────────── */
  const fieldError = useCallback((field) => touched[field] ? validate(formData)[field] : undefined, [touched, formData]);

  return {
    experiences, isModalOpen, editingId, formData, errors, touched,
    isLoading, isSkeleton, setIsSkeleton, draftStatus, expandedIds,
    deleteId, isFormValid,
    openAdd, openEdit, closeModal,
    setField, touchField, fieldError,
    saveExperience, confirmDelete, cancelDelete, executeDelete,
    toggleExpand,
  };
}
