'use client'

import { useCallback, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  fetchFolders,
  createFolder,
  renameFolder,
  deleteFolder,
} from '@/services/folders'

export function useFolders() {
  const user = useAppStore((s) => s.user)
  const folders = useAppStore((s) => s.folders)
  const setFolders = useAppStore((s) => s.setFolders)
  const addFolder = useAppStore((s) => s.addFolder)
  const updateFolder = useAppStore((s) => s.updateFolder)
  const removeFolder = useAppStore((s) => s.removeFolder)

  // Load folders whenever user changes
  useEffect(() => {
    if (!user) {
      setFolders([])
      return
    }
    fetchFolders().then(setFolders).catch(console.error)
  }, [user, setFolders])

  const handleCreate = useCallback(
    async (name: string, parentId?: string | null) => {
      const folder = await createFolder(name, parentId)
      addFolder(folder)
      return folder
    },
    [addFolder],
  )

  const handleRename = useCallback(
    async (id: string, name: string) => {
      await renameFolder(id, name)
      updateFolder(id, name)
    },
    [updateFolder],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteFolder(id)
      removeFolder(id)
    },
    [removeFolder],
  )

  return { folders, handleCreate, handleRename, handleDelete }
}
