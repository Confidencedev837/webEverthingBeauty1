// Production Application Constants

export const APP_CONFIG = {
  name: 'Everything Beauty',
  tagline: 'Professional On-Demand Beauty Services',
  supportEmail: 'Ebeautyuniversal@gmail.com',
  supportPhone: '+23491603331836',
  currency: 'NGN',
  currencySymbol: '₦',
  defaultLocation: 'Lagos, Nigeria'
};

// ========================================================
// 5 CANONICAL SERVICE PILLARS (SINGLE SOURCE OF TRUTH)
// ========================================================
export const CANONICAL_SERVICE_CATEGORIES = [
  'Makeup',
  'Hair Styling & Braids',
  'Nails & Pedicure',
  'Barbing & Haircuts',
  'Wig Installation & Styling'
] as const;

export type CanonicalServiceCategory = typeof CANONICAL_SERVICE_CATEGORIES[number];

/**
 * Normalizes any free-form, legacy, or database category string into one of the 5 canonical pillars.
 * Returns null for unrecognized gibberish (e.g. 'rr', 'mmh') so it never pollutes the UI.
 */
export function canonicalizeCategory(raw: string | null | undefined): CanonicalServiceCategory | null {
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim().toLowerCase();

  // 1. Makeup
  if (s === 'makeup' || s.includes('makeup') || s.includes('make-up') || s.includes('gele') || s.includes('bridal glam')) {
    return 'Makeup';
  }

  // 2. Wig Installation & Styling (checked before generic hair)
  if (s.includes('wig') || s.includes('frontal') || s.includes('closure') || s.includes('revamp')) {
    return 'Wig Installation & Styling';
  }

  // 3. Barbing & Haircuts
  if (s.includes('barb') || s.includes('fade') || s.includes('haircut') || s.includes('groom') || s.includes('shave')) {
    return 'Barbing & Haircuts';
  }

  // 4. Nails & Pedicure
  if (s.includes('nail') || s.includes('pedi') || s.includes('mani') || s.includes('acrylic') || s.includes('gel')) {
    return 'Nails & Pedicure';
  }

  // 5. Hair Styling & Braids
  if (s.includes('braid') || s.includes('hair') || s.includes('locs') || s.includes('twist') || s.includes('cornrow') || s.includes('weaving') || s.includes('natural hair')) {
    return 'Hair Styling & Braids';
  }

  return null;
}
