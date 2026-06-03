import { getAllAreas } from '@/lib/data'
import PropXLAApp from '@/components/PropXLAApp'

interface HomePageProps {
  searchParams: Promise<{ area?: string }>
}

export default async function Home({ searchParams }: HomePageProps) {
  const { area: areaSlug } = await searchParams
  const areas = await getAllAreas()
  return <PropXLAApp areas={areas} initialAreaSlug={areaSlug ?? null} />
}
