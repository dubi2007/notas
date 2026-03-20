import { notFound } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { NoteEditorShell } from './NoteEditorShell'

interface Props {
  params: Promise<{ id: string }>
}

export default async function NotePage({ params }: Props) {
  const { id } = await params
  const supabase = await getSupabaseServerClient()

  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !note) notFound()

  return <NoteEditorShell note={note} />
}
