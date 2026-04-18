# Kidushishi Management - הנחיות פיתוח

## הפרויקט
אפליקציית ניהול בטייפסקריפט - ממשק משתמש, ניהול נתונים, ודוחות.

## עקרונות
- UX ידידותי ונגיש
- ביצועים מהירים
- קוד מתוחזק
- בדיקות מקיפות

## טכנולוגיות
- TypeScript
- React

## פקודות
- `bun run build` - בנייה
- `bun test` - בדיקות
- `bunx tsc --noEmit` - בדיקת טייפים

---

## UI/Design Tools (MANDATORY - Feb 2026)

### Google Stitch MCP (USE FOR ALL UI WORK)
Before designing ANY UI component, page, or layout:
1. Use Stitch MCP tools: `build_site`, `get_screen_code`, `get_screen_image`
2. Generate designs in stitch.withgoogle.com first, then pull code via MCP
3. Use `/enhance-prompt` skill to optimize prompts for Stitch
4. Use `/design-md` skill to document design decisions
5. Use `/react-components` skill to convert Stitch designs to React

### Available Design Skills
- `/stitch-loop` - Generate multi-page sites from a single prompt
- `/enhance-prompt` - Refine UI ideas into Stitch-optimized prompts
- `/design-md` - Create design documentation from Stitch projects
- `/react-components` - Convert Stitch screens to React components
- `/shadcn-ui` - shadcn/ui component integration guidance
- `/remotion` - Create walkthrough videos from designs
- `/omc-frontend-ui-ux` - Designer-developer UI/UX agent

### Rule: NEVER design UI from scratch with Claude tokens. Always use Stitch MCP or v0.dev first!

---

## Agent Tools & MCP (חובה!)

### לפני כתיבת קוד
- **Context7 MCP**: `resolve-library-id` → `query-docs` - לבדוק API/syntax עדכני
- **Octocode MCP**: `githubSearchCode` - לחפש implementations אמיתיים ב-GitHub
- **DeepWiki MCP**: `ask_question` - לשאול על ריפו ספציפי

### לעבודת UI (אם רלוונטי)
- **Stitch MCP**: `build_site` / `get_screen_code` - לעיצוב לפני קוד
- **ReactBits**: reactbits.dev - קומפוננטות אנימטיביות

### בסיום כל איטרציה
1. עדכן PROGRESS.md עם מה שנעשה בפועל
2. הרץ typecheck: `bunx tsc --noEmit`
3. ודא build עובד לפני commit
4. commit עם הודעה: `feat/fix/refactor: תיאור באנגלית`


---

## 🏭 AI Factory / Agent Network (Sprint 5, Apr 2026)

See `~/.claude/AI_FACTORY_ARCHITECTURE.md` for full details.

**Delegator API** (http://37.27.31.1:3900) — single entry point for content/research/messaging:
- `/pipeline/full` — research + landing page + email + social post in 78s
- `/content-studio/generate` — AI content pipeline (Sanity + 10 brands)
- `/sms/send` — Rav Messer Israeli SMS
- `/postiz/post` — multi-platform social publish
- `/drive/search`, `/calendar/check` — Google (OAuth configured)

**10 agents**: Kami (WA :3001), Kaylee (infra :18789), Claude Code, CrewAI (:8001), Dashboard, + Hermes / n8n / Ollama / Uptime Kuma / Coolify

**Public URLs**: kami.eladjak.com · content-social.eladjak.com · pages.fullstack-eladjak.co.il · studio.fullstack-eladjak.co.il

When building features that need content, publishing, messaging, or research — call the delegator instead of reimplementing.

