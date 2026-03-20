export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Folder {
  id: string
  user_id: string
  parent_id: string | null
  name: string
  created_at: string
}

export interface Template {
  id: string
  user_id: string
  name: string
  content: Json
  created_at: string
}

export interface Note {
  id: string
  folder_id: string | null
  user_id: string
  title: string
  content: Json
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string | undefined
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface AppState {
  user: User | null
  folders: Folder[]
  notes: Note[]
  activeFolder: string | null
  activeNote: string | null
  saveStatus: SaveStatus
  searchQuery: string
}
