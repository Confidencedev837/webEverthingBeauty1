import { Service, Agent } from '../types';

/**
 * Beauty Domain Ontology & Semantic Synonyms Clusters
 * Maps concepts, sub-services, colloquial terms, and Nigerian beauty jargon
 * to their respective beauty categories and associated terms.
 */
export const BEAUTY_DOMAINS: Record<
  string,
  {
    category: string;
    keywords: string[];
    suggestions: string[];
  }
> = {
  hair: {
    category: 'Hair Styling',
    keywords: [
      'hair', 'braid', 'braids', 'braiding', 'knotless', 'box braids', 'feed-in', 'feedin',
      'cornrow', 'cornrows', 'ghana weaving', 'weaving', 'weave', 'wig', 'wigs', 'frontal',
      'closure', 'lace', 'locs', 'dreadlocks', 'dreads', 'twists', 'twist', 'passion twist',
      'senegalese', 'marley', 'silk press', 'silkpress', 'relaxer', 'wash', 'blowdry',
      'ponytail', 'boho', 'natural hair', 'revamp', 'sew-in', 'closure sew-in', 'frontal install',
      'hair treatment', 'conditioning', 'cuticle', 'crochet', 'faux locs', 'soft locs',
      'human hair', 'braided', 'hairstyling', 'stylist', 'hairdo'
    ],
    suggestions: ['Knotless Braids', 'Frontal Wig Install', 'Box Braids', 'Ghana Weaving', 'Dreadlocks Retwist']
  },
  makeup: {
    category: 'Makeup & Glam',
    keywords: [
      'makeup', 'makup', 'make-up', 'glam', 'glamm', 'bridal', 'wedding', 'owambe', 'soft glam',
      'studio glam', 'full glam', 'editorial', 'lashes', 'lash', 'eyelashes', 'lash extensions',
      'hybrid lashes', 'volume lashes', 'classic lashes', 'brows', 'eyebrow', 'eyebrows',
      'microblading', 'tinting', 'brow tint', 'lamination', 'geele', 'gele', 'contour',
      'lip gloss', 'eyeshadow', 'foundation', 'photoshoot', 'traditional wedding', 'nude glam'
    ],
    suggestions: ['Bridal Glam', 'Soft Glam Session', 'Lash Extensions', 'Owambe Makeup', 'Brow Microblading']
  },
  nails: {
    category: 'Nails & Pedicure',
    keywords: [
      'nail', 'nails', 'acrylic', 'acrylics', 'gel', 'gel polish', 'pedicure', 'pedicur', 'pedi',
      'manicure', 'manicur', 'mani', 'french tips', 'french tip', 'nail art', 'press on', 'press-on',
      'polygel', 'biab', 'feet', 'toes', 'foot spa', 'cuticle', 'nail extensions', 'overlays',
      'ombre nails', 'jelly pedicure', 'russian manicure', 'paraffin'
    ],
    suggestions: ['Acrylic Full Set', 'Luxury Gel Pedicure', 'French Tips', 'Nail Art', 'Builder Gel Overlays']
  },
  barber: {
    category: "Barbering & Men's Grooming",
    keywords: [
      'barber', 'barbr', 'barbing', 'barbering', 'haircut', 'cut', 'fade', 'skin fade', 'low taper',
      'taper', 'taper fade', 'mid fade', 'high fade', 'beard', 'shave', 'trim', 'lineup', 'shapeup',
      'shape-up', 'edge-up', 'buzz cut', 'clipper', 'men grooming', 'hot towel', 'beard sculpt',
      'razor shave', 'waves', 'dye', 'beard dye'
    ],
    suggestions: ['Clean Skin Fade', 'Beard Sculpt & Shave', 'Executive Haircut', 'Low Taper Fade']
  },
  skincare_spa: {
    category: 'Skincare & Spa',
    keywords: [
      'skincare', 'skin', 'facial', 'facials', 'fashal', 'spa', 'massage', 'massages', 'deep tissue',
      'swedish', 'swedish massage', 'wax', 'waxing', 'brazilian wax', 'bikini wax', 'underarm wax',
      'chemical peel', 'peel', 'glow', 'body scrub', 'body polish', 'extraction', 'hydration',
      'dermaplaning', 'aromatherapy', 'hot stone', 'sauna', 'cleanse', 'acne treatment'
    ],
    suggestions: ['Hydrating Deep Facial', 'Deep Tissue Massage', 'Full Body Waxing', 'Chemical Peel & Glow']
  }
};

/**
 * Common Nigerian Cities & Districts for smart location intent detection
 */
