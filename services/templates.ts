import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Template, Json } from '@/types'

const db = () => getSupabaseBrowserClient()

export async function fetchTemplates(): Promise<Template[]> {
  const { data, error } = await db()
    .from('templates')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Template[]
}

export async function createTemplate(name: string, content: Json = {}): Promise<Template> {
  const { data: { user } } = await db().auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data, error } = await db()
    .from('templates')
    .insert({ name, content, user_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data as Template
}

export async function updateTemplate(id: string, partial: Partial<Pick<Template, 'name' | 'content'>>): Promise<void> {
  const { error } = await db().from('templates').update(partial).eq('id', id)
  if (error) throw error
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await db().from('templates').delete().eq('id', id)
  if (error) throw error
}
