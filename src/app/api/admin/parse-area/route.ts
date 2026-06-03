import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isAdminAuthorized } from '@/lib/supabase-admin'
import type { AdminAreaSummary, ParsedAreaUpdate } from '@/lib/admin-types'

function parseJsonFromText(text: string): ParsedAreaUpdate {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonText = fenced ? fenced[1].trim() : trimmed
  return JSON.parse(jsonText) as ParsedAreaUpdate
}

export async function POST(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (!isAdminAuthorized(adminKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
  }

  try {
    const body = (await request.json()) as {
      slug?: string
      rawInput?: string
      currentArea?: AdminAreaSummary
    }

    const { slug, rawInput, currentArea } = body

    if (!slug || !rawInput?.trim() || !currentArea) {
      return NextResponse.json(
        { error: 'slug, rawInput, and currentArea are required' },
        { status: 400 }
      )
    }

    const prompt = `You are a data parser for a property intelligence platform.
Parse the following raw property data for the area: ${currentArea.name}

Current area data for context:
- Current reg_avg_psf: ${currentArea.reg_avg_psf}
- Current broker_ask_psf: ${currentArea.broker_ask_psf}

Raw input to parse:
${rawInput}

Extract and return ONLY a valid JSON object with these fields 
(include only fields you can confidently extract, 
omit fields you cannot determine):

{
  "reg_avg_psf": number (registered average price per sqft),
  "broker_ask_psf": number (broker asking price per sqft),
  "transactions": [
    {
      "unit": "2BHK · 1,100 sqft",
      "date": "Mar 2024", 
      "total": "67L",
      "psf": "6,091"
    }
  ],
  "price_trend": [
    {"year": "2020", "psf": 3800},
    {"year": "2021", "psf": 4400},
    {"year": "2022", "psf": 5100},
    {"year": "2023", "psf": 5700},
    {"year": "2024", "psf": 6100}
  ],
  "overall_score": number (0-100, based on price truth and risk),
  "growth_label": "string describing growth"
}

Rules:
- Return ONLY the JSON object, no explanation, no markdown
- If price_trend has fewer than 5 points, interpolate reasonably
- overall_score: 
  if reg_avg exists and broker premium < 15%: base 75
  if premium 15-25%: base 65
  if premium > 25%: base 55
  adjust up for low flood risk, down for high flood risk
- All psf values as integers
- transaction total in Indian format: "67L" or "1.2Cr"
- Dates as "Mon YYYY" format`

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No text response from Claude' }, { status: 500 })
    }

    const parsed = parseJsonFromText(textBlock.text)
    return NextResponse.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse area data'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
