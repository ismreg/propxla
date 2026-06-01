import { getAllAreas } from '@/lib/data'
import PropXLAApp from '@/components/PropXLAApp'

export default async function Home() {
  const areas = await getAllAreas()
  return <PropXLAApp areas={areas} />
}
