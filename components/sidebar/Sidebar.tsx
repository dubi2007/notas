'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HouseIcon } from '@/components/icons/HouseIcon'
import { FolderPlusIcon } from '@/components/icons/FolderPlusIcon'
import { LunaIcon } from '@/components/icons/LunaIcon'
import {
  ChevronRightIcon,
  FolderOpenIcon,
  LayoutTemplateIcon,
  PlusIcon,
  SearchIcon,
} from '@/components/icons/NavIcons'
import { SunIcon } from '@/components/icons/SunIcon'
import { SaveStatus } from '@/components/ui/SaveStatus'
import { NewNoteModal } from '@/components/ui/NewNoteModal'
import { useFolders } from '@/hooks/useFolders'
import { useNotes } from '@/hooks/useNotes'
import { useSearch } from '@/hooks/useSearch'
import { useTheme } from '@/hooks/useTheme'
import { logout } from '@/lib/auth'
import { useAppStore } from '@/store/useAppStore'
import { FolderItem } from './FolderItem'
import { NoteItem } from './NoteItem'
import { TemplateSection } from './TemplateSection'
import type { Json } from '@/types'

const DEFAULT_SIDEBAR_WIDTH = 320
const MIN_SIDEBAR_WIDTH = 272
const MAX_SIDEBAR_WIDTH = 520
const SIDEBAR_WIDTH_STORAGE_KEY = 'sidebar-width'
const SIDEBAR_WIDTH_EVENT = 'sidebar-width-change'

function clampSidebarWidth(width: number, viewportWidth: number): number {
  const maxAllowedWidth = Math.min(
    MAX_SIDEBAR_WIDTH,
    Math.max(MIN_SIDEBAR_WIDTH, Math.floor(viewportWidth * 0.48)),
  )

  return Math.min(maxAllowedWidth, Math.max(MIN_SIDEBAR_WIDTH, Math.round(width)))
}

function getStoredSidebarWidth(): number {
  if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH

  const savedWidth = Number(window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY))
  const nextWidth = Number.isFinite(savedWidth) ? savedWidth : DEFAULT_SIDEBAR_WIDTH

  return clampSidebarWidth(nextWidth, window.innerWidth)
}

function subscribeSidebarWidth(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}

  const handleResize = () => onStoreChange()
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_WIDTH_STORAGE_KEY) onStoreChange()
  }
  const handleSidebarWidthChange = () => onStoreChange()

  window.addEventListener('resize', handleResize)
  window.addEventListener('storage', handleStorage)
  window.addEventListener(SIDEBAR_WIDTH_EVENT, handleSidebarWidthChange)

  return () => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(SIDEBAR_WIDTH_EVENT, handleSidebarWidthChange)
  }
}

