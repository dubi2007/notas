'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  ChevronRightIcon as ChevronRight,
  FileTextIcon as FileText,
  FolderOpenIcon as FolderIcon,
  LayoutTemplateIcon as LayoutGrid,
  ListViewIcon as List,
  PlusIcon as Plus,
  SearchIcon as Search,
} from '@/components/icons/NavIcons'
import { NewNoteModal } from '@/components/ui/NewNoteModal'
import { useAppStore } from '@/store/useAppStore'
import { createNote, deleteNote } from '@/services/notes'
import type { Folder, Json, Note } from '@/types'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03, staggerDirection: 1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.18, ease: 'easeOut' } },
}

function extractPreview(content: Json, limit = 160): string {
  if (!content || typeof content !== 'object' || Array.isArray(content)) return ''

  const node = content as Record<string, unknown>

  if (typeof node.text === 'string') return node.text

  if (Array.isArray(node.content)) {
    return (node.content as Json[])
      .map((child) => extractPreview(child, limit))
      .join(' ')
      .trim()
      .slice(0, limit)
  }

  return ''
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  const time = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })

  if (days === 0) return `Hoy, ${time}`
  if (days === 1) return `Ayer, ${time}`
  if (days < 7) return `Hace ${days} dias`

  return date.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function FolderGridCard({
  folder,
  noteCount,
  onClick,
}: {
  folder: Folder
  noteCount: number
  onClick: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex cursor-pointer flex-col overflow-hidden rounded-2xl transition-colors"
      style={{
        background: hover ? 'var(--ds-surface-low)' : 'var(--ds-surface-lowest)',
        border: '1.5px solid rgba(145,180,228,0.2)',
        boxShadow: 'var(--ds-shadow-sm)',
        minHeight: 140,
      }}
    >
      <div
        className="flex flex-1 items-center justify-center py-6"
        style={{ background: 'var(--ds-surface)' }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl transition"
          style={{ background: hover ? 'var(--ds-secondary-cnt)' : 'rgba(145,180,228,0.15)' }}
        >
          <FolderIcon size={26} strokeWidth={1.8} style={{ color: 'var(--ds-primary)' }} />
        </div>
      </div>
      <div className="px-4 py-3">
        <p className="truncate text-sm font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
          {folder.name}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--ds-on-variant)' }}>
          {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
        </p>
      </div>
    </motion.div>
  )
}

function FolderListRow({
  folder,
  noteCount,
  onClick,
}: {
  folder: Folder
  noteCount: number
  onClick: () => void
}) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors"
      style={{ borderBottom: '1px solid rgba(145,180,228,0.12)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'rgba(5,52,92,0.03)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = 'transparent'
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: 'var(--ds-secondary-cnt)' }}
      >
        <FolderIcon size={15} strokeWidth={1.8} style={{ color: 'var(--ds-primary)' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: 'var(--ds-on-surface)' }}>
          {folder.name}
        </p>
      </div>
      <span className="shrink-0 text-xs" style={{ color: 'var(--ds-on-variant)' }}>
        {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
      </span>
      <ChevronRight size={14} style={{ color: 'var(--ds-outline)' }} />
    </motion.div>
  )
}

function NewNoteCard({ onClick }: { onClick: () => void }) {
  const [hover, setHover] = useState(false)

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex cursor-pointer flex-col items-center justify-center rounded-2xl transition-colors"
      style={{
        minHeight: 140,
        border: `2px dashed ${hover ? 'var(--ds-primary)' : 'rgba(145,180,228,0.45)'}`,
        background: hover ? 'rgba(81,72,216,0.04)' : 'transparent',
      }}
    >
      <div
        className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl transition"
        style={{
          background: hover
            ? 'linear-gradient(135deg,var(--ds-primary),var(--ds-primary-alt))'
            : 'var(--ds-secondary-cnt)',
        }}
      >
        <Plus size={28} strokeWidth={2} style={{ color: hover ? '#fff' : 'var(--ds-primary)' }} />
      </div>
      <p
        className="text-sm font-semibold transition"
        style={{ color: hover ? 'var(--ds-primary)' : 'var(--ds-on-variant)' }}
      >
        Nuevo Documento
      </p>
    </motion.div>
  )
}

