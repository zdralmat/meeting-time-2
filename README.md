# Meeting Time

Zjednodušená When2Meet aplikace. Frontend na GitHub Pages, backend na Cloudflare Workers + D1.

- **Frontend:** https://zdralmat.github.io/meeting-time-2/
- **API:** https://meeting-time-api.mlok.workers.dev

## Spuštění lokálně

**Terminál 1 — Worker (API):**
```bash
cd worker
npm install
npm run db:init   # první spuštění
npm run dev       # http://localhost:8787
```

**Terminál 2 — Frontend:**
```bash
npm install
npm start         # http://localhost:3000
```

## Build a deploy

```bash
# Frontend (GitHub Pages)
API_URL=https://meeting-time-api.mlok.workers.dev npm run build
git add docs/ && git commit -m "build" && git push

# Worker (Cloudflare)
cd worker && npm run deploy
```

---

## Reset dat

### Smazat všechna hlasování (produkce)
```bash
cd worker
npx wrangler d1 execute meeting-time-db --remote --command "DELETE FROM submissions;"
```

### Smazat všechna hlasování (lokálně)
```bash
cd worker
npx wrangler d1 execute meeting-time-db --command "DELETE FROM submissions;"
```

### Kompletní reset lokální DB (smaže + znovu vytvoří schéma)
```bash
cd worker
rm -rf .wrangler/state/v3/d1
npm run db:init
```

### Kompletní reset produkční DB (smaže + znovu vytvoří schéma)
```bash
cd worker
npx wrangler d1 execute meeting-time-db --remote --command "DROP TABLE IF EXISTS submissions;"
npm run db:init:remote
```

---

## Správa databáze

### Zobrazit obsah produkční DB
```bash
cd worker
npx wrangler d1 execute meeting-time-db --remote --command "SELECT * FROM submissions ORDER BY created_at DESC LIMIT 50;"
```

### Zobrazit Top 10 v produkci
```bash
cd worker
npx wrangler d1 execute meeting-time-db --remote --command "SELECT day, COUNT(*) as votes, GROUP_CONCAT(name, ', ') as voters FROM submissions GROUP BY day ORDER BY votes DESC LIMIT 10;"
```

### Zobrazit obsah lokální DB
```bash
cd worker
npx wrangler d1 execute meeting-time-db --command "SELECT * FROM submissions ORDER BY created_at DESC LIMIT 50;"
```

### Zobrazit obsah produkční DB
```bash
npx wrangler d1 execute meeting-time-db --remote --command "SELECT * FROM submissions ORDER BY created_at DESC LIMIT 50;"
```

### Zobrazit Top 10 v produkci
```bash
npx wrangler d1 execute meeting-time-db --remote --command \
  "SELECT day, COUNT(*) as votes, GROUP_CONCAT(name, ', ') as voters FROM submissions GROUP BY day ORDER BY votes DESC LIMIT 10;"
```
