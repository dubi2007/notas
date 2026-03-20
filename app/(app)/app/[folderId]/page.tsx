import { DashboardClient } from '../../DashboardClient'

interface Props {
  params: Promise<{ folderId: string }>
}

export default async function FolderPage({ params }: Props) {
  const { folderId } = await params
  return <DashboardClient folderId={folderId} />
}
