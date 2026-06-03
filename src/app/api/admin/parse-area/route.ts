import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { isAdminAuthorized } from '@/lib/supabase-admin'
import type { AdminAreaSummary, ParsedAreaUpdate } from '@/lib/admin-types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

function parseJsonFromText(text: string): ParsedAreaUpdate {
  const trimmed = text.trim()
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonText = fenced ? fenced[1].trim() : trimmed
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON object found in response')
  }
  return JSON.parse(jsonMatch[0]) as ParsedAreaUpdate
}

function getLastTextBlock(content: Anthropic.Messages.ContentBlock[]): string {
  const textBlocks = content.filter((block) => block.type === 'text')
  const lastBlock = textBlocks[textBlocks.length - 1]
  return lastBlock && lastBlock.type === 'text' ? lastBlock.text : ''
}

function buildManualPrompt(currentArea: AdminAreaSummary, rawInput: string): string {
  return `You are a data parser for a property intelligence platform.
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
}

async function runManualParse(
  currentArea: AdminAreaSummary,
  rawInput: string
): Promise<ParsedAreaUpdate> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: buildManualPrompt(currentArea, rawInput) }],
  })

  const textBlock = message.content.find((block) => block.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  return parseJsonFromText(textBlock.text)
}

async function runAutoSearch(areaName: string): Promise<ParsedAreaUpdate & { auto_searched: boolean }> {
  const searchQuery = `${areaName} Chennai property registered price per sqft 2024 2025`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    tools: [
      {
        type: 'web_search_20250305',
        name: 'web_search',
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Search for current property prices in ${areaName}, Chennai.

Search for: "${searchQuery}"

Also search for: "${areaName} Chennai property price trend 2020 2024"

After searching, extract and return ONLY a valid JSON object:
{
  "reg_avg_psf": number,
  "broker_ask_psf": number,
  "price_trend": [
    {"year":"2020","psf":number},
    {"year":"2021","psf":number},
    {"year":"2022","psf":number},
    {"year":"2023","psf":number},
    {"year":"2024","psf":number}
  ],
  "overall_score": number,
  "growth_label": string,
  "sources": [string] (list of websites you found data from)
}

Rules:
- reg_avg_psf: registered/actual transaction average per sqft
- broker_ask_psf: listed/asking price per sqft 
  (if not found: reg_avg_psf * 1.20)
- price_trend: if only current price found, 
  extrapolate back using 12% annual decline per year
- overall_score 0-100:
  base 70, 
  +10 if broker premium under 15%,
  -10 if broker premium over 30%,
  +5 if strong appreciation,
  adjust based on known flood risk for ${areaName}
- growth_label: describe the appreciation trend in one sentence
- Return ONLY the JSON. No markdown, no explanation.`,
      },
    ],
  })

  const lastText = getLastTextBlock(response.content)
  if (!lastText) {
    throw new Error('No text response from Claude after web search')
  }

  try {
    const parsed = parseJsonFromText(lastText)
    return { ...parsed, auto_searched: true }
  } catch (parseErr) {
    console.error('Auto-search JSON parse failed:', parseErr)
    throw new Error(`JSON parse failed. Raw response:\n${lastText}`)
  }
}

export async function POST(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')
  if (!isAdminAuthorized(adminKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured' }, { status: 500 })
  }

  try {
    const body = (await request.json()) as {
      slug?: string
      areaName?: string
      rawInput?: string
      currentArea?: AdminAreaSummary
    }

    const { slug, areaName, rawInput, currentArea } = body

    if (!slug || !currentArea) {
      return NextResponse.json(
        { error: 'slug and currentArea are required' },
        { status: 400 }
      )
    }

    const resolvedAreaName = areaName || currentArea.name
    const hasManualInput = Boolean(rawInput?.trim())

    if (hasManualInput) {
      const parsed = await runManualParse(currentArea, rawInput!.trim())
      return NextResponse.json(parsed)
    }

    try {
      const parsed = await runAutoSearch(resolvedAreaName)
      return NextResponse.json(parsed)
    } catch (autoErr) {
      const message = autoErr instanceof Error ? autoErr.message : 'Auto-search failed'
      if (message.includes('Raw response:')) {
        const rawText = message.split('Raw response:\n')[1] ?? message
        return NextResponse.json(
          { error: 'Failed to parse JSON from Claude response', rawText, auto_searched: true },
          { status: 422 }
        )
      }
      throw autoErr
    }
  } catch (err) {
    console.error('parse-area error:', err)
    const message = err instanceof Error ? err.message : 'Failed to parse area data'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