export const NIGERIAN_LOCATIONS = [
  'lagos', 'abuja', 'lekki', 'ikeja', 'yaba', 'vi', 'victoria island', 'surulere',
  'ikoyi', 'maryland', 'garki', 'wuse', 'maitama', 'ibadan', 'port harcourt', 'ph',
  'festac', 'ajah', 'gbagada', 'magodo', 'ogba', 'enugu', 'asaba', 'calabar'
];

/**
 * Trending searches for quick one-tap exploration
 */
export const TRENDING_SEARCH_TAGS = [
  'Knotless Braids',
  'Bridal Glam',
  'Clean Skin Fade',
  'Lash Extensions',
  'Acrylic Full Set',
  'Luxury Gel Pedicure',
  'Hydrating Facial',
  'Frontal Wig Install'
];

/**
 * Semantic word mapping for backward compatibility and fast lookup
 */
export const BEAUTY_SEMANTIC_MAP: Record<string, { category: string; suggestions: string[] }> = {};
Object.values(BEAUTY_DOMAINS).forEach((domain) => {
  domain.keywords.forEach((kw) => {
    BEAUTY_SEMANTIC_MAP[kw] = {
      category: domain.category,
      suggestions: domain.suggestions
    };
  });
});

export const CATEGORY_TOP_SUGGESTIONS: Record<string, string[]> = {
  'Hair Styling': ['Knotless Braids', 'Frontal Wig Install', 'Box Braids', 'Cornrows', 'Ghana Weaving'],
  'Makeup & Glam': ['Bridal Glam', 'Soft Glam Session', 'Lash Extensions', 'Owambe Makeup'],
  'Nails & Pedicure': ['Acrylic Full Set', 'Luxury Gel Pedicure', 'French Tips', 'Nail Art'],
  "Barbering & Men's Grooming": ['Clean Skin Fade', 'Beard Sculpt & Shave', 'Executive Haircut'],
  'Skincare & Spa': ['Hydrating Deep Facial', 'Deep Tissue Massage', 'Full Body Waxing']
};

/**
 * Light stemming helper to match inflections (braiding -> braid, fades -> fade, etc.)
 */
export function normalizeStem(word: string): string {
  const w = word.toLowerCase().trim();
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && w.length > 3) return w.slice(0, -1);
  return w;
}

/**
 * Levenshtein distance for typo tolerance (e.g. "brad" -> "braid", "makup" -> "makeup")
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const matrix: number[][] = [];
  for (let i = 0; i <= m; i++) matrix[i] = [i];
  for (let j = 0; j <= n; j++) matrix[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[m][n];
}

export function isFuzzyMatch(word: string, target: string, maxDist: number = 2): boolean {
  if (word.length <= 3) return word === target;
  if (Math.abs(word.length - target.length) > maxDist) return false;
  return levenshteinDistance(word, target) <= maxDist;
}

/**
 * Natural Language Search Intent Parsed Object
 */
export interface SearchIntent {
  rawQuery: string;
  cleanedTerms: string[];
  detectedLocation: string | null;
  detectedMaxPrice: number | null;
  isLuxuryIntent: boolean;
  matchedDomains: string[];
}

/**
 * Parse human queries into intent:
 * e.g. "cheap braids in lagos" ->
 * - cleanedTerms: ["braids"]
 * - detectedLocation: "lagos"
 * - detectedMaxPrice: 25000
 * - matchedDomains: ["hair"]
 */
export function parseSearchIntent(rawQuery: string): SearchIntent {
  const query = rawQuery.trim().toLowerCase();
  const rawTokens = query.split(/\s+/).filter(Boolean);

  let detectedLocation: string | null = null;
  let detectedMaxPrice: number | null = null;
  let isLuxuryIntent = false;
  const remainingTokens: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];

    // Check location
    if (NIGERIAN_LOCATIONS.includes(token)) {
      detectedLocation = token;
      continue;
    }

    // Check price intent
    if (token === 'cheap' || token === 'affordable' || token === 'budget') {
      detectedMaxPrice = 25000;
      continue;
    }
    if (token === 'luxury' || token === 'premium' || token === 'vip') {
      isLuxuryIntent = true;
      continue;
    }
    if (token === 'under' && i + 1 < rawTokens.length) {
      const next = rawTokens[i + 1].replace(/[,k]/g, (match) => (match === 'k' ? '000' : ''));
      const parsedNum = parseInt(next, 10);
      if (!isNaN(parsedNum)) {
        detectedMaxPrice = parsedNum;
        i++; // skip next
        continue;
      }
    }

    // Common stop words
    if (['in', 'at', 'near', 'for', 'with', 'and', 'the', 'a', 'to'].includes(token)) {
      continue;
    }

    remainingTokens.push(token);
  }

  // Detect which beauty domains are referenced
  const matchedDomains: string[] = [];
  const searchCorpus = remainingTokens.map(normalizeStem).join(' ');

  for (const [domainKey, domain] of Object.entries(BEAUTY_DOMAINS)) {
    const hasKeyword = domain.keywords.some((kw) => {
      const stemKw = normalizeStem(kw);
      return (
        searchCorpus.includes(stemKw) ||
        remainingTokens.some((t) => t === kw || isFuzzyMatch(t, kw, 1))
      );
    });
    if (hasKeyword) {
      matchedDomains.push(domainKey);
    }
  }

  return {
    rawQuery,
    cleanedTerms: remainingTokens.length > 0 ? remainingTokens : rawTokens,
    detectedLocation,
    detectedMaxPrice,
    isLuxuryIntent,
    matchedDomains
  };
}

