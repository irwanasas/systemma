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

@AGENTS.md
