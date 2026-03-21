# Plan: Redesign & Restructure Certification Detail Page

## Goal

1. **Move** the URL from `/practice/aws-saa` → `/certifications/aws-saa` (nested under certifications for consistency)
2. **Beautify** the certification detail / practice entry page to match the new certifications list page quality

## Current Problems (Practice Entry Page)

1. **Emoji icon 🟧** again instead of real SVG logo
2. **Flat, lifeless layout** — plain stacked sections with no visual personality
3. **Boring stats cards** — just numbers in thin-bordered boxes, no color or icons
4. **Plain category list** — simple bordered rows with no visual hierarchy
5. **No hero header** — just a small title next to an emoji
6. **Basic buttons** — default buttons with no visual grouping
7. **URL mismatch** — `/practice/aws-saa` feels disconnected from `/certifications`; should be `/certifications/aws-saa`

## Approach

Two parts: (A) Route restructuring, (B) Visual redesign.

### Part A: Route Migration `/practice/[certId]` → `/certifications/[certId]`

Move the route file and update all references:

| File | Change |
|------|--------|
| `src/app/[locale]/practice/[certId]/page.tsx` | **Move** → `src/app/[locale]/certifications/[certId]/page.tsx` |
| `src/middleware.ts` | Update `protectedRoutes`: `/practice` → `/certifications` (note: `/certifications` list itself is public, only `[certId]` sub-routes need auth — refine check) |
| `src/components/certifications/certification-card.tsx` | Link already goes to `/practice/` → update to `/certifications/` |
| `src/components/practice/practice-entry.tsx` | Internal links `/${locale}/practice/${code}?start=...` → `/${locale}/certifications/${code}?start=...` |
| `src/components/practice/quiz-view.tsx` | Back href + internal links → update to `/certifications/` |
| `src/components/practice/category-list.tsx` | Link → update to `/certifications/` |
| `src/app/[locale]/dashboard/dashboard-client.tsx` | Any practice links → update |
| `src/app/[locale]/search/search-client.tsx` | Any practice links → update |
| `src/app/[locale]/wrong-answers/page.tsx` | Any back/redo links → update |
| `src/app/robots.ts` | Update disallow pattern if present |
| `src/messages/*.json` | Update "Back to practice" → "Back to certification" if needed |

**Middleware refinement**: The certifications list (`/certifications`) should remain public. Only `/certifications/[certId]` (with a sub-path parameter) requires auth. Will adjust the check to protect paths matching `/certifications/` + slug pattern.

### Part B: Visual Redesign of Practice Entry Page

#### Hero Header (Certification Info)
- Full-width gradient banner (provider-colored, same accent system as certification cards)
- Provider SVG logo in a large rounded container (64×64px)
- Certification name as big bold title
- Provider name + description subtitle
- Gradient top bar matching the card style

#### Stats Overview Cards
- 3-column grid with **colored accent icons**: 
  - Progress: circular progress ring or bold numbers with an animated progress bar
  - Correct Rate: percentage with a colored indicator (green if > 70%, yellow if 40-70%, red < 40%)
  - Wrong Answers: red-tinted card with review link
- Each card gets a subtle icon (Target, TrendingUp, AlertCircle)
- Slightly elevated with shadow

#### Practice Mode Section  
- Card-style container grouping the action buttons
- Buttons with better visual hierarchy: primary CTA has gradient or filled style, secondary outlined
- Icon improvements: real icons instead of 📖 emoji for memorization mode

#### Category List
- Cards with provider-colored left border accent
- Progress bar with animated fill (matching certifications page style)
- Hover effect with subtle lift
- Category icon or numbered badge

## Files Affected

| File | Action |
|------|--------|
| `src/app/[locale]/practice/[certId]/page.tsx` | **Delete** (moved) |
| `src/app/[locale]/certifications/[certId]/page.tsx` | **Create** (moved from practice) |
| `src/components/practice/practice-entry.tsx` | **Rewrite** (visual redesign) |
| `src/components/practice/stats-overview.tsx` | **Rewrite** (visual redesign) |
| `src/components/practice/category-list.tsx` | **Rewrite** (visual redesign) |
| `src/components/certifications/certification-card.tsx` | Update link href |
| `src/components/practice/quiz-view.tsx` | Update link hrefs |
| `src/app/[locale]/dashboard/dashboard-client.tsx` | Update link hrefs |
| `src/app/[locale]/search/search-client.tsx` | Update link hrefs |
| `src/app/[locale]/wrong-answers/page.tsx` | Update link hrefs |
| `src/middleware.ts` | Refine protected route pattern |
| `src/app/robots.ts` | Update if needed |
| `docs/design-practice.md` | Update URLs and visual specs |

## Risks / Trade-offs

- URL change could break bookmarks — but this is a dev-stage project, acceptable
- Middleware needs careful adjustment so `/certifications` list stays public while `/certifications/[slug]` requires auth
- Quiz view (the actual question-answering UI) is NOT being redesigned in this PR — only the entry/detail page
