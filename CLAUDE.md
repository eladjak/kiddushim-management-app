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
