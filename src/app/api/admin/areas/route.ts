import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isAdminAuthorized } from '@/lib/supabase-admin'

export async function GET(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (!isAdminAuthorized(adminKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('areas')
      .select('id, slug, name, corridor, reg_avg_psf, broker_ask_psf, overall_score')
      .order('corridor', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load areas'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
