import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const origin = 'https://www.spill.cards'
const today = '2026-08-18'
const questions = JSON.parse(
  readFileSync(join(root, 'app/questions.json'), 'utf8'),
)

const fnv1a32 = (input) => {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const toBase36Fixed = (n, length) => {
  let s = (n >>> 0).toString(36)
  while (s.length < length) s = `0${s}`
  if (s.length > length) s = s.slice(-length)
  return s
}

const slugForQuestion = (question, used) => {
  const body = `${question.mode}\n${question.text.trim()}`
  for (let attempt = 0; attempt < 24; attempt++) {
    const salt = attempt === 0 ? '' : `\0${question.id}\0${attempt}`
    const length = Math.min(6 + Math.floor(attempt / 4), 12)
    const slug = toBase36Fixed(fnv1a32(body + salt), length)
    const existing = used.get(slug)
    if (!existing || existing === question.id) {
      used.set(slug, question.id)
      return slug
    }
  }
  throw new Error(`Could not assign slug for ${question.id}`)
}

const usedSlugs = new Map()
const byId = new Map()
for (const question of questions) {
  const slug = slugForQuestion(question, usedSlugs)
  byId.set(question.id, { ...question, slug })
}

const escapeHtml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const pickPrompts = (audience, depth, limit) =>
  questions
    .filter(
      (question) =>
        question.mode === 'prompt' &&
        question.depth === depth &&
        question.audience.includes(audience),
    )
    .slice(0, limit)
    .map((question) => byId.get(question.id))
    .filter(Boolean)

const depthLabel = { light: 'Light', honest: 'Honest', deep: 'Deep' }

const pages = [
  {
    slug: '',
    path: '/guides/',
    title: 'Christian conversation starters — Spill',
    description:
      'Faith-shaped conversation starters for fellowship, household, dating, marriage, and youth. Browse questions, then draw a card.',
    heading: 'Christian conversation starters',
    lede: 'Most rooms do not need a louder icebreaker. They need a better question — one that helps people tell the truth without forcing the moment.',
    body: [
      'Spill is a deck of Christian conversation starters for shared life: fellowship nights, homes, dating, engagement, marriage, and youth. Pick a pack and a depth, then draw a card.',
      'Each list below is a real subset of the live deck. Read a few, then draw a card if you want the next one without scrolling.',
    ],
    cards: [
      {
        href: '/guides/christian-conversation-starters/',
        title: 'Christian conversation starters',
        blurb: 'The main list: honest faith questions for real rooms.',
      },
      {
        href: '/guides/small-group-questions/',
        title: 'Small group questions',
        blurb: 'Icebreakers and deeper questions for church fellowship.',
      },
      {
        href: '/guides/christian-dating-questions/',
        title: 'Christian dating questions',
        blurb: 'Clarity, tenderness, and purity — not temptation.',
      },
      {
        href: '/guides/youth-group-questions/',
        title: 'Youth group questions',
        blurb: 'Age-aware questions students can actually answer.',
      },
      {
        href: '/guides/family-faith-questions/',
        title: 'Family faith questions',
        blurb: 'Household questions for the table, the car, and bedtime.',
      },
    ],
    faqs: [
      {
        q: 'What is Spill?',
        a: 'Spill is a free browser deck of Christian conversation starters. Choose your packs and depth, then draw a card. No account, no room code.',
      },
      {
        q: 'Are these the same questions as the app?',
        a: 'Yes. Every question on these pages comes from the live Spill library. The lists are samples; the app holds the full deck.',
      },
    ],
  },
  {
    slug: 'christian-conversation-starters',
    path: '/guides/christian-conversation-starters/',
    title: 'Christian conversation starters for real faith — Spill',
    description:
      'Christian conversation starters that move a room past small talk. Light, honest, and deep questions for friends, family, dating, and church.',
    heading: 'Christian conversation starters for real faith',
    lede: 'A good Christian conversation starter does not perform spirituality. It makes it safer to say what is actually true.',
    body: [
      'Spill started as a simple product: pick your packs, choose a depth, and draw a card. The questions themselves used to live behind a tap. This page is the public version of that deck.',
      'Use a light starter to open the room. Use an honest question when people are already present. Save the deep cards for trust. If you want the next card without scrolling a list, draw from the full library.',
    ],
    sections: [
      {
        heading: 'Light conversation starters',
        items: pickPrompts('fellowship', 'light', 8),
      },
      {
        heading: 'Honest questions for shared life',
        items: pickPrompts('fellowship', 'honest', 8),
      },
      {
        heading: 'Deep questions when the room can hold them',
        items: pickPrompts('fellowship', 'deep', 8),
      },
    ],
    faqs: [
      {
        q: 'What makes a conversation starter Christian?',
        a: 'Not every card names Jesus out loud. The Christian ones are written from a worldview of honesty before God, repair, prayer, scripture, and shared life in the church. Spill also lets you filter for more overt language.',
      },
      {
        q: 'How do I use these with people who are not in church?',
        a: 'Start light. Ask one question, then stay quiet long enough for a real answer. You do not need to turn the moment into a lesson.',
      },
      {
        q: 'Is this a printable card game?',
        a: "Spill is a web deck you can open on a phone in seconds. Share a card link if you want one question on everyone's screen.",
      },
    ],
    related: [
      ['Small group questions', '/guides/small-group-questions/'],
      ['Christian dating questions', '/guides/christian-dating-questions/'],
      ['Youth group questions', '/guides/youth-group-questions/'],
    ],
  },
  {
    slug: 'small-group-questions',
    path: '/guides/small-group-questions/',
    title: 'Small group icebreaker questions for church — Spill',
    description:
      'Small group icebreaker questions and deeper church fellowship questions. Warm up a Bible study, then move into honest shared life.',
    heading: 'Small group icebreaker questions for church',
    lede: 'A small group does not stall because people are uninterested. It stalls because the first question asked for a polished answer.',
    body: [
      'These are fellowship questions from Spill: cards for brothers and sisters in Christ who already share a room, a meal, or a study. They work as church icebreakers, and they also work after the study when the group is still hanging around.',
      'Skip the “name a fun fact” round if the group is tired of performing. Start with something human. Then let one honest card do the work a curriculum often cannot.',
    ],
    sections: [
      {
        heading: 'Icebreakers that do not feel fake',
        items: pickPrompts('fellowship', 'light', 10),
      },
      {
        heading: 'Questions after the study',
        items: pickPrompts('fellowship', 'honest', 8),
      },
      {
        heading: 'When the group has trust',
        items: pickPrompts('fellowship', 'deep', 8),
      },
    ],
    faqs: [
      {
        q: 'What is a good icebreaker for a church small group?',
        a: 'One that a quiet person can answer in a sentence, without a testimony speech. “What made you smile this week?” is enough. Save heavier cards for later.',
      },
      {
        q: 'How many questions should a leader prepare?',
        a: 'Two is plenty: one light opener and one honest follow-up. If the room is alive, do not keep dealing cards just to stay on script.',
      },
      {
        q: 'Can I use these in a Bible study?',
        a: 'Yes. Use a light starter before the text, then an honest or scripture-shaped card after. The point is conversation, not replacing the passage.',
      },
    ],
    related: [
      [
        'Christian conversation starters',
        '/guides/christian-conversation-starters/',
      ],
      ['Youth group questions', '/guides/youth-group-questions/'],
      ['Family faith questions', '/guides/family-faith-questions/'],
    ],
  },
  {
    slug: 'christian-dating-questions',
    path: '/guides/christian-dating-questions/',
    title: 'Christian dating questions that stay honest — Spill',
    description:
      'Christian dating questions for discernment, clarity, and purity. Faith-shaped date night questions that do not slide into temptation.',
    heading: 'Christian dating questions that stay honest',
    lede: 'Dating questions go wrong when they either stay cute forever or rush intimacy the relationship has not earned.',
    body: [
      'Spill’s dating pack is written for discernment: how someone follows Jesus, how they repair, what they do with fear, and whether a relationship deepens faith or distracts from it. The cards are meant to stay tender without becoming a trap.',
      'Use light starters on an early date. Use honest questions when you need clarity. Keep the deep cards for a relationship that already has some weight — and if you are engaged, the engaged pack is more specific about covenant, money, and the first year.',
    ],
    sections: [
      {
        heading: 'Light date-night questions',
        items: pickPrompts('dating', 'light', 8),
      },
      {
        heading: 'Honest questions before you get further in',
        items: pickPrompts('dating', 'honest', 8),
      },
      {
        heading: 'Deep questions about covenant and faith',
        items: pickPrompts('dating', 'deep', 8),
      },
    ],
    faqs: [
      {
        q: 'What should Christian couples talk about early?',
        a: 'How they handle conflict, what church actually looks like in a week, and whether they can tell the truth without managing the other person. Chemistry is a weak substitute for that.',
      },
      {
        q: 'Are these purity questions?',
        a: 'Some are. The pack is written to protect the relationship, not to flirt around the edges of it. If a question starts to feel like a test, stop and say so.',
      },
      {
        q: 'Can engaged couples use this too?',
        a: 'Yes, but Spill also has an Engaged pack for covenant prep: money, roles, intimacy, and ordinary married life. Draw from that deck when the wedding is no longer hypothetical.',
      },
    ],
    related: [
      [
        'Christian conversation starters',
        '/guides/christian-conversation-starters/',
      ],
      ['Family faith questions', '/guides/family-faith-questions/'],
    ],
  },
  {
    slug: 'youth-group-questions',
    path: '/guides/youth-group-questions/',
    title: 'Youth group discussion questions students will answer — Spill',
    description:
      'Youth group discussion questions and icebreakers that stay honest and age-aware. Questions for students, leaders, and youth nights.',
    heading: 'Youth group discussion questions students will answer',
    lede: 'Teenagers shut down when a question asks them to perform a faith they are still trying to tell the truth about.',
    body: [
      'These youth questions from Spill are written to be honest without being unsafe. They work for a youth night, a small student group, or a car ride after church. Leaders can draw a card in the room instead of printing a packet.',
      'Start lighter than you think. A student who answers one real question will often keep going. A student who is put on the spot with a deep card will give you the youth-group answer and check out.',
    ],
    sections: [
      {
        heading: 'Openers for a youth night',
        items: pickPrompts('youth', 'light', 8),
      },
      {
        heading: 'Honest questions about real life',
        items: pickPrompts('youth', 'honest', 8),
      },
      {
        heading: 'Deeper questions when trust is there',
        items: pickPrompts('youth', 'deep', 8),
      },
    ],
    faqs: [
      {
        q: 'What are good youth group icebreakers?',
        a: 'Questions about the week, friendship, and what actually helps them pay attention to God. Avoid questions that reward the loudest story or force a testimony.',
      },
      {
        q: 'How do I keep this age-aware?',
        a: 'Read the card before you ask it. If it would embarrass a quieter student in a mixed room, save it for a smaller group or skip it.',
      },
      {
        q: 'Can students draw their own cards?',
        a: 'Yes. Hand someone the phone and let them tap. Ownership beats a leader interviewing the circle.',
      },
    ],
    related: [
      ['Small group questions', '/guides/small-group-questions/'],
      [
        'Christian conversation starters',
        '/guides/christian-conversation-starters/',
      ],
    ],
  },
  {
    slug: 'family-faith-questions',
    path: '/guides/family-faith-questions/',
    title: 'Family faith conversation questions for home — Spill',
    description:
      'Christian family conversation starters for the table, the car, and ordinary home life. Household questions about faith, repair, and belonging.',
    heading: 'Family faith conversation questions for home',
    lede: 'A household does not become spiritually close by adding another devotion product. It becomes close when people can tell the truth under one roof.',
    body: [
      'Spill’s household pack is for the daily life of a home: kindness that showed up this week, the tension that arrives when everyone is tired, and the faith you hope the next generation keeps. These are family conversation starters that can survive a real Tuesday.',
      'Ask one at dinner. Ask one on a drive. Do not turn it into a quiz. If a child answers briefly, receive it. The next honest sentence often comes later.',
    ],
    sections: [
      {
        heading: 'Light questions around the table',
        items: pickPrompts('household', 'light', 8),
      },
      {
        heading: 'Honest questions when home feels rushed',
        items: pickPrompts('household', 'honest', 8),
      },
      {
        heading: 'Deeper family faith questions',
        items: pickPrompts('household', 'deep', 8),
      },
    ],
    faqs: [
      {
        q: 'How do we start faith conversations at home without it feeling forced?',
        a: 'Attach the question to something you already do: dinner, a drive, or the walk after church. One question is better than a family meeting.',
      },
      {
        q: 'Are these only for families with kids?',
        a: 'No. Household includes roommates, adult children, and anyone sharing ordinary life under one roof.',
      },
      {
        q: 'What if someone does not want to answer?',
        a: 'Let them pass. A conversation tool that requires compliance stops being a conversation.',
      },
    ],
    related: [
      ['Small group questions', '/guides/small-group-questions/'],
      ['Christian dating questions', '/guides/christian-dating-questions/'],
    ],
  },
]

const renderPrompts = (items = []) => {
  if (!items.length) return ''
  const list = items
    .map((item) => {
      const depth = depthLabel[item.depth] ?? item.depth
      return `<li><a href="/c/${item.slug}"><span>${escapeHtml(
        item.text,
      )}</span><span class="meta">${escapeHtml(depth)}</span></a></li>`
    })
    .join('')
  return `<ol class="prompts">${list}</ol>`
}

const renderCards = (cards = []) => {
  if (!cards.length) return ''
  return `<div class="cards">${cards
    .map(
      (card) =>
        `<a class="card" href="${card.href}"><strong>${escapeHtml(
          card.title,
        )}</strong><span>${escapeHtml(card.blurb)}</span></a>`,
    )
    .join('')}</div>`
}

const renderFaqs = (faqs = []) => {
  if (!faqs.length) return ''
  const items = faqs
    .map(
      (faq) =>
        `<details><summary>${escapeHtml(faq.q)}</summary><p>${escapeHtml(
          faq.a,
        )}</p></details>`,
    )
    .join('')
  return `<section class="faq" aria-labelledby="faq-heading"><h2 id="faq-heading">Questions people ask</h2>${items}</section>`
}

const renderRelated = (related = []) => {
  if (!related.length) return ''
  const items = related
    .map(
      ([label, href]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`,
    )
    .join('')
  return `<section><h2>More question lists</h2><ul>${items}</ul></section>`
}

const jsonLd = (page) => {
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${origin}${page.path}`,
      url: `${origin}${page.path}`,
      name: page.title,
      description: page.description,
      isPartOf: { '@id': `${origin}/#website` },
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      url: `${origin}/`,
      name: 'Spill',
    },
  ]
  if (page.faqs?.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    })
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
}

