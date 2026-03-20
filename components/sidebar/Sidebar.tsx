'use client'

import { useCallback, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HouseIcon } from '@/components/icons/HouseIcon'
import { SunIcon } from '@/components/icons/SunIcon'
import { LunaIcon } from '@/components/icons/LunaIcon'
import { FolderPlusIcon } from '@/components/icons/FolderPlusIcon'
import {
  SearchIcon, PlusIcon, ChevronRightIcon, FolderOpenIcon, LayoutTemplateIcon,
} from '@/components/icons/NavIcons'
import { logout } from '@/lib/auth'
import { useFolders } from '@/hooks/useFolders'
import { useNotes } from '@/hooks/useNotes'
import { useSearch } from '@/hooks/useSearch'
import { useAppStore } from '@/store/useAppStore'
import { useTheme } from '@/hooks/useTheme'
import { FolderItem } from './FolderItem'
import { NoteItem } from './NoteItem'
import { TemplateSection } from './TemplateSection'
import { NewNoteModal } from '@/components/ui/NewNoteModal'
import { SaveStatus } from '@/components/ui/SaveStatus'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggle: toggleTheme } = useTheme()
  const user = useAppStore((s) => s.user)
  const isSidebarOpen = useAppStore((s) => s.isSidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const setSearchQuery = useAppStore((s) => s.setSearchQuery)
  const activeFolder = useAppStore((s) => s.activeFolder)
  const setActiveFolder = useAppStore((s) => s.setActiveFolder)

  const { folders, handleCreate: createFolder, handleRename, handleDelete: deleteFolder } = useFolders()
  const { allNotes, handleCreate: createNote, handleDelete: deleteNote } = useNotes(null)
  const { filtered, query } = useSearch(allNotes)

  const [creating,       setCreating]       = useState(false)
  const [newFolderName,  setNewFolderName]  = useState('')
  const [showNoteModal,  setShowNoteModal]  = useState(false)

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

  const doCreateNote = useCallback(async (content?: import('@/types').Json) => {
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

  const rootFolders = folders.filter((f) => !f.parent_id)

  const handleCreateSubfolder = useCallback(async (name: string, parentId: string) => {
    return await createFolder(name, parentId)
  }, [createFolder])

  return (
    <>
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-[100dvh] w-[272px] flex-shrink-0 flex-col transition-transform duration-300 md:relative md:h-screen md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'var(--ds-surface-low)', borderRight: '1px solid rgba(145,180,228,0.12)' }}
      >
        {/* ── Branding ── */}
      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
        <Link
          href="/app"
          onClick={() => setActiveFolder(null)}
          className="flex-1 text-[14px] font-bold tracking-tight transition hover:opacity-75"
          style={{ color: 'var(--ds-on-surface)' }}
        >
          Apuntes Faciles
        </Link>
        <SaveStatus />
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition hover:opacity-75"
          style={{ color: 'var(--ds-on-variant)' }}
        >
          {theme === 'dark'
            ? <SunIcon size={14} />
            : <LunaIcon size={14} />}
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-3 pb-2">
        <div className="relative">
          <SearchIcon size={12} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--ds-outline)' }} />
          <input
            type="search"
            placeholder="Buscar notas…"
            value={query}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-curator w-full py-2 pl-8 pr-3 text-xs"
            style={{ color: 'var(--ds-on-surface)' }}
          />
        </div>
      </div>

      {/* ── Scrollable area ── */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">

        {/* Search results */}
        {query.trim() ? (
          <div className="flex flex-col gap-0.5">
            <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
               style={{ color: 'var(--ds-on-variant)' }}>
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
            </p>
            {filtered.length === 0
              ? <p className="px-2 text-xs italic" style={{ color: 'var(--ds-outline)' }}>Sin resultados</p>
              : filtered.map((note) => <NoteItem key={note.id} note={note} onDelete={deleteNote} />)
            }
          </div>
        ) : (
          <>
            {/* ── Home nav item ── */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoHome}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition mb-0.5"
              style={{
                background:  !activeFolder ? 'rgba(129,140,248,0.1)' : 'transparent',
                color:       !activeFolder ? 'var(--ds-primary)' : 'var(--ds-on-surface)',
                borderLeft:  !activeFolder ? '2px solid var(--ds-primary)' : '2px solid transparent',
                fontWeight:  !activeFolder ? 600 : 400,
              }}
              onMouseEnter={e => { if (activeFolder) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(5,52,92,0.05)' }}
              onMouseLeave={e => { if (activeFolder) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
            >
              <HouseIcon size={13} style={{ flexShrink: 0 }} />
              <span className="text-sm">Mis Documentos</span>
            </motion.button>

            {/* ── Divider ── */}
            <div className="mx-1 my-2" style={{ borderTop: '1px solid rgba(145,180,228,0.13)' }} />

            {/* ── Carpetas header ── */}
            <div className="flex items-center justify-between px-2 py-1.5">
              <div className="flex items-center gap-1.5">
                <FolderOpenIcon size={11} strokeWidth={2.5} style={{ color: 'var(--ds-on-variant)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: 'var(--ds-on-variant)' }}>
                  Carpetas
                </span>
              </div>
              <button
                onClick={() => { setCreating(true); setTimeout(() => document.getElementById('new-folder-input')?.focus(), 50) }}
                className="flex h-5 w-5 items-center justify-center rounded-md transition hover:opacity-75"
                style={{ color: 'var(--ds-primary)', background: 'var(--ds-secondary-cnt)' }}
                title="Nueva carpeta"
              >
                <FolderPlusIcon size={11} />
              </button>
            </div>

            {/* New folder input */}
            {creating && (
              <div className="flex gap-1.5 px-1 pb-1">
                <input
                  id="new-folder-input"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder()
                    if (e.key === 'Escape') { setCreating(false); setNewFolderName('') }
                  }}
                  placeholder="Nombre de carpeta"
                  className="input-curator flex-1 px-3 py-1.5 text-sm"
                  style={{ color: 'var(--ds-on-surface)' }}
                />
                <button onClick={handleCreateFolder} className="btn-primary px-3 py-1.5 text-xs">✓</button>
              </div>
            )}

            {/* Folder list */}
            {rootFolders.length === 0 && !creating ? (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition"
                style={{ color: 'var(--ds-outline)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--ds-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = 'var(--ds-outline)'}
              >
                <ChevronRightIcon size={11} />
                <span className="text-xs italic">Crear primera carpeta…</span>
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

            {/* ── Divider ── */}
            <div className="mx-1 my-2 mt-3" style={{ borderTop: '1px solid rgba(145,180,228,0.13)' }} />

            {/* ── Templates header ── */}
            <div className="flex items-center justify-between px-2 py-1.5 mb-0.5">
              <div className="flex items-center gap-1.5">
                <LayoutTemplateIcon size={11} strokeWidth={2.5} style={{ color: 'var(--ds-on-variant)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: 'var(--ds-on-variant)' }}>
                  Plantillas
                </span>
              </div>
            </div>
            <TemplateSection hideHeader />
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-3 pt-3 pb-4 space-y-2"
           style={{ borderTop: '1px solid rgba(145,180,228,0.15)' }}>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowNoteModal(true)}
          className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl text-white transition hover:opacity-90 active:opacity-80"
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
          <div className="flex items-center justify-between gap-2.5 rounded-xl px-2 py-2"
               style={{ background: 'rgba(81,72,216,0.06)', border: '1px solid rgba(145,180,228,0.12)' }}>
            <Link 
              href="/app/profile" 
              onClick={() => { setSidebarOpen(false); setActiveFolder(null) }}
              className="flex min-w-0 flex-1 items-center gap-2.5 transition hover:opacity-75"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                   style={{ background: 'linear-gradient(135deg, var(--ds-primary), var(--ds-primary-alt))' }}>
                {user.email?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium" style={{ color: 'var(--ds-on-surface)' }}>
                  {user.email}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--ds-outline)' }}>Ver perfil</p>
              </div>
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              title="Cerrar sesión"
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition"
              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.12)' }}
            >
              {/* x icon or exit icon: using an svg for logout since there is none on NavIcons. */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </motion.button>
          </div>
        ) : (
          <Link href="/login"
                className="flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
                style={{ color: 'var(--ds-primary)', background: 'var(--ds-secondary-cnt)' }}>
            Iniciar sesión
          </Link>
        )}
      </div>
    </aside>
    </>
  )
}
