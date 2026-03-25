'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import python     from 'highlight.js/lib/languages/python'
import java       from 'highlight.js/lib/languages/java'
import cpp        from 'highlight.js/lib/languages/cpp'
import css        from 'highlight.js/lib/languages/css'
import xml        from 'highlight.js/lib/languages/xml'
import json       from 'highlight.js/lib/languages/json'
import bash       from 'highlight.js/lib/languages/bash'
import sql        from 'highlight.js/lib/languages/sql'
import rust       from 'highlight.js/lib/languages/rust'
import go         from 'highlight.js/lib/languages/go'
import { ResizableImage } from '../ResizableImageExtension'
import { ShapeExtension }  from '../ShapeExtension'
import { TextHighlight }   from '../TextHighlightExtension'
import { EditorToolbar }   from '../EditorToolbar'
import { BubbleMenuBar }   from '../BubbleMenuBar'
import { useAutoSave }     from '@/hooks/useAutoSave'
import { uploadImage }     from '@/services/storage'
import { exportPdf }       from '@/services/exportPdf'
import { exportWord }      from '@/services/exportWord'
import { useAppStore }     from '@/store/useAppStore'
import type { Json, Note } from '@/types'
import { PAGE_FORMATS, PAGE_HEIGHT_PX, PAGE_GAP_PX, type FormatKey } from './pageFormats'
import { getStoredFormat, loadHF } from './pageStorage'
import { PageCard }    from './PageCard'
import { HFEditPanel } from './HFEditPanel'

// Re-export so consumers (EditorToolbar, exportPdf) keep working with the same path
export { PAGE_FORMATS, type FormatKey }

const lowlight = createLowlight()
lowlight.register({ javascript, typescript, python, java, cpp, css, xml, json, bash, sql, rust, go })

interface Props { note: Note }