export interface IntelligentSearchResult<T> {
  matches: T[];
  isFallback: boolean;
  detectedCategory: string | null;
  suggestedQueries: string[];
  message: string | null;
  intent?: SearchIntent;
}

/**
 * Ultra-Intelligent Service Search Engine
 */
export function searchServicesIntelligently(
  services: Service[],
  rawQuery: string,
  priceRange: number = Infinity
): IntelligentSearchResult<Service> {
  const query = rawQuery.trim();
  const safeServices = services || [];

  if (!query) {
    const valid = safeServices.filter((s) => (s?.price ?? 0) <= priceRange);
    return {
      matches: valid,
      isFallback: false,
      detectedCategory: null,
      suggestedQueries: [],
      message: null
    };
  }

  const intent = parseSearchIntent(query);
  const effectiveMaxPrice = intent.detectedMaxPrice
    ? Math.min(priceRange, intent.detectedMaxPrice)
    : priceRange;

  const tokens = intent.cleanedTerms;
  const stemmedTokens = tokens.map(normalizeStem);

  // 1. Multi-tier Scoring
  const scoredMatches = safeServices
    .map((service) => {
      if (!service) return { service, score: 0 };

      let score = 0;
      const sName = (service.name || '').toLowerCase();
      const sCat = (service.category || '').toLowerCase();
      const sDesc = (service.description || '').toLowerCase();
      const sAgent = (service.agentName || '').toLowerCase();
      const sLocation = (service.agentLocation || '').toLowerCase();

      const combinedText = `${sName} ${sCat} ${sDesc} ${sAgent}`;

      // A. Exact Full Phrase Bonus
      const lowQuery = query.toLowerCase();
      if (sName.includes(lowQuery)) score += 80;
      else if (sCat.includes(lowQuery)) score += 50;

      // B. Token-by-Token Match
      let matchedTokenCount = 0;
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const stem = stemmedTokens[i];

        let tokenHit = false;

        // Title matches (highest weight)
        if (sName.includes(token)) {
          score += 35;
          tokenHit = true;
        } else if (sName.includes(stem)) {
          score += 25;
          tokenHit = true;
        }

        // Category matches
        if (sCat.includes(token)) {
          score += 25;
          tokenHit = true;
        } else if (sCat.includes(stem)) {
          score += 18;
          tokenHit = true;
        }

        // Specialist Name matches
        if (sAgent.includes(token)) {
          score += 20;
          tokenHit = true;
        }

        // Description matches
        if (sDesc.includes(token) || sDesc.includes(stem)) {
          score += 10;
          tokenHit = true;
        }

        if (tokenHit) matchedTokenCount++;
      }

      // Multi-word compound match multiplier
      if (tokens.length > 1 && matchedTokenCount === tokens.length) {
        score += 40; // All words matched!
      }

      // C. Domain & Synonyms Ontology Boost
      for (const domainKey of intent.matchedDomains) {
        const domain = BEAUTY_DOMAINS[domainKey];
        if (domain) {
          if (sCat.includes(domain.category.toLowerCase())) {
            score += 30;
          }
          // Check if service keywords align with domain keywords
          for (const kw of domain.keywords) {
            if (sName.includes(kw)) {
              score += 15;
              break;
            }
          }
        }
      }

      // D. Fuzzy Typos Matching (if no exact hit yet)
      if (score === 0) {
        const words = `${sName} ${sCat}`.split(/\s+/);
        for (const token of tokens) {
          for (const word of words) {
            if (isFuzzyMatch(token, word, 1)) {
              score += 18;
              break;
            } else if (isFuzzyMatch(token, word, 2)) {
              score += 10;
              break;
            }
          }
        }
      }

      // E. Location Intent Match
      if (intent.detectedLocation) {
        if (sLocation.includes(intent.detectedLocation)) {
          score += 30;
        }
      }

      // F. Quality & Verification Multipliers
      if (score > 0) {
        const rating = service.rating ?? 0;
        const reviews = service.reviewCount ?? 0;
        score += rating * 3;
        score += Math.min(reviews, 15);

        if (intent.isLuxuryIntent && rating >= 4.8) {
          score += 25;
        }
      }

      return { service, score };
    })
    .filter((item) => item.score > 0 && (item.service.price ?? 0) <= effectiveMaxPrice)
    .sort((a, b) => b.score - a.score || (b.service.rating ?? 0) - (a.service.rating ?? 0))
    .map((item) => item.service);

  if (scoredMatches.length > 0) {
    return {
      matches: scoredMatches,
      isFallback: false,
      detectedCategory: intent.matchedDomains[0]
        ? BEAUTY_DOMAINS[intent.matchedDomains[0]]?.category
        : null,
      suggestedQueries: [],
      message: null,
      intent
    };
  }

  // 2. ZERO EXACT MATCHES - SMART RESILIENT FALLBACK
  let detectedCategory: string | null = null;
  let suggestedQueries: string[] = [];

  if (intent.matchedDomains.length > 0) {
    const primaryDomain = BEAUTY_DOMAINS[intent.matchedDomains[0]];
    detectedCategory = primaryDomain.category;
    suggestedQueries = primaryDomain.suggestions;
  } else {
    // Try fuzzy match against all keywords
    for (const domain of Object.values(BEAUTY_DOMAINS)) {
      for (const kw of domain.keywords) {
        for (const token of tokens) {
          if (isFuzzyMatch(token, kw, 2)) {
            detectedCategory = domain.category;
            suggestedQueries = domain.suggestions;
            break;
          }
        }
        if (detectedCategory) break;
      }
      if (detectedCategory) break;
    }
  }

  if (!detectedCategory) {
    detectedCategory = 'Hair Styling';
    suggestedQueries = CATEGORY_TOP_SUGGESTIONS['Hair Styling'] || [];
  }

  const categoryFallback = safeServices
    .filter(
      (s) =>
        (s.category || '').toLowerCase() === detectedCategory!.toLowerCase() &&
        (s.price ?? 0) <= priceRange
    )
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 6);

  const fallbackItems =
    categoryFallback.length > 0
      ? categoryFallback
      : safeServices
          .filter((s) => (s.price ?? 0) <= priceRange)
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, 6);

  return {
    matches: fallbackItems,
    isFallback: true,
    detectedCategory,
    suggestedQueries: (suggestedQueries || []).slice(0, 4),
    message: `We could not find an exact match for "${query}", but here are top-rated services in ${detectedCategory}:`,
    intent
  };
}

