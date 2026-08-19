import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { questionForCardSlug } from './card-slug'

const publicDir = join(import.meta.dirname, 'public')

const readPublic = (relativePath: string): string =>
  readFileSync(join(publicDir, relativePath), 'utf8')

describe('generated SEO guides', () => {
  it('lists every guide in the sitemap', () => {
    const sitemap = readPublic('sitemap.xml')

    expect(sitemap).toContain('https://www.spill.cards/')
    expect(sitemap).toContain(
      'https://www.spill.cards/guides/christian-conversation-starters/',
    )
    expect(sitemap).toContain(
      'https://www.spill.cards/guides/small-group-questions/',
    )
    expect(sitemap).toContain(
      'https://www.spill.cards/guides/christian-dating-questions/',
    )
    expect(sitemap).toContain(
      'https://www.spill.cards/guides/youth-group-questions/',
    )
    expect(sitemap).toContain(
      'https://www.spill.cards/guides/family-faith-questions/',
    )
  })

  it('uses live card slugs that resolve in the library', () => {
    const html = readPublic('guides/christian-conversation-starters/index.html')
    const slugs = [...html.matchAll(/href="\/c\/([a-z0-9]+)"/g)].map(
      (match) => match[1],
    )

    expect(slugs.length).toBeGreaterThan(10)
    for (const slug of slugs) {
      expect(questionForCardSlug(slug), slug).toBeDefined()
    }
  })

  it('keeps robots.txt pointed at the sitemap', () => {
    expect(readPublic('robots.txt')).toContain(
      'Sitemap: https://www.spill.cards/sitemap.xml',
    )
  })
})
