import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Env = {
  DB: D1Database
}

type SubmissionBody = {
  name?: unknown
  days?: unknown
}

type TopTenRow = {
  day: string
  votes: number
  voters: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('/api/*', cors({
  origin: ['https://zdralmat.github.io', 'http://localhost:3000'],
}))

// POST /api/availability
// Body: { name: string, days: string[] }
app.post('/api/availability', async (c) => {
  let body: SubmissionBody
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const name =
    typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''

  const days = Array.isArray(body.days)
    ? (body.days as unknown[])
        .filter(
          (d): d is string =>
            typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d),
        )
        .slice(0, 365)
    : []

  if (!name || days.length === 0) {
    return c.json({ error: 'Missing or invalid name / days' }, 400)
  }

  // Atomicky: smaž staré záznamy pro toto jméno, vlož nové
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM submissions WHERE name = ?').bind(name),
    ...days.map((day) =>
      c.env.DB.prepare('INSERT INTO submissions (name, day) VALUES (?, ?)').bind(name, day)
    ),
  ])

  return c.json({ ok: true })
})

// GET /api/top-ten
// Returns: [{ day: "2026-07-10", votes: 12, voters: "Jan, Petr" }, ...]
app.get('/api/top-ten', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT day, COUNT(*) AS votes, GROUP_CONCAT(name, ', ') AS voters
     FROM submissions
     GROUP BY day
     ORDER BY votes DESC
     LIMIT 10`,
  ).all<TopTenRow>()

  return c.json(results)
})

export default app