/**
 * Intelligent Agent Search Engine
 */
export function searchAgentsIntelligently(
  agents: Agent[],
  rawQuery: string
): IntelligentSearchResult<Agent> {
  const query = rawQuery.trim();
  const safeAgents = agents || [];

  if (!query) {
    return {
      matches: safeAgents,
      isFallback: false,
      detectedCategory: null,
      suggestedQueries: [],
      message: null
    };
  }

  const intent = parseSearchIntent(query);
  const tokens = intent.cleanedTerms;
  const stemmedTokens = tokens.map(normalizeStem);

  const scoredMatches = safeAgents
    .map((agent) => {
      if (!agent) return { agent, score: 0 };

      let score = 0;
      const aName = (agent.name || '').toLowerCase();
      const aSpec = (agent.specialty || '').toLowerCase();
      const aBio = (agent.bio || '').toLowerCase();
      const aLoc = (agent.location || '').toLowerCase();

      // Full query match
      if (aName.includes(query.toLowerCase())) score += 60;
      if (aSpec.includes(query.toLowerCase())) score += 50;

      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const stem = stemmedTokens[i];

        if (aName.includes(token)) score += 30;
        if (aSpec.includes(token)) score += 25;
        if (aSpec.includes(stem)) score += 18;
        if (aLoc.includes(token)) score += 20;
        if (aBio.includes(token)) score += 10;
      }

      // Domain intent mapping
      for (const domainKey of intent.matchedDomains) {
        const domain = BEAUTY_DOMAINS[domainKey];
        if (domain && aSpec.includes(domain.category.toLowerCase())) {
          score += 25;
        }
      }

      // Location match
      if (intent.detectedLocation && aLoc.includes(intent.detectedLocation)) {
        score += 35;
      }

      // Fuzzy matching
      if (score === 0) {
        const words = `${aName} ${aSpec} ${aLoc}`.split(/\s+/);
        for (const token of tokens) {
          for (const word of words) {
            if (isFuzzyMatch(token, word, 1)) {
              score += 15;
              break;
            }
          }
        }
      }

      if (score > 0) {
        score += (agent.rating ?? 0) * 3;
        score += Math.min(agent.reviews ?? 0, 10);
      }

      return { agent, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.agent.rating ?? 0) - (a.agent.rating ?? 0))
    .map((item) => item.agent);

  if (scoredMatches.length > 0) {
    return {
      matches: scoredMatches,
      isFallback: false,
      detectedCategory: intent.matchedDomains[0]
        ? BEAUTY_DOMAINS[intent.matchedDomains[0]]?.category
        : null,
      suggestedQueries: [],
      message: null,
      intent
    };
  }

  // Fallback
  let detectedCategory: string | null = null;
  let suggestedQueries: string[] = [];

  if (intent.matchedDomains.length > 0) {
    const domain = BEAUTY_DOMAINS[intent.matchedDomains[0]];
    detectedCategory = domain.category;
    suggestedQueries = domain.suggestions;
  } else {
    detectedCategory = 'Hair Styling';
    suggestedQueries = ['Knotless Braids Specialist', 'Bridal Makeup Artist', 'Executive Barber'];
  }

  const categoryAgents = safeAgents
    .filter((a) => (a.specialty || '').toLowerCase().includes(detectedCategory!.toLowerCase()))
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews || 0) - (a.reviews || 0))
    .slice(0, 6);

  const fallbackAgents =
    categoryAgents.length > 0
      ? categoryAgents
      : safeAgents.slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6);

  return {
    matches: fallbackAgents,
    isFallback: true,
    detectedCategory,
    suggestedQueries: (suggestedQueries || []).slice(0, 4),
    message: `We could not find specialists matching "${query}", but here are top-rated artists in ${detectedCategory}:`,
    intent
  };
}

