import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      area_slug,
      intent,
      budget_lakhs,
      corridor,
      address,
      lat,
      lng,
      in_service_area,
    } = body

    const { error } = await supabase.from('searches').insert({
      area_slug: area_slug ?? null,
      intent: intent ?? null,
      budget_lakhs: budget_lakhs ?? null,
      corridor: corridor ?? null,
      address: address ?? null,
      lat: lat ?? null,
      lng: lng ?? null,
      in_service_area: in_service_area ?? null,
    })

    if (error) {
      console.error('log-search insert error:', error)
    }
  } catch (error) {
    console.error('log-search handler error:', error)
  }

  return NextResponse.json({ ok: true })
}

export async function GET() {
  return new NextResponse('Method Not Allowed', { status: 405 })
}
