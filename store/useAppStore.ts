'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Folder, Note, SaveStatus, User } from '@/types'

interface AppStore {
  // ── Auth
  user: User | null
  setUser: (user: User | null) => void

  // ── Folders
  folders: Folder[]
  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  updateFolder: (id: string, name: string) => void
  removeFolder: (id: string) => void

  // ── Notes
  notes: Note[]
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, partial: Partial<Note>) => void
  removeNote: (id: string) => void

  // ── Active selection
  activeFolder: string | null
  setActiveFolder: (id: string | null) => void
  activeNote: string | null
  setActiveNote: (id: string | null) => void

  // ── Save status
  saveStatus: SaveStatus
  setSaveStatus: (status: SaveStatus) => void

  // ── Search
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export const useAppStore = create<AppStore>()(
  devtools(
    (set) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),

      // Folders
      folders: [],
      setFolders: (folders) => set({ folders }),
      addFolder: (folder) =>
        set((s) => ({ folders: [folder, ...s.folders] })),
      updateFolder: (id, name) =>
        set((s) => ({
          folders: s.folders.map((f) => (f.id === id ? { ...f, name } : f)),
        })),
      removeFolder: (id) =>
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
          notes: s.notes.filter((n) => n.folder_id !== id),
          activeFolder: s.activeFolder === id ? null : s.activeFolder,
        })),

      // Notes
      notes: [],
      setNotes: (notes) => set({ notes }),
      addNote: (note) =>
        set((s) => ({ notes: [note, ...s.notes] })),
      updateNote: (id, partial) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, ...partial } : n)),
        })),
      removeNote: (id) =>
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          activeNote: s.activeNote === id ? null : s.activeNote,
        })),

      // Active selection
      activeFolder: null,
      setActiveFolder: (id) => set({ activeFolder: id }),
      activeNote: null,
      setActiveNote: (id) => set({ activeNote: id }),

      // Save status
      saveStatus: 'idle',
      setSaveStatus: (status) => set({ saveStatus: status }),

      // Search
      searchQuery: '',
      setSearchQuery: (searchQuery) => set({ searchQuery }),
    }),
    { name: 'notas-app' },
  ),
)
