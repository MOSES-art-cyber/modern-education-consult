# Modern Education Consult

## Current State
- Blog admin panel at `/admin` with Internet Identity login
- BlogForm component with auto-save to localStorage every 30s (new posts only)
- Auto-save restore only offered for new posts, not edit mode
- No export/import/backup feature for posts
- All 12 seeded posts hardcoded in Motoko backend stable storage
- User-added posts beyond the seeded 12 can be lost when a new draft is deployed (new canister)

## Requested Changes (Diff)

### Add
- **Export All Posts** button in admin header: downloads all current blog posts as a JSON file for offline backup
- **Import Posts from Backup** button: upload a previously exported JSON file and restore posts to the backend
- **Auto-save on every form change** (debounced 2s) in addition to the interval
- **Auto-save for edit mode** (not just new posts) — restore prompt when re-opening an edit
- **Visual auto-save indicator** — show a pulsing green dot and timestamp when saving, "All changes saved" confirmation
- **Unsaved changes warning** — browser `beforeunload` prompt if leaving with unsaved edits
- **Auto-save interval reduced to 5 seconds** (from 30s)

### Modify
- `BlogForm` — reduce auto-save interval from 30s to 5s, add onChange debounced save, fix restore to work for both new and edit post IDs, add beforeunload guard
- `AdminPage` — add Export and Import buttons with clear backup/restore UX

### Remove
- Nothing removed

## Implementation Plan
1. In `AdminPage.tsx` `BlogForm`: reduce auto-save interval to 5s; add `useEffect` watching form changes with 2s debounced save; fix restore logic to offer restore for both new and edit modes
2. Add `beforeunload` event listener in `BlogForm` that warns if form is dirty
3. Update auto-save status indicator to show live pulsing dot while saving
4. In `AdminPage` main component: add `handleExportPosts` that serializes `posts` array to JSON and triggers download
5. Add `handleImportPosts` that reads an uploaded JSON file and calls `addMutation` for each post not already in the current list
6. Add Export and Import buttons in the admin header section with tooltips explaining their purpose
