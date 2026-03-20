import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Folder } from '@/types'

const db = () => getSupabaseBrowserClient()

export async function fetchFolders(): Promise<Folder[]> {
  const { data, error } = await db()
    .from('folders')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Folder[]
}

export async function createFolder(name: string, parentId?: string | null): Promise<Folder> {
  const { data: { user } } = await db().auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await db()
    .from('folders')
    .insert({ name, user_id: user.id, parent_id: parentId ?? null })
    .select()
    .single()

  if (error) throw error
  return data as Folder
}

export async function renameFolder(id: string, name: string): Promise<void> {
  const { error } = await db()
    .from('folders')
    .update({ name })
    .eq('id', id)

  if (error) throw error
}

export async function deleteFolder(id: string): Promise<void> {
  const { error } = await db().from('folders').delete().eq('id', id)
  if (error) throw error
}
