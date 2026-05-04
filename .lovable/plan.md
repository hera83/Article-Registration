# Article Registration — V1 Plan

A clean, search-first utility app to register personal articles, avoid duplicate purchases, and manage simple restocking. Backed by Lovable Cloud (real database), not an ERP.

## Pages & navigation

Top bar with: app name, theme toggle, and links:
- **Search** (home, `/`)
- **Shopping List** (`/shopping`)
- **Settings** (`/settings`)
- Primary "Add article" button (opens modal from anywhere)

Mobile: nav collapses to a bottom bar with Search, Shopping, Add, Settings.

## 1. Search page (home)

The visually dominant element is a large search input centered near the top, with a subtle subtitle like "Search your articles".

Below it:
- **Filter row** (compact, collapsible on mobile):
  - Article type: All / Normal / Stock
  - Area (multi-select dropdown)
  - Tags (multi-select chips)
  - Shopping list: All / On list / Not on list
  - Stock status: All / In stock / Empty (only meaningful when Stock type)
  - Status: Active / Archived / All (defaults Active)
- **Results grid** of article cards (responsive: 1 col mobile, 2–3 cols desktop).
- Empty state: friendly illustration + "No matching articles. Create one?" CTA.
- Loading state: skeleton cards.

Search matches: name, note, brand, model, tags (case-insensitive substring).

### Article result card
- Name (bold)
- Type badge (Normal / Stock)
- Area badge
- Tag chips (truncated, +N more)
- Brand · Model (if present, muted)
- Stock articles: quantity + unit, with an "Empty" badge if 0
- "On shopping list" indicator
- "Archived" indicator if archived
- Quick actions (icon buttons): Edit, Mark empty (stock only), Add/Remove shopping list

## 2. Add / Edit article (modal dialog)

Single modal used for both create and edit. Fields:
- Name (required)
- Article type: Normal / Stock (segmented control)
- Area (select)
- Tags (chip input with autocomplete from existing tags + free entry)
- Note / description (textarea)
- Brand, Model (two inputs side by side)
- Typical location (input)
- Active / Archived (switch)

Stock-only section (only visible when type = Stock, clearly grouped):
- Quantity (number) + Unit (input)
- On shopping list (switch)
- Shopping note (input, only when on list)

**Duplicate prevention**: as the user types the name, show up to 3 similar existing articles below the name field (simple matching on name/brand/model/tags). Each is clickable to open instead of creating.

Save shows a toast. Cancel discards.

## 3. Shopping list page

List of all articles where `onShoppingList = true`. Each row:
- Name + area + tags
- Brand / model (muted)
- Inline quantity input + unit
- Shopping note
- Actions: Open article, Remove from list

**Restock flow**: typing a quantity > 0 in the inline input updates the article quantity and automatically removes it from the shopping list (with toast: "RJ45 connectors restocked — removed from list", with Undo).

Empty state: "Nothing to buy. Nice."

## 4. Settings page

- Theme: Light / Dark / System (segmented control)
- Areas: list with add / rename / delete (delete blocked if in use, with explanation)
- Tags: list with rename / delete (delete just removes from articles)
- Nothing else — no admin clutter.

## Design system

- Light + dark + system themes via a `ThemeProvider` (writes `class="dark"` on `<html>`, persisted in localStorage).
- Calm, professional palette defined as HSL tokens in `index.css` (neutral background, single accent color, semantic badges for Normal vs Stock, success for "in stock", warning for "empty", info for "on shopping list").
- Reusable shadcn components: Button, Input, Dialog, Badge, Card, Select, Switch, Tabs, Toast (sonner), Skeleton, DropdownMenu, Command (for tag/area pickers).
- Generous spacing, subtle borders, no gradients, no heavy shadows.

## Data model (Lovable Cloud)

Tables:
- `areas` — id, name, created_at
- `tags` — id, name, created_at
- `articles`
  - id, name, article_type ('normal' | 'stock'), area_id, brand, model,
  - note, unit, quantity (nullable), typical_location,
  - on_shopping_list (bool), shopping_note, archived (bool),
  - user_id, created_at, updated_at
- `article_tags` — article_id, tag_id (composite PK)

RLS: every table restricted to `auth.uid() = user_id` (articles) or readable by all authenticated users (areas/tags shared per user — scoped by user_id too for isolation).

Auth: Email/password + Google sign-in (Lovable Cloud defaults). A simple `/auth` page; unauthenticated users are redirected there.

Seed: on first sign-in, if the user has no articles, insert the demo set (RJ45 CAT6 connectors, CAT6 cable roll, Motor oil 5W-30, Oil filter Renault Kajar, Renault Kajar alloy wheels, HP enterprise server, Ubiquiti switch, Multimeter, Electrical tape, VVS fitting, Cable clips, Network tester) plus the initial areas and tags.

## Code structure

```text
src/
  pages/
    Index.tsx          (Search)
    ShoppingList.tsx
    Settings.tsx
    Auth.tsx
    NotFound.tsx
  components/
    Layout.tsx
    ThemeProvider.tsx
    ThemeToggle.tsx
    ArticleCard.tsx
    ArticleDialog.tsx        (create + edit)
    ArticleFilters.tsx
    SearchBar.tsx
    TagInput.tsx
    AreaSelect.tsx
    DuplicateHints.tsx
    ShoppingRow.tsx
    EmptyState.tsx
  hooks/
    useArticles.ts           (TanStack Query: list/search/create/update/delete)
    useAreas.ts
    useTags.ts
    useTheme.ts
  lib/
    types.ts                 (Article, Area, Tag, Filters)
    search.ts                (client-side filtering + similarity)
    seed.ts
```

All data access goes through the hooks, so the same UI can later point at a .NET 10 Web API by swapping the hook implementations.

## Out of scope (V1)

No prices, suppliers, purchase history, barcodes, roles/permissions, dashboards, or order/invoice management.

## Build order

1. Lovable Cloud setup: schema, RLS, auth, seed function.
2. Theme provider + layout + nav.
3. Article hooks + types.
4. Search page (search + filters + cards + quick actions).
5. Add/Edit dialog with duplicate hints.
6. Shopping list page with inline restock flow.
7. Settings (theme + areas + tags).
8. Polish: empty states, skeletons, toasts, mobile pass.