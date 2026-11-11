# Everything Beauty — Project-Specific Agent Rules

> Stack: React 19 + TypeScript + Vite · Tailwind CSS (CDN, class-based dark mode) · Framer Motion · React Router v7 (HashRouter) · Supabase (auth + database) · Lucide React icons

---

## 1. Project Overview

**Everything Beauty** is a Nigerian on-demand beauty marketplace. It connects clients with verified beauty specialists (agents) for doorstep services. The platform has three distinct user roles:

| Role | Access |
| :--- | :--- |
| `CUSTOMER` | Browse services, book agents, manage bookings, leave reviews |
| `AGENT` | Manage profile, services, gallery, availability, bookings, bank details |
| `ADMIN` | Verify/reject agent applications, view platform analytics |

Currency: Nigerian Naira (₦). Target market: Nigeria.

---

## 2. Architecture & File Structure

```
/
├── App.tsx                   # Root: HashRouter, AuthProvider, SnackbarProvider, theme
├── index.tsx                 # Entry point
├── types.ts                  # All shared TypeScript interfaces and enums (source of truth)
├── constants.ts              # App-wide constants
│
├── pages/                    # Route-level components (one per route)
│   ├── Home.tsx              # Dispatcher — renders GuestHome, CustomerHome, or AgentHome by role
│   ├── GuestHome.tsx         # Landing page for unauthenticated visitors
│   ├── CustomerHome.tsx      # Personalised home for logged-in customers
│   ├── AgentHome.tsx         # Personalised home for logged-in agents
│   ├── Auth.tsx
│   ├── Services.tsx
│   ├── Agents.tsx            # Agent directory with intelligent search + pagination
│   ├── AgentProfile.tsx      # Individual agent public profile
│   ├── ServiceDetail.tsx
│   ├── CustomerDashboard.tsx
│   ├── AgentDashboard.tsx    # Agent: bookings, services, gallery, availability, bank
│   ├── AdminDashboard.tsx    # Admin: verification queue, user directory, analytics
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── Legal.tsx
│   ├── FAQ.tsx
│   └── ResetPassword.tsx
│
├── components/               # Shared reusable components
│   ├── Navbar.tsx
│   ├── BookingModal.tsx       # Booking flow modal
│   ├── BookingChatDrawer.tsx  # In-booking messaging
│   ├── IntelligentSearchBar.tsx
│   ├── ServiceCard.tsx
│   ├── LoadingState.tsx
│   ├── Snackbar.tsx           # Toast notification system (via SnackbarProvider)
│   ├── ErrorBoundary.tsx
│   ├── SmoothScroll.tsx       # Lenis smooth scroll wrapper
│   ├── motion/
│   │   └── Reveal.tsx         # Scroll-reveal animation wrapper (uses framer-motion)
│   └── agent/                 # Agent-specific sub-components
│
├── context/
│   └── AuthContext.tsx        # Auth state: user, currentUser, role, profile, signIn, signUp, signOut, refreshProfile
│
├── services/
│   ├── supabaseService.ts     # All Supabase DB calls (1700+ lines); has in-memory cache layer
│   ├── intelligentSearch.ts   # Client-side fuzzy/semantic agent search
│   └── whatsappService.ts     # WhatsApp booking notifications
│
├── lib/
│   └── supabase.ts            # Supabase client initialization
│
└── hooks/                     # Custom React hooks
```

---

## 3. Routing

Uses **`HashRouter`** (not `BrowserRouter`). All routes are hash-prefixed (`/#/`).

| Path | Component | Auth Required |
| :--- | :--- | :--- |
| `/` | Home | No |
| `/auth` | Auth | No |
| `/services` | Services | No |
| `/agents` | Agents | No |
| `/services/:id` | ServiceDetail | No |
| `/agent/:id` | AgentProfile | No |
| `/agents/:id` | AgentProfile | No |
| `/customer/dashboard` | CustomerDashboard | CUSTOMER |
| `/agent/dashboard` | AgentDashboard | AGENT |
| `/admin/dashboard` | AdminDashboard | ADMIN |
| `/reset-password` | ResetPassword | No |

---

## 4. Auth System

- **Provider**: `AuthContext` via Supabase Auth (`supabase.auth`)
- **Hook**: `useAuth()` — always call within `AuthProvider` scope
- **Session persistence**: Supabase handles token refresh; `onAuthStateChange` keeps state in sync
- **Role resolution**: Read `profiles.user_type` from Supabase → map to `UserRole` enum
- **`currentUser`**: A derived `User` object built from the raw Supabase `user` + `profile` row

```typescript
// UserRole enum values
UserRole.CUSTOMER | UserRole.AGENT | UserRole.ADMIN

// Key auth context fields
{ user, currentUser, role, profile, loading, signIn, signUp, signOut, refreshProfile }
```

**Known issue**: After `signIn`, `profile` state may not be populated yet when reading `profile?.user_type` for role resolution (async race). The role is re-derived via `fetchProfile` after sign-in.

---

## 5. Data Types (source of truth: `types.ts`)

Key interfaces to know:

