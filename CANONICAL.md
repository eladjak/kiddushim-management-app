# CANONICAL

This is the only repository for the Kidushishi app.

- GitHub: `eladjak/kiddushim-management-app` (branch `main`).
- The older name `eladjak/kidushishi-menegment-app` is the same repository under its former name (GitHub repo id 934144685). It redirects here. There is no second copy and nothing to merge or archive.
- Vercel project `kidushishi-menegment-app` deploys from this repo, branch `main`. Aliases: `kidushishi-menegment-app.vercel.app` and `www.kidushishi-menegment-app.co.il`.
- Local clones may still list the old name as `origin`. Fix with:
  `git remote set-url origin https://github.com/eladjak/kiddushim-management-app.git`

## Shared Supabase database (read before writing any migration)

The Supabase project behind this app is SHARED with Bayit BeSeder (`bayit-beseder`). Tables are not namespaced, so a change here can break the other app.

Kidushishi-only tables: `events`, `event_assignments`, `event_equipment`, `event_registrations`, `registration_rate_limits`, `equipment`, `equipment_changes`, `reports`, `feedback`, `messages`. Storage buckets: `avatars`, `event_posters`, `report_images`.

Bayit-only tables: `households`, `household_members`, `household_agent_tokens`, `tasks`, `task_*`, `shopping_*`, `meals`, `meal_plan`, `streaks`, `achievements`, `user_achievements`, `user_medals`, `wheel_spins`, `love_tokens`, `surprise_box_opens`, `coaching_*`, `subscriptions`, `billing_events`, `whatsapp_webhook_events`, `ai_daily_usage`, `weekly_syncs`, `categories`.

Shared, touched by both apps: `profiles`, `user_roles`, `notifications`, and `auth.users`. The trigger `on_auth_user_created_role` gives every new sign-up (from either app) a `youth_volunteer` row in `user_roles`. Do not change these tables, their RLS policies, or that trigger without checking Bayit BeSeder first.

Table ownership above was derived from each codebase's queries on 2026-09-29. Re-verify before relying on it.
