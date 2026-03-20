'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import { createLowlight, all } from 'lowlight'
import { ResizableImage } from '../ResizableImageExtension'
import { ShapeExtension }  from '../ShapeExtension'
import { TextHighlight }   from '../TextHighlightExtension'
import { EditorToolbar }   from '../EditorToolbar'
import { BubbleMenuBar }   from '../BubbleMenuBar'
import { useTemplateAutoSave } from '@/hooks/useTemplateAutoSave'
import { uploadImage }     from '@/services/storage'
import { useAppStore }     from '@/store/useAppStore'
import type { Json, Template } from '@/types'
import { PAGE_FORMATS, PAGE_HEIGHT_PX, PAGE_GAP_PX, type FormatKey } from '../TipTapEditor/pageFormats'
import { getStoredFormat } from '../TipTapEditor/pageStorage'
import { PageCard }    from '../TipTapEditor/PageCard'
import { HFEditPanel } from '../TipTapEditor/HFEditPanel'

const lowlight = createLowlight(all)

export function TemplateEditor({ template }: { template: Template }) {
  const user = useAppStore((s) => s.user)
  const { triggerSave } = useTemplateAutoSave()

  const titleRef          = useRef<HTMLInputElement>(null)
  const fileInputRef      = useRef<HTMLInputElement>(null)
  const contentWrapRef    = useRef<HTMLDivElement>(null)
  const containerRef      = useRef<HTMLDivElement>(null)
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null)

  // Reuse same localStorage key pattern as notes
  const [format,      setFormat]      = useState<FormatKey>(() => getStoredFormat(`tpl:${template.id}`))
  const [pageCount,   setPageCount]   = useState(1)
  const [headerText,  setHeaderText]  = useState('')
  const [footerText,  setFooterText]  = useState('')
  const [editingZone, setEditingZone] = useState<'header' | 'footer' | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'plaintext' }),
      ResizableImage.configure({ inline: true, allowBase64: false }),
      ShapeExtension, TextHighlight,
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      TextStyle, Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: (template.content as object) ?? { type: 'doc', content: [] },
    editorProps: { attributes: { class: 'outline-none min-h-[8rem] focus:outline-none' } },
    onUpdate: ({ editor }) => {
      triggerSave({ templateId: template.id, name: titleRef.current?.value ?? template.name, content: editor.getJSON() as Json })
    },
  })

  // Page count via ResizeObserver
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

  const handleFormatChange = useCallback((fmt: FormatKey) => {
    setFormat(fmt); setPageCount(1)
    localStorage.setItem(`fmt:tpl:${template.id}`, fmt)
  }, [template.id])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editor) return
    triggerSave({ templateId: template.id, name: e.target.value, content: editor.getJSON() as Json })
  }, [editor, template.id, triggerSave])

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
    if (editingZone === 'header') { setHeaderText(value); localStorage.setItem(`hf-h:tpl:${template.id}`, value) }
    else                          { setFooterText(value); localStorage.setItem(`hf-f:tpl:${template.id}`, value) }
    setEditingZone(null)
  }, [editingZone, template.id])

  if (!editor) return null

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
      key={template.id}
      defaultValue={template.name}
      onChange={handleTitleChange}
      placeholder="Nombre de plantilla"
      className="mb-4 w-full border-none bg-transparent text-3xl font-bold outline-none"
      style={{ color: 'var(--ds-on-surface)' }}
    />
  )

  return (
    <div className="flex h-full flex-col" onPaste={handlePaste}>
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden" onChange={handleFileChange} />

      {/* Template banner */}
      <div className="flex items-center gap-2 px-4 py-1.5 text-xs font-medium"
           style={{ background: 'var(--ds-secondary-cnt)', color: 'var(--ds-primary)', borderBottom: '1px solid rgba(145,180,228,0.2)' }}>
        <span>📋</span>
        <span>Editando plantilla — los cambios se guardan automáticamente</span>
      </div>

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
        onExportPdf={() => {}}
        onExportWord={() => {}}
      />

      <BubbleMenuBar editor={editor} />

      {/* Scrollable content area */}
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
