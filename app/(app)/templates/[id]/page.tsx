import { notFound } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { TemplateEditorShell } from './TemplateEditorShell'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TemplatePage({ params }: Props) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: template, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !template) notFound()

  return <TemplateEditorShell template={template} />
}
