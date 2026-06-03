import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let adminClient: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase admin environment variables')
  }

  adminClient = createClient(supabaseUrl, serviceRoleKey)
  return adminClient
}

export function isAdminAuthorized(adminKey: string | null): boolean {
  const secret = process.env.ADMIN_SECRET
  return Boolean(secret && adminKey && adminKey === secret)
}
