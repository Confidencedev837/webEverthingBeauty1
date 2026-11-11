import { Plus_Jakarta_Sans, Inter, Space_Grotesk } from 'next/font/google';

/**
 * 1. Bold display font for headings, titles, and high-impact hero statements
 */
export const fontDisplay = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  weight: ['600', '700', '800'],
});

/**
 * 2. Clean, highly readable sans for body paragraphs, descriptions, and UI text
 */
export const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

/**
 * 3. Distinctive accent font for small labels, eyebrow badges, tags, and metrics
 */
export const fontAccent = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-accent',
  weight: ['500', '600', '700'],
});