/**
 * Unified Search for Autocomplete & Live Command-Palette Dropdown
 * Returns real-time top service matches, top specialist matches, and instant suggestions.
 */
export interface UnifiedSearchResults {
  services: Service[];
  agents: Agent[];
  suggestions: string[];
  intent: SearchIntent;
}

export function searchUnifiedIntelligently(
  services: Service[],
  agents: Agent[],
  rawQuery: string
): UnifiedSearchResults {
  const serviceResult = searchServicesIntelligently(services, rawQuery);
  const agentResult = searchAgentsIntelligently(agents, rawQuery);
  const intent = parseSearchIntent(rawQuery);

  // Generate dynamic live suggestions (similar to Google / Sephora autocomplete)
  const query = rawQuery.toLowerCase().trim();
  const matchedSuggestions = new Set<string>();

  if (query.length > 0) {
    // 1. Check trending tags
    TRENDING_SEARCH_TAGS.forEach((tag) => {
      if (tag.toLowerCase().includes(query)) matchedSuggestions.add(tag);
    });

    // 2. Check domain suggestions
    Object.values(BEAUTY_DOMAINS).forEach((domain) => {
      domain.suggestions.forEach((sug) => {
        if (sug.toLowerCase().includes(query)) matchedSuggestions.add(sug);
      });
      domain.keywords.forEach((kw) => {
        if (kw.startsWith(query) && kw !== query) {
          // Capitalize word
          matchedSuggestions.add(kw.charAt(0).toUpperCase() + kw.slice(1));
        }
      });
    });

    // 3. Check service titles
    (services || []).forEach((s) => {
      if (s?.name && s.name.toLowerCase().includes(query)) {
        matchedSuggestions.add(s.name);
      }
    });
  }

  return {
    services: serviceResult.matches.slice(0, 4),
    agents: agentResult.matches.slice(0, 3),
    suggestions: Array.from(matchedSuggestions).slice(0, 5),
    intent
  };
}

/**
 * LocalStorage Recent Searches Management
 */
const RECENT_SEARCHES_KEY = 'everything_beauty_recent_searches';

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(term: string): void {
  const trimmed = term.trim();
  if (!trimmed || trimmed.length < 2) return;
  try {
    const existing = getRecentSearches().filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...existing].slice(0, 6);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}
