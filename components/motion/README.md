# Reusable Scroll-Reveal Animation System

A lightweight, 60fps hardware-accelerated scroll-reveal animation system built for **Next.js (App Router) + TypeScript + Tailwind CSS** using **Framer Motion**.

---

## Architecture & How It Works

1. **`<Reveal>`**: An isolated wrapper for standalone elements. Animates when entering the viewport.
2. **`<RevealGroup>`**: An orchestrating parent container that handles sequential top-to-bottom reveals via Framer Motion's `staggerChildren`.
3. **`<RevealItem>`**: A child placed inside `<RevealGroup>`. Picks up the parent's staggered animation trigger.

### Key Performance & Quality Features
- **GPU Accelerated**: Only animates `opacity` and `transform: translateY` to prevent layout reflows and jank.
- **`prefers-reduced-motion` Compliant**: Automatically detects user accessibility settings via Framer Motion's `useReducedMotion()`. If reduced motion is requested, content renders immediately at full opacity without translation or staggered waiting.
- **Triggers Once**: Uses `viewport: { once: true, amount: 0.2 }` so elements animate cleanly upon scrolling into view and stay stable when scrolling back up.
- **Polymorphic `as` Prop**: Render any semantic HTML tag (`h1`, `h2`, `p`, `span`, `section`, `li`, `article`) without wrapper div bloat.

---

## Usage Guide

### 1. Sequential Section Reveal (Eyebrow -> Heading -> Paragraph -> Buttons)
Wrap the section in `<RevealGroup>` and each child in `<RevealItem>`:

```tsx
import { RevealGroup, RevealItem } from '@/components/motion';

export default function HeroSection() {
  return (
    <RevealGroup stagger={0.1} className="max-w-4xl mx-auto space-y-6">
      {/* 1. Eyebrow badge */}
      <RevealItem as="span" className="inline-block text-xs uppercase tracking-wider font-accent text-purple-600">
        Next-Generation Platform
      </RevealItem>

      {/* 2. Main Heading */}
      <RevealItem as="h1" className="text-5xl font-display font-bold text-gray-900">
        Crafting seamless digital experiences.
      </RevealItem>

      {/* 3. Subtitle / Paragraph */}
      <RevealItem as="p" className="text-lg font-body text-gray-600">
        Everything you need to deliver high-performance applications with zero visual stutter.
      </RevealItem>

      {/* 4. Action Buttons */}
      <RevealItem className="flex items-center gap-4 pt-4">
        <button className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold">
          Get Started
        </button>
      </RevealItem>
    </RevealGroup>
  );
}
```

### 2. Grid or List Item Stagger (Cards, Features)
For card grids, set `stagger={0.08}` for rapid cascade:

```tsx
<RevealGroup stagger={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {cards.map((card) => (
    <RevealItem key={card.id} as="article" className="p-6 rounded-2xl bg-white shadow-md border">
      <h3 className="font-display font-bold text-lg">{card.title}</h3>
      <p className="font-body text-sm text-gray-600">{card.desc}</p>
    </RevealItem>
  ))}
</RevealGroup>
```

### 3. Standalone Reveal (Single Banner or Floating Element)
```tsx
import { Reveal } from '@/components/motion';

<Reveal delay={0.2} y={20} duration={0.6}>
  <div className="p-8 rounded-3xl bg-purple-900 text-white">
    Call To Action Banner
  </div>
</Reveal>
```

---

## Where to Tweak Timings

All defaults are centralized in [`components/motion/types.ts`](./types.ts):

| Parameter | Location | Default | Effect |
| :--- | :--- | :--- | :--- |
| **Sibling Stagger** | `DEFAULT_STAGGER` in `types.ts` or `<RevealGroup stagger={0.1}>` | `0.1s` | Gap between sequential text elements |
| **Grid Stagger** | `<RevealGroup stagger={0.08}>` | `0.08s` | Gap between cards in a multi-column row |
| **Animation Duration** | `DEFAULT_DURATION` in `types.ts` or `duration={0.6}` | `0.6s` | Time for single element to reach natural position |
| **Vertical Distance** | `DEFAULT_Y_OFFSET` in `types.ts` or `y={24}` | `24px` | Starting translateY distance below natural slot |
| **Easing Curve** | `MOTION_EASE` in `types.ts` | `[0.22, 1, 0.36, 1]` | Luxury exponential ease-out curve |
| **Intersection Trigger** | `amount={0.2}` | `0.2` (20%) | Percentage of element visible before animating |