function NoteGridCard({
  note,
  folderName,
  isActive,
  onClick,
  onDelete,
}: {
  note: Note
  folderName: string | null
  isActive: boolean
  onClick: () => void
  onDelete: () => void
}) {
  const preview = extractPreview(note.content)

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl transition-colors"
      style={{
        background: 'var(--ds-surface-lowest)',
        border: isActive ? '1.5px solid var(--ds-primary)' : '1.5px solid rgba(145,180,228,0.2)',
        boxShadow: isActive
          ? '0 0 0 2.5px rgba(81,72,216,0.15), var(--ds-shadow)'
          : 'var(--ds-shadow-sm)',
      }}
    >
      <div className="flex h-28 w-full overflow-hidden p-4" style={{ background: 'var(--ds-surface)' }}>
        <div className="w-full select-none space-y-1.5">
          <div className="h-2.5 w-2/3 rounded-full opacity-50" style={{ background: 'var(--ds-on-surface)' }} />
          {preview ? (
            <p className="line-clamp-4 text-[7px] leading-relaxed opacity-35" style={{ color: 'var(--ds-on-surface)' }}>
              {preview}
            </p>
          ) : (
            <>
              <div className="h-1.5 w-full rounded-full opacity-15" style={{ background: 'var(--ds-on-surface)' }} />
              <div className="h-1.5 w-5/6 rounded-full opacity-15" style={{ background: 'var(--ds-on-surface)' }} />
              <div className="h-1.5 w-4/6 rounded-full opacity-15" style={{ background: 'var(--ds-on-surface)' }} />
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <p className="truncate text-sm font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
          {note.title || 'Sin titulo'}
        </p>
        <p className="mt-0.5 text-[11px]" style={{ color: 'var(--ds-on-variant)' }}>
          {formatDate(note.updated_at)}
        </p>
        {folderName && (
          <span
            className="mt-1.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: 'var(--ds-secondary-cnt)', color: 'var(--ds-primary)' }}
          >
            {folderName}
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation()
          if (confirm('Eliminar esta nota?')) onDelete()
        }}
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-lg text-xs group-hover:flex"
        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
      >
        x
      </button>
    </motion.div>
  )
}

function NoteListRow({
  note,
  folderName,
  isActive,
  onClick,
  onDelete,
}: {
  note: Note
  folderName: string | null
  isActive: boolean
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className="group flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors"
      style={{
        background: isActive ? 'rgba(81,72,216,0.06)' : 'transparent',
        borderBottom: '1px solid rgba(145,180,228,0.12)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(5,52,92,0.03)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ background: 'var(--ds-secondary-cnt)' }}
      >
        <FileText size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" style={{ color: isActive ? 'var(--ds-primary)' : 'var(--ds-on-surface)' }}>
          {note.title || 'Sin titulo'}
        </p>
        <div className="mt-1 flex items-center gap-2 md:hidden">
          {folderName && (
            <span
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px]"
              style={{ background: 'var(--ds-secondary-cnt)', color: 'var(--ds-primary)' }}
            >
              {folderName}
            </span>
          )}
          <span className="shrink-0 text-[11px]" style={{ color: 'var(--ds-on-variant)' }}>
            {formatDate(note.updated_at)}
          </span>
        </div>
      </div>

      <div className="hidden w-[150px] shrink-0 items-center md:flex">
        <span className="truncate text-xs" style={{ color: 'var(--ds-on-variant)' }}>
          {formatDate(note.updated_at)}
        </span>
      </div>

      <div className="hidden w-[110px] shrink-0 items-center md:flex">
        {folderName && (
          <span
            className="truncate rounded-md px-2 py-0.5 text-[11px]"
            style={{ background: 'var(--ds-secondary-cnt)', color: 'var(--ds-primary)' }}
          >
            {folderName}
          </span>
        )}
      </div>

      <div className="flex w-[80px] shrink-0 justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (confirm('Eliminar esta nota?')) onDelete()
          }}
          className="rounded-lg px-2 py-1 text-xs transition md:hidden group-hover:block"
          style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}
        >
          Eliminar
        </button>
      </div>
    </motion.div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      variants={itemVariants}
      className="col-span-full mb-1 text-[11px] font-semibold uppercase tracking-widest"
      style={{ color: 'var(--ds-on-variant)' }}
    >
      {children}
    </motion.p>
  )
}

