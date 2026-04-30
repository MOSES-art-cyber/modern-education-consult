# Design Brief: Modern Education Consult Visual Website Builder

## Direction
Professional developer tools aesthetic inspired by VS Code, Linear, and Figma. Dark admin UI optimized for minimal distraction; live page preview showcases full brand styling.

## Tone & Differentiation
Chrome vs Content pattern — editor interface is monochromatic and minimal, while the live page preview retains full brand identity. This creates clear visual separation and prevents UI from interfering with content editing. Inline click-to-edit with contextual overlays, no modal forms.

## Color Palette

| Role | OKLCH | Usage |
|------|-------|-------|
| Editor Background | `0.15 0.05 262` | Dark sidebar, main editor chrome |
| Editor Sidebar | `0.12 0.04 262` | Left panel for page navigation |
| Editor Foreground | `0.93 0.02 0` | Text and labels on dark backgrounds |
| Editor Border | `0.25 0.06 262` | Dividers, subtle structure |
| Editor Hover | `0.28 0.07 262` | Interactive element states |
| Editor Accent | `0.65 0.15 200` | Cyan — hover highlights, active sections, edit overlays |
| Editor Success | `0.65 0.15 130` | Green — save confirmations, completion feedback |
| Editor Muted | `0.5 0.04 0` | Neutral grey for disabled states, placeholders |
| Brand Primary | `0.58 0.2 258` | Public site blue; unchanged on preview |
| Brand Dark | `0.32 0.11 262` | Public site navy; unchanged on preview |

## Typography
- **Display**: Bricolage Grotesque (700) for section titles and editor headings
- **Body**: Plus Jakarta Sans (400, 500, 600) for labels, buttons, content
- **Mono**: None required for this phase

## Shape Language
- Editor chrome: `rounded-sm` (minimal, technical)
- Buttons & controls: `rounded-md` (approachable)
- Edit overlays: `rounded-sm` (sharp, precise)
- Section cards: `rounded-lg` (content separation)

## Structural Zones

| Zone | Background | Border | Purpose |
|------|-----------|--------|---------|
| Editor Header | `editor-bg` | Bottom `editor-border` | Page title, save controls, breadcrumbs |
| Left Sidebar | `editor-sidebar-bg` | Right `editor-border` | Page tree, section navigator, filters |
| Main Canvas | `editor-hover` | None | Live page preview area |
| Preview Embed | Brand/transparent | Subtle frame | The actual website content inside editor |
| Edit Toolbar | `editor-bg` | Top `editor-border` | Inline controls when section is selected |
| Global Controls Panel | `editor-bg` | Left `editor-border` | Navigation, logo, footer management |

## Spacing & Rhythm
- Sidebar width: `16rem` (256px)
- Toolbar height: `2.75rem` (44px)
- Card padding: `1rem` (inner content), `1.5rem` (spacious)
- Edit overlay padding: `0.25rem` (border only, minimal intrusion)
- Section gap: `0.5rem` (tight, professional)

## Component Patterns
- **Page List**: Cards with icon + title + edit button; hover reveals actions (edit/delete)
- **Editable Text**: Inline edit on click; border highlight on hover; smooth transitions
- **Image Block**: Click to open media library or upload; drag to reorder
- **Section Controls**: Add/delete/reorder icons appear on section hover; drag handle visible on select
- **Save Button**: Primary (brand blue) with icon + text; disabled state in muted grey
- **Publish Button**: Success green (brand accent) with confirmation modal
- **Hover Highlights**: 2px cyan border + 5% cyan background overlay; fade in 150ms

## Motion
- **Edit Overlay Enter**: Fade + 2% scale up, 150ms ease-out
- **Drag Reorder**: Smooth 150ms transition on drop
- **Hover States**: Instant background color change; fade opacity on icons
- **Save Feedback**: 300ms pulse on success; instant error highlight in red

## Constraints
- No modal forms — all editing is inline or in side panels
- Editor chrome never overlays page preview content (separate layout)
- Page preview loads exactly as public visitors see it (no editor UI bleeding through)
- All edits remain in draft until explicit Publish action
- Blog, Comments, Applications systems remain untouched

## Signature Detail
Cyan accent line on left edge of selected section, creating a "focus bar" that guides editor attention. Smooth animations (fade in 150ms on select, fade out 150ms on deselect) make the focus bar feel intentional and responsive without being distracting.

## Responsive
- Desktop: Left sidebar 256px, main canvas full width remaining
- Tablet (768px): Sidebar collapses to icon-only nav (64px)
- Mobile (480px): Sidebar hidden, hamburger menu; canvas full width; toolbar icons only