function saveSidebarWidth(width: number): number {
  if (typeof window === 'undefined') return DEFAULT_SIDEBAR_WIDTH

  const nextWidth = clampSidebarWidth(width, window.innerWidth)
  window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(nextWidth))
  window.dispatchEvent(new Event(SIDEBAR_WIDTH_EVENT))

  return nextWidth
}

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggle: toggleTheme } = useTheme()

  const user = useAppStore((state) => state.user)
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const activeFolder = useAppStore((state) => state.activeFolder)
  const setActiveFolder = useAppStore((state) => state.setActiveFolder)

  const { folders, handleCreate: createFolder, handleRename, handleDelete: deleteFolder } = useFolders()
  const { allNotes, handleCreate: createNote, handleDelete: deleteNote } = useNotes(null)
  const { filtered, query } = useSearch(allNotes)

  const [creating, setCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const storedSidebarWidth = useSyncExternalStore(
    subscribeSidebarWidth,
    getStoredSidebarWidth,
    () => DEFAULT_SIDEBAR_WIDTH,
  )
  const [dragSidebarWidth, setDragSidebarWidth] = useState<number | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const dragSidebarWidthRef = useRef<number | null>(null)

  const handleCreateFolder = useCallback(async () => {
    const name = newFolderName.trim()
    if (!name) return

    await createFolder(name)
    setNewFolderName('')
    setCreating(false)
  }, [createFolder, newFolderName])

  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname, setSidebarOpen])

  const updateDragSidebarWidth = useCallback((width: number | null) => {
    dragSidebarWidthRef.current = width
    setDragSidebarWidth(width)
  }, [])

  useEffect(() => {
    if (!isResizing || typeof window === 'undefined') return

    const handlePointerMove = (event: MouseEvent) => {
      updateDragSidebarWidth(clampSidebarWidth(event.clientX, window.innerWidth))
    }

    const handlePointerUp = () => {
      if (dragSidebarWidthRef.current !== null) {
        saveSidebarWidth(dragSidebarWidthRef.current)
      }
      updateDragSidebarWidth(null)
      setIsResizing(false)
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)

    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
    }
  }, [isResizing, updateDragSidebarWidth])

  const doCreateNote = useCallback(async (content?: Json) => {
    const note = await createNote(activeFolder, content)
    router.push(`/notes/${note.id}`)
    setShowNoteModal(false)
  }, [createNote, activeFolder, router])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  const handleGoHome = () => {
    setActiveFolder(null)
    router.push('/app')
  }

  const rootFolders = folders.filter((folder) => !folder.parent_id)

  const handleCreateSubfolder = useCallback(async (name: string, parentId: string) => {
    return await createFolder(name, parentId)
  }, [createFolder])

  const isDarkTheme = theme === 'dark'
  const themeToggleTitle = isDarkTheme ? 'Modo claro' : 'Modo oscuro'
  const desktopSidebarWidth = dragSidebarWidth ?? storedSidebarWidth

  return (
    <>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[272px] flex-shrink-0 flex-col transition-transform duration-300 md:relative md:h-screen md:w-[var(--sidebar-width)] md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${isResizing ? 'md:transition-none' : ''}`}
        style={{
          background: 'var(--ds-surface-low)',
          borderRight: '1px solid rgba(145,180,228,0.12)',
          ['--sidebar-width' as string]: `${desktopSidebarWidth}px`,
        }}
      >
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar panel lateral"
          onMouseDown={() => setIsResizing(true)}
          onDoubleClick={() => {
            updateDragSidebarWidth(null)
            saveSidebarWidth(DEFAULT_SIDEBAR_WIDTH)
          }}
          className="absolute inset-y-0 -right-1.5 z-20 hidden w-3 cursor-col-resize md:block"
        >
          <div
            className="mx-auto h-full w-px transition"
            style={{
              background: isResizing ? 'rgba(81,72,216,0.45)' : 'rgba(145,180,228,0.22)',
            }}
          />
        </div>

        <div className="flex items-center gap-2 px-4 pb-3 pt-5">
          <Link
            href="/app"
            onClick={() => setActiveFolder(null)}
            className="flex-1 truncate text-[14px] font-bold tracking-tight transition hover:opacity-75"
            style={{ color: 'var(--ds-on-surface)' }}
          >
            Apuntes Faciles
          </Link>
          <SaveStatus />
          <button
            onClick={toggleTheme}
            title={themeToggleTitle}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:opacity-75"
            style={{ color: 'var(--ds-on-variant)' }}
          >
            {isDarkTheme ? <SunIcon size={14} /> : <LunaIcon size={14} />}
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="relative">
            <SearchIcon
              size={12}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--ds-outline)' }}
            />
            <input
              type="search"
              placeholder="Buscar notas..."
              value={query}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-curator w-full py-2 pl-8 pr-3 text-xs"
              style={{ color: 'var(--ds-on-surface)' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {query.trim() ? (
            <div className="flex flex-col gap-0.5">
              <p
                className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
                style={{ color: 'var(--ds-on-variant)' }}
              >
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </p>
              {filtered.length === 0
                ? (
                    <p className="px-2 text-xs italic" style={{ color: 'var(--ds-outline)' }}>
                      Sin resultados
                    </p>
                  )
                : filtered.map((note) => (
                    <NoteItem key={note.id} note={note} onDelete={deleteNote} />
                  ))}
            </div>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoHome}
                className="mb-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition"
                style={{
                  background: !activeFolder ? 'rgba(129,140,248,0.1)' : 'transparent',
                  color: !activeFolder ? 'var(--ds-primary)' : 'var(--ds-on-surface)',
                  borderLeft: !activeFolder ? '2px solid var(--ds-primary)' : '2px solid transparent',
                  fontWeight: !activeFolder ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (activeFolder) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(5,52,92,0.05)'
                }}
                onMouseLeave={(e) => {
                  if (activeFolder) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <HouseIcon size={13} style={{ flexShrink: 0 }} />
                <span className="text-sm">Mis Documentos</span>
              </motion.button>

              <div className="mx-1 my-2" style={{ borderTop: '1px solid rgba(145,180,228,0.13)' }} />

              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <FolderOpenIcon size={11} strokeWidth={2.5} style={{ color: 'var(--ds-on-variant)' }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: 'var(--ds-on-variant)' }}
                  >
                    Carpetas
                  </span>
                </div>
                <button
                  onClick={() => {
                    setCreating(true)
                    setTimeout(() => document.getElementById('new-folder-input')?.focus(), 50)
                  }}
                  className="flex h-5 w-5 items-center justify-center rounded-md transition hover:opacity-75"
                  style={{ color: 'var(--ds-primary)', background: 'var(--ds-secondary-cnt)' }}
                  title="Nueva carpeta"
                >
                  <FolderPlusIcon size={11} />
                </button>
              </div>

              {creating && (
                <div className="flex gap-1.5 px-1 pb-1">
                  <input
                    id="new-folder-input"
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder()
                      if (e.key === 'Escape') {
                        setCreating(false)
                        setNewFolderName('')
                      }
                    }}
                    placeholder="Nombre de carpeta"
                    className="input-curator flex-1 px-3 py-1.5 text-sm"
                    style={{ color: 'var(--ds-on-surface)' }}
                  />
                  <button onClick={handleCreateFolder} className="btn-primary px-3 py-1.5 text-xs">
                    OK
                  </button>
                </div>
              )}

              {rootFolders.length === 0 && !creating ? (
                <button
                  onClick={() => setCreating(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition"
                  style={{ color: 'var(--ds-outline)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--ds-primary)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--ds-outline)'
                  }}
                >
                  <ChevronRightIcon size={11} />
                  <span className="text-xs italic">Crear primera carpeta...</span>
                </button>
              ) : (
                <div className="flex flex-col gap-px">
                  {rootFolders.map((folder) => (
                    <FolderItem
                      key={folder.id}
                      folder={folder}
                      allFolders={folders}
                      notes={allNotes}
                      onRename={handleRename}
                      onDelete={deleteFolder}
                      onCreateNote={createNote}
                      onDeleteNote={deleteNote}
                      onCreateSubfolder={handleCreateSubfolder}
                    />
                  ))}
                </div>
              )}

              <div className="mx-1 my-2 mt-3" style={{ borderTop: '1px solid rgba(145,180,228,0.13)' }} />

              <div className="mb-0.5 flex items-center justify-between px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <LayoutTemplateIcon size={11} strokeWidth={2.5} style={{ color: 'var(--ds-on-variant)' }} />
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: 'var(--ds-on-variant)' }}
                  >
                    Plantillas
                  </span>
                </div>
              </div>
              <TemplateSection hideHeader />
            </>
          )}
        </div>

        <div
          className="space-y-2 px-3 pb-4 pt-3"
          style={{ borderTop: '1px solid rgba(145,180,228,0.15)' }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowNoteModal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:opacity-80"
            style={{ background: 'var(--ds-primary)' }}
          >
            <PlusIcon size={15} strokeWidth={2.5} />
            Nueva nota
          </motion.button>

          {showNoteModal && (
            <NewNoteModal
              onSelectBlank={() => doCreateNote()}
              onSelectTemplate={(content) => doCreateNote(content)}
              onClose={() => setShowNoteModal(false)}
            />
          )}

          {user ? (
            <div
              className="flex items-center justify-between gap-2.5 rounded-xl px-2 py-2"
              style={{
                background: 'rgba(81,72,216,0.06)',
                border: '1px solid rgba(145,180,228,0.12)',
              }}
            >
              <Link
                href="/app/profile"
                onClick={() => {
                  setSidebarOpen(false)
                  setActiveFolder(null)
                }}
                className="flex min-w-0 flex-1 items-center gap-2.5 transition hover:opacity-75"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, var(--ds-primary), var(--ds-primary-alt))' }}
                >
                  {user.email?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium" style={{ color: 'var(--ds-on-surface)' }}>
                    {user.email}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--ds-outline)' }}>
                    Ver perfil
                  </p>
                </div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                title="Cerrar sesion"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition"
                style={{ color: '#ef4444', background: 'rgba(239,68,68,0.12)' }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </motion.button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
              style={{ color: 'var(--ds-primary)', background: 'var(--ds-secondary-cnt)' }}
            >
              Iniciar sesion
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
