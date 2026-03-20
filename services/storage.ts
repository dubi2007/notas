import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const BUCKET = 'note-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export class StorageError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'StorageError'
  }
}

/**
 * Uploads an image file to Supabase Storage and returns its public URL.
 * Files are stored under `{userId}/{timestamp}-{filename}` to avoid collisions.
 */
export async function uploadImage(file: File, userId: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new StorageError(
      `Tipo de archivo no permitido. Usa: ${ALLOWED_TYPES.join(', ')}`,
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new StorageError('El archivo excede el tamaño máximo de 5 MB.')
  }

  const supabase = getSupabaseBrowserClient()
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw new StorageError(error.message)

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return publicUrl
}
