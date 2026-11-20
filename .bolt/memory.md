# Project memory

## Product intent & audience

- MUSE is an inspiration web app delivering daily quotes and curated content.
- Audience: users seeking premium, reflective, editorial-quality inspiration.
- Delivered incrementally via milestones; Milestone 1 = setup/design/layout, Milestone 2 = Today screen + quotes.

## Brand personality & voice

- Premium, editorial, reflective — not playful or generic.
- Calm, intentional language (e.g. "Fresh Perspective" after a random draw vs. the calendar date for the daily quote).

## Visual design & UX direction

- Editorial aesthetic: large Cormorant Garamond italic quotes, faint rose quotation-mark ornament, category badge with sparkle icon.
- Rose accent tone in the palette; theme switching supported (light/dark).
- Cross-fade transitions between quotes; layout stays stable when toggling show/hide.
- Responsive layout and navigation from Milestone 1 are treated as fixed foundations — not to be rebuilt.
- Icons via lucide-react; components imported via `@/` alias; Tailwind + React hooks only.

## Decisions, constraints & rationale

- Quotes are local only — no external API. `src/quotes/data.ts` holds 100 quotes, 10 per category across: Motivation, Success, Confidence, Love, Life, Creativity, Discipline, Happiness, Growth, Dreams.
- Each quote: `{ text, author, category }`.
- Daily quote is deterministic via calendar-date hash; same quote all day, changes at midnight. A timer updates it live if the app stays open across midnight.
- Random "New Quote" guarantees no immediate repeat of the currently shown quote.
- "Previous Quote" walks back through the current session's viewed-quote history; disabled when no history exists.
- Show/hide toggles quote text while preserving card layout.
- No fake buttons — every control must be functional.
- Milestone scope is strict: no favorites, mood selection, history persistence, or quote-card downloads yet.

## Open questions & assumptions

- Quote history is in-session only (not persisted) — persistence deferred to a future milestone.
- Favorites, mood selection, download/share, and full history are explicitly future milestones; designs should anticipate but not implement them.
- No testing framework mentioned; verification done via build/typecheck and standalone logic checks.