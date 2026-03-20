'use client'

import dynamic from 'next/dynamic'
import type { Template } from '@/types'

const TemplateEditor = dynamic(
  () => import('@/components/editor/TemplateEditor').then((m) => m.TemplateEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm" style={{ color: 'var(--ds-outline)' }}>Cargando editor…</span>
      </div>
    ),
  },
)

export function TemplateEditorShell({ template }: { template: Template }) {
  return (
    <div className="h-full overflow-hidden">
      <TemplateEditor template={template} />
    </div>
  )
}
