import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin, isAdminAuthorized } from '@/lib/supabase-admin'
import type { ParsedAreaUpdate } from '@/lib/admin-types'

const ALLOWED_FIELDS: (keyof ParsedAreaUpdate)[] = [
  'reg_avg_psf',
  'broker_ask_psf',
  'transactions',
  'price_trend',
  'overall_score',
  'growth_label',
]

export async function POST(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (!isAdminAuthorized(adminKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as { slug?: string; updates?: ParsedAreaUpdate }
    const { slug, updates } = body

    if (!slug || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'slug and updates are required' }, { status: 400 })
    }

    const patch: Record<string, unknown> = {}
    for (const field of ALLOWED_FIELDS) {
      if (updates[field] !== undefined) {
        patch[field] = updates[field]
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: existing, error: fetchError } = await supabase
      .from('areas')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json({ error: 'Area not found' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('areas')
      .update(patch)
      .eq('slug', slug)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save area'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