export function DashboardClient({ folderId }: { folderId?: string | null }) {
  const router = useRouter()
  const allNotes = useAppStore((state) => state.notes)
  const folders = useAppStore((state) => state.folders)
  const activeNote = useAppStore((state) => state.activeNote)
  const activeFolder = useAppStore((state) => state.activeFolder)
  const addNote = useAppStore((state) => state.addNote)
  const removeNote = useAppStore((state) => state.removeNote)
  const setActiveNote = useAppStore((state) => state.setActiveNote)
  const setActiveFolder = useAppStore((state) => state.setActiveFolder)

  useEffect(() => {
    setActiveFolder(folderId ?? null)
  }, [folderId, setActiveFolder])

  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const trimmedSearch = search.toLowerCase().trim()

  const folderById = useMemo<Record<string, Folder>>(
    () => Object.fromEntries(folders.map((folder) => [folder.id, folder])),
    [folders],
  )

  const folderNameMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(folders.map((folder) => [folder.id, folder.name])),
    [folders],
  )

  const activeFolderObj = activeFolder ? (folderById[activeFolder] ?? null) : null
  const parentFolderObj = activeFolderObj?.parent_id ? (folderById[activeFolderObj.parent_id] ?? null) : null

  const subFolders = useMemo(
    () => folders.filter((folder) => folder.parent_id === activeFolder),
    [folders, activeFolder],
  )

  const childFolderIdsByParent = useMemo(() => {
    const byParent: Record<string, string[]> = {}

    for (const folder of folders) {
      const parentKey = folder.parent_id ?? '__root__'
      byParent[parentKey] ??= []
      byParent[parentKey].push(folder.id)
    }

    return byParent
  }, [folders])

  const directNoteCountByFolder = useMemo(() => {
    const counts: Record<string, number> = {}

    for (const folder of folders) counts[folder.id] = 0

    for (const note of allNotes) {
      if (!note.folder_id) continue
      counts[note.folder_id] = (counts[note.folder_id] ?? 0) + 1
    }

    return counts
  }, [folders, allNotes])

  const noteCountByFolder = useMemo(() => {
    const cache: Record<string, number> = {}

    const countTree = (folderId: string): number => {
      if (folderId in cache) return cache[folderId]

      const total = (directNoteCountByFolder[folderId] ?? 0)
        + (childFolderIdsByParent[folderId] ?? []).reduce(
          (sum, childId) => sum + countTree(childId),
          0,
        )

      cache[folderId] = total
      return total
    }

    const counts: Record<string, number> = {}

    for (const folder of folders) {
      counts[folder.id] = countTree(folder.id)
    }

    return counts
  }, [childFolderIdsByParent, directNoteCountByFolder, folders])

  const activeFolderTreeIds = useMemo(() => {
    if (!activeFolder) return null

    const ids = new Set<string>([activeFolder])
    const queue = [activeFolder]

    while (queue.length > 0) {
      const current = queue.shift()
      if (!current) continue

      for (const childId of childFolderIdsByParent[current] ?? []) {
        if (!ids.has(childId)) {
          ids.add(childId)
          queue.push(childId)
        }
      }
    }

    return ids
  }, [activeFolder, childFolderIdsByParent])

  const directNotesInActiveFolder = useMemo(
    () => (activeFolder ? allNotes.filter((note) => note.folder_id === activeFolder) : []),
    [allNotes, activeFolder],
  )

  const filtered = useMemo(() => {
    let base: Note[]

    if (trimmedSearch) {
      if (activeFolderTreeIds) {
        base = allNotes.filter(
          (note) => note.folder_id !== null && activeFolderTreeIds.has(note.folder_id),
        )
      } else {
        base = allNotes.filter((note) => note.folder_id !== null)
      }
    } else {
      base = activeFolder ? directNotesInActiveFolder : []
    }

    if (!trimmedSearch) return base

    return base.filter((note) => (note.title || '').toLowerCase().includes(trimmedSearch))
  }, [activeFolder, activeFolderTreeIds, allNotes, directNotesInActiveFolder, trimmedSearch])

  const breadcrumb = useMemo(() => {
    const crumbs: Array<{ id: string | null; name: string }> = [{ id: null, name: 'Mis Documentos' }]

    if (parentFolderObj) crumbs.push({ id: parentFolderObj.id, name: parentFolderObj.name })
    if (activeFolderObj) crumbs.push({ id: activeFolderObj.id, name: activeFolderObj.name })

    return crumbs
  }, [activeFolderObj, parentFolderObj])

  const hasSubfolders = subFolders.length > 0
  const showNotesSection = activeFolder !== null || trimmedSearch.length > 0
  const activeFolderNoteCount = activeFolder ? (noteCountByFolder[activeFolder] ?? 0) : 0
  const canCreateInCurrentFolder = activeFolder !== null && trimmedSearch.length === 0

  const getNoteFolderBadge = (note: Note) => {
    if (!note.folder_id) return null
    if (!activeFolder) return folderNameMap[note.folder_id] ?? null
    if (trimmedSearch && note.folder_id !== activeFolder) {
      return folderNameMap[note.folder_id] ?? null
    }
    return null
  }

  const openNote = (note: Note) => {
    setActiveNote(note.id)
    router.push(`/notes/${note.id}`)
  }

  const doCreateNote = async (content?: Json) => {
    if (!activeFolder) return

    const note = await createNote(activeFolder, content)
    addNote(note)
    setActiveNote(note.id)
    setShowNoteModal(false)
    router.push(`/notes/${note.id}`)
  }

  const handleDelete = async (id: string) => {
    await deleteNote(id)
    removeNote(id)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <AnimatePresence>
        {showNoteModal && activeFolder && (
          <NewNoteModal
            onSelectBlank={() => doCreateNote()}
            onSelectTemplate={(content) => doCreateNote(content)}
            onClose={() => setShowNoteModal(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex shrink-0 flex-col justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center md:px-8 md:py-5"
        style={{ borderBottom: '1px solid rgba(145,180,228,0.2)' }}
      >
        <div>
          <div className="flex items-center gap-1">
            {breadcrumb.map((crumb, index) => (
              <Fragment key={crumb.id ?? 'root'}>
                {index > 0 && <ChevronRight size={14} style={{ color: 'var(--ds-outline)' }} />}
                <button
                  onClick={() => router.push(crumb.id ? `/app/${crumb.id}` : '/app')}
                  className="transition"
                  style={{
                    fontSize: index === breadcrumb.length - 1 ? '1.2rem' : '0.95rem',
                    fontWeight: 700,
                    color: index === breadcrumb.length - 1 ? 'var(--ds-on-surface)' : 'var(--ds-on-variant)',
                    opacity: index === breadcrumb.length - 1 ? 1 : 0.7,
                  }}
                >
                  {crumb.name}
                </button>
              </Fragment>
            ))}
          </div>
          {activeFolder && (
            <p className="mt-0.5 text-xs" style={{ color: 'var(--ds-on-variant)' }}>
              {subFolders.length > 0 && `${subFolders.length} subcarpeta${subFolders.length > 1 ? 's' : ''} · `}
              {activeFolderNoteCount} {activeFolderNoteCount === 1 ? 'nota' : 'notas'}
            </p>
          )}
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <div className="relative flex-1 sm:flex-initial">
            <Search
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--ds-outline)' }}
            />
            <input
              type="search"
              placeholder="Filtrar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-curator w-full py-1.5 pl-8 pr-3 text-sm sm:w-36"
              style={{ color: 'var(--ds-on-surface)' }}
            />
          </div>

          <div className="flex overflow-hidden rounded-xl" style={{ border: '1px solid rgba(145,180,228,0.3)' }}>
            {(['list', 'grid'] as const).map((nextView) => (
              <button
                key={nextView}
                onClick={() => setView(nextView)}
                className="flex h-8 w-8 items-center justify-center transition"
                style={{
                  background: view === nextView ? 'var(--ds-secondary-cnt)' : 'var(--ds-surface-lowest)',
                  color: view === nextView ? 'var(--ds-primary)' : 'var(--ds-on-variant)',
                }}
              >
                {nextView === 'list' ? <List size={14} /> : <LayoutGrid size={14} />}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
        {view === 'grid' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-4 md:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]"
          >
            {hasSubfolders && !trimmedSearch && (
              <>
                <SectionLabel>Subcarpetas</SectionLabel>
                {subFolders.map((folder) => (
                  <FolderGridCard
                    key={folder.id}
                    folder={folder}
                    noteCount={noteCountByFolder[folder.id] ?? 0}
                    onClick={() => router.push(`/app/${folder.id}`)}
                  />
                ))}
                {showNotesSection && (
                  <>
                    <div className="col-span-full" style={{ height: 8 }} />
                    {filtered.length > 0 && <SectionLabel>Documentos</SectionLabel>}
                  </>
                )}
              </>
            )}

            {showNotesSection && (
              <>
                {canCreateInCurrentFolder && (
                  <NewNoteCard onClick={() => setShowNoteModal(true)} />
                )}
                {filtered.map((note) => (
                  <NoteGridCard
                    key={note.id}
                    note={note}
                    folderName={getNoteFolderBadge(note)}
                    isActive={activeNote === note.id}
                    onClick={() => openNote(note)}
                    onDelete={() => handleDelete(note.id)}
                  />
                ))}
              </>
            )}

            {!showNotesSection && !hasSubfolders && !trimmedSearch && (
              <motion.div variants={itemVariants} className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--ds-secondary-cnt)' }}
                >
                  <FolderIcon size={28} strokeWidth={1.5} style={{ color: 'var(--ds-primary)' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
                  No hay carpetas todavia
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ds-on-variant)' }}>
                  Crea tu primera carpeta desde la barra lateral
                </p>
              </motion.div>
            )}

            {showNotesSection && filtered.length === 0 && !hasSubfolders && !trimmedSearch && (
              <motion.div variants={itemVariants} className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--ds-secondary-cnt)' }}
                >
                  <FileText size={28} strokeWidth={1.5} style={{ color: 'var(--ds-primary)' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
                  Esta carpeta esta vacia
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ds-on-variant)' }}>
                  Usa la tarjeta &quot;Nuevo Documento&quot; para crear el primero
                </p>
              </motion.div>
            )}

            {showNotesSection && filtered.length === 0 && !!trimmedSearch && (
              <motion.div variants={itemVariants} className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ background: 'var(--ds-secondary-cnt)' }}
                >
                  <Search size={28} strokeWidth={1.5} style={{ color: 'var(--ds-primary)' }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--ds-on-surface)' }}>
                  Sin resultados
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--ds-on-variant)' }}>
                  Prueba con otro titulo o navega a una carpeta distinta
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {view === 'list' && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="overflow-hidden rounded-2xl"
            style={{
              border: '1px solid rgba(145,180,228,0.2)',
              background: 'var(--ds-surface-lowest)',
            }}
          >
            {hasSubfolders && !trimmedSearch && (
              <>
                <div
                  className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest"
                  style={{
                    borderBottom: '1px solid rgba(145,180,228,0.2)',
                    color: 'var(--ds-on-variant)',
                    background: 'var(--ds-surface)',
                  }}
                >
                  Subcarpetas
                </div>
                {subFolders.map((folder) => (
                  <FolderListRow
                    key={folder.id}
                    folder={folder}
                    noteCount={noteCountByFolder[folder.id] ?? 0}
                    onClick={() => router.push(`/app/${folder.id}`)}
                  />
                ))}
              </>
            )}

            {showNotesSection && (
              <>
                <div
                  className="hidden grid-cols-[1fr_150px_110px_80px] gap-4 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide md:grid"
                  style={{
                    borderBottom: '1px solid rgba(145,180,228,0.2)',
                    borderTop: hasSubfolders && !trimmedSearch ? '1px solid rgba(145,180,228,0.2)' : undefined,
                    color: 'var(--ds-on-variant)',
                    background: 'var(--ds-surface)',
                  }}
                >
                  <span>Nombre</span>
                  <span>Ultima edicion</span>
                  <span>Carpeta</span>
                  <span />
                </div>

                {filtered.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm" style={{ color: 'var(--ds-outline)' }}>
                    Sin resultados
                  </p>
                ) : (
                  filtered.map((note) => (
                    <NoteListRow
                      key={note.id}
                      note={note}
                      folderName={getNoteFolderBadge(note)}
                      isActive={activeNote === note.id}
                      onClick={() => openNote(note)}
                      onDelete={() => handleDelete(note.id)}
                    />
                  ))
                )}

                {canCreateInCurrentFolder && (
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowNoteModal(true)}
                    className="flex cursor-pointer items-center gap-4 px-4 py-3 transition-colors"
                    style={{ color: 'var(--ds-primary)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(81,72,216,0.04)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent'
                    }}
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: 'var(--ds-secondary-cnt)' }}
                    >
                      <Plus size={14} />
                    </div>
                    <span className="text-sm font-medium">Nueva nota</span>
                  </motion.div>
                )}
              </>
            )}

            {!showNotesSection && !hasSubfolders && (
              <p className="px-4 py-10 text-center text-sm" style={{ color: 'var(--ds-outline)' }}>
                No hay carpetas todavia
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
