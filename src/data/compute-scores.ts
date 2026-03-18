import { createContext, useContext, useState, useCallback, createElement, type ReactNode } from 'react';
import allControls from './mcsb-controls.json';
import type { Control, ControlStatus } from '../types/control';

const typedControls = allControls as Record<string, Control[]>;

// --- localStorage-backed status store ---

const STORAGE_KEY = 'mcsb-control-statuses';
const NOTES_KEY = 'mcsb-control-notes';
type StatusMap = Record<string, ControlStatus>;
type NotesMap = Record<string, string>;

interface StatusStore {
  getStatus: (controlId: string) => ControlStatus;
  setStatus: (controlId: string, status: ControlStatus) => void;
  getNote: (controlId: string) => string;
  setNote: (controlId: string, note: string) => void;
  resetAll: () => void;
  statusMap: StatusMap;
  notesMap: NotesMap;
}

const StatusContext = createContext<StatusStore | null>(null);

function loadFromStorage(): StatusMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StatusMap;
  } catch { /* ignore corrupted data */ }
  return {};
}

function saveToStorage(map: StatusMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function loadNotes(): NotesMap {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (raw) return JSON.parse(raw) as NotesMap;
  } catch { /* ignore corrupted data */ }
  return {};
}

function saveNotes(map: NotesMap) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(map));
}

export function StatusProvider({ children }: { children: ReactNode }) {
  const [statusMap, setStatusMap] = useState<StatusMap>(loadFromStorage);
  const [notesMap, setNotesMap] = useState<NotesMap>(loadNotes);

  const getStatus = useCallback(
    (controlId: string): ControlStatus => statusMap[controlId] ?? 'unchecked',
    [statusMap],
  );

  const setStatus = useCallback((controlId: string, status: ControlStatus) => {
    setStatusMap((prev) => {
      const next = { ...prev, [controlId]: status };
      saveToStorage(next);
      return next;
    });
  }, []);

  const getNote = useCallback(
    (controlId: string): string => notesMap[controlId] ?? '',
    [notesMap],
  );

  const setNote = useCallback((controlId: string, note: string) => {
    setNotesMap((prev) => {
      const next = { ...prev };
      if (note.trim()) {
        next[controlId] = note;
      } else {
        delete next[controlId];
      }
      saveNotes(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setStatusMap({});
    setNotesMap({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(NOTES_KEY);
  }, []);

  return createElement(StatusContext.Provider, { value: { getStatus, setStatus, getNote, setNote, resetAll, statusMap, notesMap } }, children);
}

export function useStatusStore(): StatusStore {
  const ctx = useContext(StatusContext);
  if (!ctx) throw new Error('useStatusStore must be used within StatusProvider');
  return ctx;
}

// --- Compliance score (reads from user statuses) ---

export function getComplianceScore(domainCode: string, statusMap: StatusMap): number {
  const controls = typedControls[domainCode];
  if (!controls || controls.length === 0) return 0;
  const compliant = controls.filter((c) => (statusMap[c.id] ?? 'unchecked') === 'compliant').length;
  const partial = controls.filter((c) => (statusMap[c.id] ?? 'unchecked') === 'partial').length;
  return Math.round(((compliant + partial * 0.5) / controls.length) * 100);
}

export function getAssessedCount(domainCode: string, statusMap: StatusMap): { assessed: number; total: number } {
  const controls = typedControls[domainCode];
  if (!controls) return { assessed: 0, total: 0 };
  const assessed = controls.filter((c) => (statusMap[c.id] ?? 'unchecked') !== 'unchecked').length;
  return { assessed, total: controls.length };
}

// --- Get controls with user-set statuses applied ---

export function getControlsWithStatus(domainCode: string, statusMap: StatusMap): Control[] {
  const controls = typedControls[domainCode];
  if (!controls) return [];
  return controls.map((c) => ({ ...c, status: statusMap[c.id] ?? 'unchecked' }));
}

export function getAllControlsWithStatus(statusMap: StatusMap): (Control & { domainCode: string })[] {
  return Object.entries(typedControls).flatMap(([code, controls]) =>
    controls.map((c) => ({ ...c, domainCode: code, status: statusMap[c.id] ?? 'unchecked' })),
  );
}
