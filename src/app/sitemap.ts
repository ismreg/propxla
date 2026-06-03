import type { MetadataRoute } from 'next'
import { getAllAreas } from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const areas = await getAllAreas()
  const baseUrl = 'https://propxla.com'

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const areaPages: MetadataRoute.Sitemap = areas.map((area) => ({
    url: `${baseUrl}/area/${area.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }))

  const reportPages: MetadataRoute.Sitemap = areas.map((area) => ({
    url: `${baseUrl}/report/${area.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const comparePages: MetadataRoute.Sitemap = [
    'sholinganallur-vs-kelambakkam',
    'sholinganallur-vs-perumbakkam',
    'sholinganallur-vs-siruseri',
    'sholinganallur-vs-thoraipakkam',
    'perumbakkam-vs-kelambakkam',
    'perumbakkam-vs-siruseri',
    'thiruvanmiyur-vs-neelankarai',
    'thiruvanmiyur-vs-palavakkam',
    'kovalam-vs-muttukadu',
    'kovalam-vs-kuvathur',
    'navalur-vs-padur',
    'navalur-vs-siruseri',
    'karapakkam-vs-thoraipakkam',
    'palavakkam-vs-injambakkam',
    'medavakkam-vs-perumbakkam',
    'guduvanchery-vs-vandalur',
    'neelankarai-vs-injambakkam',
    'sholinganallur-vs-navalur',
    'siruseri-vs-kelambakkam',
    'thiruvanmiyur-vs-sholinganallur',
  ].map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...areaPages,
    ...reportPages,
    ...comparePages,
  ]
}
