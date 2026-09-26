# CLAUDE.md

## Always use lean-dev

On every task and every response, invoke the `lean-dev` skill
(`.claude/skills/lean-dev/SKILL.md`) first and follow it fully. It is always in
effect, coding or not, and stops only if the user says "stop lean" or
"normal mode".

## Always use bencium-controlled-ux-designer when building

At the start of every build phase (F0–F8), and before writing any UI, invoke
the `bencium-controlled-ux-designer` skill and follow it. Ask before every
visual decision (colors, fonts, sizes, layouts); until one is approved, screens
stay unstyled semantic HTML.

## Always use bencium-code-conventions when writing code

At the start of every phase that writes code (F0–F8), invoke the
`bencium-code-conventions` skill and apply it as this project's code standard.
Overrides (from `docs/ARCHITECT_BLUEPRINT.md` §0.1):

- Tailwind CSS v4, not v3.
- Supabase is fixed; no Convex, no Neon.
- Ignore "Mac M2", "avoid Python, try Rust", and Netlify/Fly suggestions.
- A local Supabase stack in Docker is used only for automated tests (pgTAP and e2e).
- Keep `docs/progress.md` updated at the end of each phase.
- No code comments, even where a skill example shows them.

## Always use human-architect-mindset for architecture decisions

At the start of F0, and before any decision that changes schema, auth, the
order status graph, or folder structure, invoke the `human-architect-mindset`
skill. Treat blueprint §3 as the Constitution: flag any change that would
break it and ask before making it.

@AGENTS.md