```typescript
interface Agent {
  id: string; name: string; specialty: string; rating: number;
  reviews: number; experience: number; image: string; banner: string;
  bio: string; location?: string; phone?: string; serviceType?: string;
  services: string[]; gallery: Array<{ type: 'image'|'video'; url: string; thumbnail?: string }>;
  verificationStatus: VerificationStatus; completedBookings?: number;
}

interface Service {
  id: string; name: string; category: string; price: number; rating: number;
  reviewCount: number; description: string; image: string; durationMins?: number;
  features?: string[]; agentId: string; agentName: string; agentImage: string;
  agentSpecialty: string; agentLocation?: string; gallery?: ServiceGalleryItem[];
}

interface Booking {
  id: string; serviceId: string; serviceName: string; customerId: string;
  customerName: string; agentId: string; agentName: string;
  date: string; time: string; price: number; status: BookingStatus;
  address: string; notes?: string;
}

enum VerificationStatus { UNVERIFIED | PENDING | VERIFIED | REJECTED }
enum BookingStatus { PENDING | CONFIRMED | COMPLETED | CANCELLED }
enum UserRole { CUSTOMER | AGENT | ADMIN }
```

---

## 6. Design System & Styling

**Approach**: Tailwind CSS (loaded via CDN, configured inline in `index.html`). `darkMode: 'class'` — the `dark` class is toggled on `<html>` by `App.tsx`.

### Brand Color Tokens (always use these, never raw hex in new code)

| Token | Value | Usage |
| :--- | :--- | :--- |
| `brand-primary` | `#32104D` | Deep Plum — headings, logo |
| `brand-interactive` | `#6C35A6` | Royal Violet — CTAs, links, active states |
| `brand-accent` | `#A78BCE` | Soft Lavender — dark mode `text-brand-interactive` |
| `brand-surface` | `#F3EDF8` | Lavender Mist — page backgrounds, cards |
| `brand-background` | `#FDFBFF` | Pearl White — elevated cards, inputs |

> **Dark mode note**: `text-brand-interactive` auto-switches to `brand-accent` (#A78BCE) on dark surfaces via a global CSS override in `index.html`. Do NOT apply separate dark variants for brand text color.

### Typography

- **Font**: `Plus Jakarta Sans` — used for both `font-sans` and `font-serif` (Tailwind overrides)
- **Headings**: `font-serif font-bold` or `font-black`
- **Labels/badges**: `font-black text-[10px] tracking-[0.2em] uppercase`
- **Body**: `font-medium` or `font-bold`, never `font-light` for primary content

### Spacing & Shape

- Rounded corners trend large: `rounded-2xl`, `rounded-3xl`, `rounded-[2.5rem]`, `rounded-[4rem]`
- Shadows: `shadow-[0_4px_20px_rgba(0,0,0,0.04)]`, brand glow: `shadow-brand-interactive/20`
- Layouts: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` for page wrappers

### Dark Mode Class Pattern

```tsx
// Always pair light + dark variants like this:
className="bg-brand-background dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white border-[#E9ECEF] dark:border-[#262626]"

// Common dark background values:
// Page bg:   dark:bg-[#0D0D0D]
// Card bg:   dark:bg-[#161616]  or  dark:bg-[#1A1A1A]
// Elevated:  dark:bg-[#202020]
// Border:    dark:border-[#262626]  or  dark:border-[#2D2D2D]
// Muted text: dark:text-[#B0B0B0]  or  dark:text-[#A0A0A0]
```

---

## 7. Animation Conventions

- **Library**: Framer Motion (`framer-motion@^12`)
- **Scroll reveal**: Use the `<Reveal>` component from `components/motion/Reveal.tsx` for new scroll-triggered animations
- **Inline animations**: `initial / animate / transition` on `motion.div` are acceptable for hero/page-load animations
- **Standard easing**: `[0.25, 0.46, 0.45, 0.94]` (defined as `MOTION_EASE` in `components/motion/types.ts`)
- **Stagger pattern**: `transition={{ delay: idx * 0.04 }}` for list items
- **Always** pass `viewport={{ once: true }}` on `whileInView` to prevent re-triggering
- **Respect reduced motion**: The `<Reveal>` component already handles `useReducedMotion()`; for inline animations, check if needed

---

## 8. Supabase & Data Layer

- **Client**: `lib/supabase.ts` — single instance, imported everywhere
- **All DB calls**: Go through `services/supabaseService.ts` — do NOT write raw Supabase queries inline in components
- **Caching**: `supabaseService.ts` has an in-memory cache with TTL — be aware when writing new service functions
- **Storage**: Agent images, banners, and gallery items use Supabase Storage buckets
- **Return pattern**: Service functions return `{ data: T, error: string | null }` — always check `.error` before using `.data`

### Key Supabase Tables

| Table | Purpose |
| :--- | :--- |
| `profiles` | User profiles (extends auth.users) — has `user_type`, `verification_status` |
| `agents` | Agent professional profiles |
| `services` | Services offered by agents |
| `bookings` | Booking records linking customers ↔ agents ↔ services |
| `reviews` | Customer reviews on agents/services |
| `booking_messages` | In-booking chat messages |

---

## 9. Notifications (Snackbar / Toast)

Use the `useSnackbar()` hook from `components/Snackbar.tsx` for all user-facing success/error feedback. Do not use `alert()` or `console.log` for user-visible messaging.

```typescript
const { showSnackbar } = useSnackbar();
showSnackbar('Booking confirmed!', 'success');   // 'success' | 'error' | 'info'
```

---

## 10. Component Patterns

- **Page components**: `React.FC` with no props (data fetched internally via `useEffect`)
- **Shared components**: Accept explicit typed props interfaces
- **Loading states**: Use `<LoadingState message="..." />` for page-level loading
- **Error states**: Show inline error UI with `AlertCircle` from lucide-react; don't throw to ErrorBoundary for recoverable errors
- **Icons**: Always from `lucide-react` — do NOT introduce other icon libraries
- **Image fallback**: For agent avatars, use `getInitialsSvg(agent.name)` from `pages/Agents.tsx` as the `onError` fallback

