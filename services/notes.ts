import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Json, Note } from '@/types'

const db = () => getSupabaseBrowserClient()

export async function fetchNotes(folderId: string | null): Promise<Note[]> {
  let query = db()
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false })

  if (folderId) {
    query = query.eq('folder_id', folderId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Note[]
}

export async function fetchNote(id: string): Promise<Note> {
  const { data, error } = await db()
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Note
}

export async function createNote(folderId: string | null, initialContent?: Json): Promise<Note> {
  const { data: { user } } = await db().auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const payload: Partial<Note> = {
    user_id: user.id,
    title: 'Sin título',
    content: initialContent ?? ({
      type: 'doc',
      content: [{ type: 'paragraph' }],
    } as Json),
    ...(folderId ? { folder_id: folderId } : {}),
  }

  const { data, error } = await db()
    .from('notes')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data as Note
}

export async function updateNote(
  id: string,
  partial: { title?: string; content?: Json },
): Promise<void> {
  const { error } = await db().from('notes').update(partial).eq('id', id)
  if (error) throw error
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await db().from('notes').delete().eq('id', id)
  if (error) throw error
}

export async function searchNotes(query: string): Promise<Note[]> {
  const { data, error } = await db()
    .from('notes')
    .select('*')
    .ilike('title', `%${query}%`)
    .order('updated_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data as Note[]
}
