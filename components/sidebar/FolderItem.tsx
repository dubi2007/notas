'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { ChevronRightIcon, ChevronDownIcon, FilePlusIcon, PencilIcon, TrashIcon } from '@/components/icons/NavIcons'
import { FolderPlusIcon } from '@/components/icons/FolderPlusIcon'
import { useAppStore } from '@/store/useAppStore'
import { NewNoteModal } from '@/components/ui/NewNoteModal'
import type { Folder, Note, Json } from '@/types'


interface Props {
  folder: Folder
  allFolders: Folder[]
  notes: Note[]
  depth?: number
  onRename: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCreateNote: (folderId: string, content?: Json) => Promise<Note>
  onDeleteNote: (id: string) => Promise<void>
  onCreateSubfolder: (name: string, parentId: string) => Promise<Folder>
}

export function FolderItem({
  folder,
  allFolders,
  notes: _notes,
  depth = 0,
  onRename,
  onDelete,
  onCreateNote,
  onDeleteNote: _onDeleteNote,
  onCreateSubfolder,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const activeFolder = useAppStore((s) => s.activeFolder)
  const setActiveFolder = useAppStore((s) => s.setActiveFolder)
  const setActiveNote = useAppStore((s) => s.setActiveNote)

  const [isOpen, setIsOpen] = useState(activeFolder === folder.id)
  const [editing, setEditing] = useState(false)
  const [creatingChild, setCreatingChild] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [childName, setChildName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const childInputRef = useRef<HTMLInputElement>(null)

  const isActive = activeFolder === folder.id
  const children = allFolders.filter((f) => f.parent_id === folder.id)

  // Seleccionar la carpeta en el dashboard (siempre)
  const handleSelect = () => {
    setActiveFolder(folder.id)
    if (!pathname.startsWith(`/app/${folder.id}`)) router.push(`/app/${folder.id}`)
  }

  // Solo expandir/colapsar el árbol en el sidebar
  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsOpen(v => !v)
  }

  const startEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const commitRename = useCallback(async () => {
    const val = inputRef.current?.value.trim()
    if (val && val !== folder.name) await onRename(folder.id, val)
    setEditing(false)
  }, [folder.id, folder.name, onRename])

  const doCreateNote = async (content?: Json) => {
    const note = await onCreateNote(folder.id, content)
    setActiveNote(note.id)
    router.push(`/notes/${note.id}`)
    setShowNoteModal(false)
  }

  const handleCreateNote = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowNoteModal(true)
  }

  const handleCreateSubfolder = async () => {
    const name = childName.trim()
    if (!name) return
    await onCreateSubfolder(name, folder.id)
    setChildName('')
    setCreatingChild(false)
    setIsOpen(true)
  }

  const indent = depth * 12

  return (
    <div onKeyDown={(e) => e.key === 'Escape' && setShowNoteModal(false)}>
      {/* Folder row */}
      <div
        onClick={handleSelect}
        className="group flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 transition"
        style={{
          paddingLeft: `${8 + indent}px`,
          color: isActive ? 'var(--ds-primary)' : 'var(--ds-on-surface)',
          background: isActive ? 'rgba(129,140,248,0.1)' : 'transparent',
          borderLeft: isActive ? '2px solid var(--ds-primary)' : '2px solid transparent',
          fontWeight: isActive ? 600 : 400,
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(5,52,92,0.05)' }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <span onClick={handleChevronClick} style={{ color: 'var(--ds-outline)', flexShrink: 0 }}>
            {isOpen
              ? <ChevronDownIcon size={12} strokeWidth={2.5} />
              : <ChevronRightIcon size={12} strokeWidth={2.5} />}
          </span>
          {editing ? (
            <input
              ref={inputRef}
              defaultValue={folder.name}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') setEditing(false)
              }}
              onClick={(e) => e.stopPropagation()}
              className="input-curator min-w-0 flex-1 px-2 py-0.5 text-sm"
              style={{ color: 'var(--ds-on-surface)' }}
              autoFocus
            />
          ) : (
            <span className="truncate text-sm font-medium">{folder.name}</span>
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
          <button
            title="Nueva nota"
            onClick={handleCreateNote}
            className="flex h-5 w-5 items-center justify-center rounded transition hover:opacity-100 opacity-60"
            style={{ color: 'var(--ds-primary)' }}
          ><FilePlusIcon size={11} strokeWidth={2} /></button>
          <button
            title="Nueva subcarpeta"
            onClick={(e) => { e.stopPropagation(); setCreatingChild(true); setIsOpen(true); setTimeout(() => childInputRef.current?.focus(), 50) }}
            className="flex h-5 w-5 items-center justify-center rounded transition hover:opacity-100 opacity-60"
            style={{ color: 'var(--ds-primary)' }}
          ><FolderPlusIcon size={11} /></button>
          <button
            title="Renombrar"
            onClick={startEdit}
            className="flex h-5 w-5 items-center justify-center rounded transition hover:opacity-100 opacity-40"
            style={{ color: 'var(--ds-on-variant)' }}
          ><PencilIcon size={10} strokeWidth={2} /></button>
          <button
            title="Eliminar carpeta"
            onClick={(e) => {
              e.stopPropagation()
              if (confirm(`¿Eliminar "${folder.name}" y todo su contenido?`)) onDelete(folder.id)
            }}
            className="flex h-5 w-5 items-center justify-center rounded transition hover:opacity-100 opacity-40 hover:text-red-400"
          ><TrashIcon size={10} strokeWidth={2} /></button>
        </div>
      </div>

      {/* Children (subfolders + new subfolder input) */}
      {isOpen && (
        <div
          className="mt-0.5"
          style={{ borderLeft: '1.5px solid rgba(145,180,228,0.25)', marginLeft: `${16 + indent}px`, paddingLeft: '4px' }}
        >
          {creatingChild && (
            <div className="flex gap-1 py-1 pr-1">
              <input
                ref={childInputRef}
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSubfolder()
                  if (e.key === 'Escape') { setCreatingChild(false); setChildName('') }
                }}
                placeholder="Nombre subcarpeta"
                className="input-curator flex-1 px-2 py-1 text-xs"
                style={{ color: 'var(--ds-on-surface)' }}
              />
              <button onClick={handleCreateSubfolder} className="btn-primary px-2 py-1 text-xs">✓</button>
            </div>
          )}

          {children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              allFolders={allFolders}
              notes={_notes}
              depth={depth + 1}
              onRename={onRename}
              onDelete={onDelete}
              onCreateNote={onCreateNote}
              onDeleteNote={_onDeleteNote}
              onCreateSubfolder={onCreateSubfolder}
            />
          ))}
        </div>
      )}

      {showNoteModal && (
        <NewNoteModal
          onSelectBlank={() => doCreateNote()}
          onSelectTemplate={(content) => doCreateNote(content)}
          onClose={() => setShowNoteModal(false)}
        />
      )}
    </div>
  )
}
