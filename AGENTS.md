# Everything Beauty — App Architecture Reference

> This file documents the architecture of the Everything Beauty codebase for AI agents working in this repository.
> Read this before making structural decisions or generating new code.

---

## Application Identity

- **Product**: Everything Beauty — Nigerian on-demand beauty marketplace
- **Domain**: `everythingbeauty.app`
- **Market**: Nigeria (NGN currency, local specialists, doorstep delivery model)
- **Stack**: React 19 · TypeScript · Vite · Tailwind CSS · Framer Motion · React Router v7 · Supabase · Lucide React

---

## User Roles & Flows

```
CUSTOMER  → Browse → Book Service → Track Booking → Chat → Leave Review
AGENT     → Register → Await Verification → Manage Profile/Services/Gallery → Accept Bookings → Chat → Receive Payment
ADMIN     → Review Pending Agents → Approve/Reject → Monitor Platform Stats
```

**Role escalation**: A user signs up as `customer` or `agent`. Role is set in `profiles.user_type`. Admin role is manually assigned in DB. No self-escalation path exists.

**Agent verification flow**:
1. Agent registers → `verification_status = 'pending'`
2. Admin reviews profile in `/admin/dashboard` → Verifies or Rejects
3. Verified agents appear on `/agents` page and can receive bookings

---

## State Management

There is **no global state manager** (no Redux, Zustand, Jotai, etc.). State is managed via:

1. **`AuthContext`** — global auth/user state (the only React Context)
2. **Local `useState`** — per-component UI and data state
3. **`useMemo`** — derived/computed values (filtered lists, stats, pagination)
4. **`useEffect`** — data fetching on mount

Do NOT introduce a state management library without explicit approval.

---

## Data Flow

```
Supabase DB
    ↓
services/supabaseService.ts   ← All DB operations (cached, typed)
    ↓
pages/*.tsx (useEffect fetches)
    ↓
Local state (useState)
    ↓
Components (props)
```

The service layer (`supabaseService.ts`) is the only place where raw Supabase calls happen. It owns:
- In-memory caching (TTL-based)
- Error normalization
- Type mapping from DB rows → TypeScript interfaces

---

## Authentication Architecture

```
Supabase Auth (JWT)
    ↓
AuthContext (AuthProvider wrapping entire app)
    ├── user: Supabase User object
    ├── currentUser: Derived User interface (from types.ts)
    ├── role: UserRole enum (resolved from profiles.user_type)
    ├── profile: Raw profiles table row
    └── loading: boolean
```

**Auth guards**: There are no route-level auth guard components. Pages handle their own auth checks (redirect to `/auth` if not logged in). Consider this when adding new protected routes.

---

## Component Hierarchy

```
App.tsx
└── HashRouter
    └── SmoothScroll (Lenis wrapper)
        └── AuthProvider
            └── SnackbarProvider
                ├── ScrollProgressBar
                ├── Navbar
                ├── <Routes>
                │   └── [page components]
                ├── Footer (inline in App.tsx)
                └── ScrollToTopButton
```

**Key detail**: `SmoothScroll` wraps `AuthProvider`, so Lenis is initialized before auth resolves. Do not move providers above `SmoothScroll`.

---

## Agents Page — Intelligent Search

`pages/Agents.tsx` has a client-side intelligent search system:
- `services/intelligentSearch.ts` does fuzzy matching, category detection, and fallback suggestions
- When `search.trim().length > 0`, filtering bypasses specialty tabs and uses `searchAgentsIntelligently()`
- When search is inactive, specialty tabs filter via `agent.specialty` exact/case-insensitive match
- Pagination: 12 items per page, managed via `currentPage` state

---

## Booking Flow

```
User clicks "Book Now" on agent card
    ↓
If agent has a Service record → Open BookingModal (inline modal)
If not → Navigate to /agent/:id?book=true#services

BookingModal
    ↓
Collect: date, time, address, notes
    ↓
supabaseService.createBooking()
    ↓
Snackbar success/error
    ↓
WhatsApp notification (whatsappService.ts)
```

---

## Styling Rules

### Must-Follow
- Use brand color tokens (`brand-interactive`, `brand-surface`, etc.) — never hardcode their hex values in JSX
- All new components must support dark mode — pair every light class with a `dark:` variant
- Use `rounded-2xl` minimum for cards; prefer `rounded-3xl` or `rounded-[2.5rem]`
- Interactive elements need `active:scale-95 cursor-pointer transition-all` for tactile feedback

### Must-Avoid
- Do NOT use `font-light` for user-visible content
- Do NOT use inline `style={{}}` for anything achievable with Tailwind
- Do NOT hardcode pixel values for spacing/sizing — use Tailwind scale
- Do NOT introduce new CSS files (use Tailwind utilities; `index.css` and `mobile-scaling.css` exist for global overrides only)

---

## Known Codebase Issues / Tech Debt

1. **`AuthContext` uses `any` types** for `user` and `profile` — when modifying auth code, do not spread the `any` further; type what you can
2. **`signIn` role race condition**: After `signInWithPassword`, `fetchProfile` is called but `profile` state is stale when immediately reading `profile?.user_type`; role is derived from the returned data, not state
3. **No route-level auth guards**: Pages self-redirect; a centralized `ProtectedRoute` component would be cleaner but doesn't exist yet
4. **Admin sidebar is desktop-only**: The `aside` in `AdminDashboard.tsx` is `hidden lg:flex` with no mobile alternative
5. **`services` field on `Agent`** is `string[]` (array of service IDs), but `agent.services?.length` is used as a service count — accurate but indirect

---

## Adding New Features — Checklist

Before writing any new page or component:

- [ ] Check `types.ts` for existing interfaces — extend, don't duplicate
- [ ] Check `supabaseService.ts` for existing data-fetching functions — reuse, don't re-query
- [ ] Respect the 3-role model — test behavior for CUSTOMER, AGENT, and ADMIN
- [ ] Add both light and dark mode classes
- [ ] Use `useSnackbar()` for all user feedback (not `alert()`)
- [ ] Use `<LoadingState />` for async loading states
- [ ] Use icons from `lucide-react` only
- [ ] Wrap scroll-reveal animations in `<Reveal>` from `components/motion/Reveal.tsx`
- [ ] No new npm packages without explicit approval — check if Framer Motion, Lucide, or native APIs can do it first

