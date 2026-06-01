import { supabase } from './supabase'
import type { Area, Corridor, SearchLog } from './types'

// ============================================
// GET ALL AREAS — for discovery panel
// ============================================

export async function getAllAreas(): Promise<Area[]> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('overall_score', { ascending: false })

  if (error) {
    console.error('getAllAreas error:', error)
    return []
  }
  return data as Area[]
}

// ============================================
// GET AREAS BY CORRIDOR
// ============================================

export async function getAreasByCorridor(corridor: Corridor): Promise<Area[]> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .eq('corridor', corridor)
    .order('overall_score', { ascending: false })

  if (error) {
    console.error('getAreasByCorridor error:', error)
    return []
  }
  return data as Area[]
}

// ============================================
// GET SINGLE AREA BY SLUG
// ============================================

export async function getAreaBySlug(slug: string): Promise<Area | null> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('getAreaBySlug error:', error)
    return null
  }
  return data as Area
}

// ============================================
// LOG SEARCH — intent graph
// ============================================

export async function logSearch(entry: SearchLog): Promise<void> {
  const { error } = await supabase
    .from('searches')
    .insert(entry)

  if (error) {
    console.error('logSearch error:', error)
  }
}