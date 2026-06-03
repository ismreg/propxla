import { redirect } from 'next/navigation'
import AdminUpdateClient from './AdminUpdateClient'

interface AdminUpdatePageProps {
  searchParams: Promise<{ key?: string }>
}

export default async function AdminUpdatePage({ searchParams }: AdminUpdatePageProps) {
  const { key } = await searchParams
  const adminSecret = process.env.ADMIN_SECRET

  if (!adminSecret || key !== adminSecret) {
    redirect('/')
  }

  return <AdminUpdateClient adminKey={adminSecret} />
}