const renderPage = (page) => {
  const sections = (page.sections ?? [])
    .map(
      (section) =>
        `<section><h2>${escapeHtml(section.heading)}</h2>${renderPrompts(
          section.items,
        )}</section>`,
    )
    .join('')
  const body = (page.body ?? []).map((p) => `<p>${escapeHtml(p)}</p>`).join('')
  const cssHref = page.slug ? '../guides.css' : './guides.css'
  const crumb = page.slug
    ? `<a class="crumb" href="/guides/">All starters</a>`
    : `<span class="domain">spill.cards</span>`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeHtml(page.description)}" />
    <link rel="canonical" href="${origin}${page.path}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${origin}${page.path}" />
    <meta name="twitter:card" content="summary" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
    <link rel="stylesheet" href="${cssHref}" />
    <script type="application/ld+json">${jsonLd(page)}</script>
  </head>
  <body>
    <div class="wrap">
      <header class="site-header">
        <a class="wordmark" href="/">Spill</a>
        ${crumb}
      </header>
      <main>
        <h1>${escapeHtml(page.heading)}</h1>
        <p class="lede">${escapeHtml(page.lede)}</p>
        ${body}
        <p><a class="cta" href="/">Draw a card</a></p>
        ${renderCards(page.cards)}
        ${sections}
        ${renderFaqs(page.faqs)}
        ${renderRelated(page.related)}
      </main>
      <footer class="site-footer">
        <a href="/">Draw a card</a>
        <a href="/guides/">Question lists</a>
      </footer>
    </div>
  </body>
</html>
`
}

const guidesRoot = join(root, 'app/public/guides')
for (const page of pages) {
  if (!page.slug) continue
  rmSync(join(guidesRoot, page.slug), { recursive: true, force: true })
}

const written = []
for (const page of pages) {
  const file = page.slug
    ? join(guidesRoot, page.slug, 'index.html')
    : join(guidesRoot, 'index.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, renderPage(page))
  written.push(page.path)
}

const sitemapUrls = [
  { loc: `${origin}/`, priority: '1.0' },
  ...pages.map((page) => ({
    loc: `${origin}${page.path}`,
    priority: page.slug ? '0.8' : '0.9',
  })),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(join(root, 'app/public/sitemap.xml'), sitemap)

execFileSync('pnpm', ['exec', 'prettier', '--write', 'app/public/guides'], {
  cwd: root,
  stdio: 'inherit',
})

console.log(`Wrote ${written.length} guide pages and sitemap.xml`)
