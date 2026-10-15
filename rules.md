# Everything Beauty Design & Development Rules

## 1. ICON RULES (STRICT & ABSOLUTE)
- **STRICTLY FORBIDDEN**: Never ever use the `Sparkles` icon (`<Sparkles />` or any AI-style 4-pointed sparkle star icon) anywhere in the application.
- Replace any occurrence with authentic, high-end domain-specific icons from `lucide-react`:
  - For prestige/elite: use `Award`, `Crown`, `ShieldCheck`, or `Gem`.
  - For action/new items: use `Plus`, `ArrowRight`, `Zap`, or `Scissors`.
  - For quality/verification: use `ShieldCheck`, `CheckCircle`, or `Star`.
- No novelty or AI-generated magic wand/sparkle motifs. Everything Beauty is an elite human-to-human marketplace.

## 2. SHAPE & PILL RULES (SQUIRCLES ONLY - WITH AVATAR EXCEPTION)
- **NO PILLS**: Never use `rounded-full` pills for badges, tags, chips, status indicators, or action buttons.
- **SQUIRCLES ONLY**: Always use glowing squircles (`rounded-xl`, `rounded-2xl`, or `rounded-3xl` with subtle luminous halos and hairlines):
  - Badges & chips: `rounded-xl` or `rounded-2xl` with subtle border and aura glow (`shadow-[0_0_12px_rgba(108,53,166,0.18)]`).
  - Cards & containers: `rounded-2xl`, `rounded-3xl`, or `rounded-[2.5rem]`.
  - Follower / following metrics: squircle container with animated counter transitions when a count changes.
- **EXPLICIT CIRCULAR EXCEPTIONS** (only these):
  - The agent profile picture on the agent profile screen is circular (`rounded-full`).
  - Spinning loader indicators (`animate-spin`).

## 2b. AGENT PROFILE STRUCTURE (4 TABS)
- The bio stays where it is; the tabs component sits directly under it.
- Tabs: `Services`, `Followers`, `Following`, `Liked`, each with its own icon, and an animated slider (Framer Motion `layoutId`) that slides to the clicked tab.
  1. `Services`: Instagram-style 3-column grid of square tiles (`aspect-square`), price on each tile, video indicator for videos.
  2. `Followers` / `Following`: Twitter/X-style user rows (avatar, name, handle, bio, follow button).
  3. `Liked`: grid of previously liked services with a filled love icon on the top right.
- Bio text must have strong contrast in both light and dark themes.

## 3. DEPTH & TACTILE SHADOW RULES (NON-FLAT)
- **NO FLAT SURFACES**: Every surface must have depth, visual weight, and deliberate elevation.
- Use multi-stop shadows (`shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`) and tasteful inner borders (`border-[#E9ECEF] dark:border-[#2D2D2D]`).
- Interactive elements must glow softly on active/hover states (`shadow-[0_0_20px_rgba(108,53,166,0.25)]`).

## 4. EMOJI RULES (ZERO TOLERANCE)
- **NO EMOJIS ANYWHERE**: No emojis in UI copy, labels, headings, toasts, tooltips, placeholders, or code comments.
- Always use vector icons from `lucide-react`.

## 5. BRAND PALETTE & TYPOGRAPHY
- Primary brand violet: `#6C35A6` (Royal Violet).
- Deep plum / dark canvas: `#0D0D0D` / `#1A1A1A` / `#32104D`.
- Soft accent lavender: `#A78BCE`.
- High-contrast, editorial typography with serif headings and clean sans-serif body.