export function TipTapEditor({ note }: Props) {
  const user = useAppStore((s) => s.user)
  const { triggerSave } = useAutoSave()

  const titleRef          = useRef<HTMLInputElement>(null)
  const fileInputRef      = useRef<HTMLInputElement>(null)
  const contentWrapRef    = useRef<HTMLDivElement>(null)
  const containerRef      = useRef<HTMLDivElement>(null)
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null)

  const [format,      setFormat]      = useState<FormatKey>(() => getStoredFormat(note.id))
  const [pageCount,   setPageCount]   = useState(1)
  const [headerText,  setHeaderText]  = useState(() => loadHF(note.id).header)
  const [footerText,  setFooterText]  = useState(() => loadHF(note.id).footer)
  const [editingZone, setEditingZone] = useState<'header' | 'footer' | null>(null)

  // ── Editor instance ────────────────────────────────────────────────────────
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
      ResizableImage.configure({ inline: true, allowBase64: false }),
      ShapeExtension, TextHighlight,
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: (note.content as object) ?? { type: 'doc', content: [] },
    editorProps: { attributes: { class: 'outline-none min-h-[8rem] focus:outline-none' } },
    onUpdate: ({ editor }) => {
      triggerSave({ noteId: note.id, title: titleRef.current?.value ?? note.title, content: editor.getJSON() as Json })
    },
  })

  // ── Reload on note change ──────────────────────────────────────────────────
  useEffect(() => {
    if (!editor) return
    const incoming = note.content as object
    if (JSON.stringify(incoming) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(incoming)
    }
  }, [editor, note.content, note.id])

  // ── Page count via ResizeObserver ──────────────────────────────────────────
  useEffect(() => {
    if (format === 'libre') return
    const el = contentWrapRef.current
    if (!el) return
    const pageH = PAGE_HEIGHT_PX[format] ?? 1122
    const obs = new ResizeObserver(() =>
      setPageCount(Math.max(1, Math.ceil(el.offsetHeight / pageH)))
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [format, editor])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleFormatChange = useCallback((fmt: FormatKey) => {
    setFormat(fmt); setPageCount(1)
    localStorage.setItem(`fmt:${note.id}`, fmt)
  }, [note.id])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return
    triggerSave({ noteId: note.id, title: e.target.value, content: editor.getJSON() as Json })
  }, [editor, note.id, triggerSave])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!user || !editor) return
    try {
      const src = await uploadImage(file, user.id)
      const chain = editor.chain().focus()
      if (savedSelectionRef.current) {
        chain.setTextSelection(savedSelectionRef.current)
        savedSelectionRef.current = null
      }
      chain.setImage({ src } as Parameters<typeof editor.commands.setImage>[0]).run()
    } catch (err: unknown) { alert((err as Error).message) }
  }, [user, editor])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
    e.target.value = ''
  }, [handleImageUpload])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT') return
    const imageItem = Array.from(e.clipboardData?.items ?? []).find(i => i.type.startsWith('image/'))
    if (!imageItem) return
    const file = imageItem.getAsFile()
    if (!file) return
    e.preventDefault()
    handleImageUpload(file)
  }, [handleImageUpload])

  const saveHF = useCallback((value: string) => {
    if (!editingZone) return
    if (editingZone === 'header') { setHeaderText(value); localStorage.setItem(`hf-h:${note.id}`, value) }
    else                          { setFooterText(value); localStorage.setItem(`hf-f:${note.id}`, value) }
    setEditingZone(null)
  }, [editingZone, note.id])

  const handleExportPdf  = useCallback(() => {
    if (!editor) return
    exportPdf(titleRef.current?.value ?? note.title, editor.getHTML(), format)
  }, [editor, note.title, format])

  const handleExportWord = useCallback(() => {
    if (!editor) return
    exportWord(titleRef.current?.value ?? note.title, editor.getHTML())
  }, [editor, note.title])

  if (!editor) return null

  // ── Derived layout values ──────────────────────────────────────────────────
  const fmt          = PAGE_FORMATS[format]
  const isPageFormat = format !== 'libre'
  const pageH        = isPageFormat ? (PAGE_HEIGHT_PX[format] ?? 1122) : 0
  const totalHeight  = pageCount * pageH + (pageCount - 1) * PAGE_GAP_PX
  const maskPeriod   = pageH + PAGE_GAP_PX
  const pageMask     = isPageFormat
    ? `repeating-linear-gradient(to bottom, black 0px, black ${pageH}px, transparent ${pageH}px, transparent ${maskPeriod}px)`
    : 'none'

  const titleInput = (
    <input
      ref={titleRef}
      key={note.id}
      defaultValue={note.title}
      onChange={handleTitleChange}
      placeholder="Sin título"
      className="mb-4 w-full border-none bg-transparent text-3xl font-bold outline-none"
      style={{ color: 'var(--ds-on-surface)' }}
    />
  )

  return (
    <div className="flex h-full flex-col" onPaste={handlePaste}>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden" onChange={handleFileChange} />

      <EditorToolbar
        editor={editor}
        onImageUpload={() => {
          if (editor) {
            const { from, to } = editor.state.selection
            savedSelectionRef.current = { from, to }
          }
          fileInputRef.current?.click()
        }}
        format={format}
        onFormatChange={handleFormatChange}
        onExportPdf={handleExportPdf}
        onExportWord={handleExportWord}
      />

      <BubbleMenuBar editor={editor} />

      {/* ── Scrollable content area ── */}
      <div className={`flex-1 overflow-y-auto ${isPageFormat ? 'py-8' : ''}`}
           style={{ background: isPageFormat ? 'var(--ds-surface)' : 'var(--ds-surface-lowest)' }}>
        {isPageFormat ? (
          <div className="flex justify-center">
            <div ref={containerRef} className="relative" style={{ width: fmt.width, minHeight: totalHeight }}>
              {Array.from({ length: pageCount }).map((_, i) => (
                <PageCard
                  key={i}
                  index={i}
                  pageH={pageH}
                  pageCount={pageCount}
                  headerText={headerText}
                  footerText={footerText}
                  onEditHeader={() => setEditingZone('header')}
                  onEditFooter={() => setEditingZone('footer')}
                />
              ))}
              <div
                ref={contentWrapRef}
                className="relative z-10"
                style={{ padding: fmt.padding, minHeight: pageH, WebkitMaskImage: pageMask, maskImage: pageMask }}
              >
                {titleInput}
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        ) : (
          <div className="px-8 py-8">
            {titleInput}
            <EditorContent editor={editor} />
          </div>
        )}
      </div>

      {editingZone && (
        <HFEditPanel
          zone={editingZone}
          defaultValue={editingZone === 'header' ? headerText : footerText}
          onSave={saveHF}
          onClose={() => setEditingZone(null)}
        />
      )}
    </div>
  )
}
