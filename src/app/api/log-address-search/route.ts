import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

interface LogAddressSearchBody {
  address?: string
  lat?: number
  lng?: number
  matched_area_slug?: string | null
  is_in_service_area?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LogAddressSearchBody
    const { address, lat, lng, matched_area_slug, is_in_service_area } = body

    if (!address || lat === undefined || lng === undefined) {
      console.error('log-address-search: missing required fields', body)
      return NextResponse.json(
        { ok: false, error: 'address, lat, and lng are required' },
        { status: 200 }
      )
    }

    const supabase = getSupabaseAdmin()
    const { error } = await supabase.from('address_searches').insert({
      address,
      lat,
      lng,
      matched_area_slug: matched_area_slug ?? null,
      is_in_service_area: is_in_service_area ?? false,
    })

    if (error) {
      console.error('log-address-search insert error:', error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 200 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('log-address-search handler error:', err)
    return NextResponse.json({ ok: false, error: message }, { status: 200 })
  }
}

export async function GET() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}
