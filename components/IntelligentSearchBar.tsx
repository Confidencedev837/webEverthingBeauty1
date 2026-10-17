import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Tag, ArrowRight, User, Star, MapPin, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Service, Agent } from '../types';
import {
  searchUnifiedIntelligently,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  TRENDING_SEARCH_TAGS,
  UnifiedSearchResults
} from '../services/intelligentSearch';

interface IntelligentSearchBarProps {
  value: string;
  onChange: (query: string) => void;
  services?: Service[];
  agents?: Agent[];
  placeholder?: string;
  className?: string;
  onFilterToggle?: () => void;
  showFiltersToggle?: boolean;
}

export const IntelligentSearchBar: React.FC<IntelligentSearchBarProps> = ({
  value,
  onChange,
  services = [],
  agents = [],
  placeholder = 'Search services, specialists, hairstyles, glam, locations...',
  className = '',
  onFilterToggle,
  showFiltersToggle = false
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [unifiedResults, setUnifiedResults] = useState<UnifiedSearchResults | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Compute live unified preview when user types
  useEffect(() => {
    if (value.trim().length > 0) {
      const res = searchUnifiedIntelligently(services, agents, value);
      setUnifiedResults(res);
    } else {
      setUnifiedResults(null);
    }
  }, [value, services, agents]);

  // Click outside listener to dismiss flyout
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectQuery = (query: string) => {
    saveRecentSearch(query);
    setRecentSearches(getRecentSearches());
    onChange(query);
    setIsOpen(false);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      if (value.trim()) {
        saveRecentSearch(value);
        setRecentSearches(getRecentSearches());
      }
      setIsOpen(false);
    }
  };

  const intent = unifiedResults?.intent;
  const hasIntentInsights =
    intent &&
    (intent.detectedLocation || intent.detectedMaxPrice || intent.matchedDomains.length > 0);

  return (
    <div ref={containerRef} className={`relative max-w-2xl mx-auto w-full z-40 ${className}`}>
      {/* Search Input Container */}
      <div className="relative group">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center text-[#6C757D] group-focus-within:text-brand-interactive transition-colors">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          style={{ paddingLeft: '3.75rem', paddingRight: showFiltersToggle ? '6rem' : '3.5rem' }}
          className="w-full app-search-input py-4 sm:py-5 text-sm sm:text-base font-medium bg-white dark:bg-[#161616] border border-[#E2E8F0] dark:border-[#2C2C2C] focus:border-brand-interactive rounded-2xl sm:rounded-3xl outline-none focus:ring-4 focus:ring-brand-interactive/15 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.5),0_2px_8px_rgba(0,0,0,0.3)] focus:shadow-[0_12px_40px_rgba(108,53,166,0.2)] text-[#1A1A1A] dark:text-white placeholder:text-[#8E8E93] dark:placeholder:text-[#7A7A7A]"
        />

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {value && (
            <button
              onClick={() => {
                onChange('');
                setIsOpen(true);
                inputRef.current?.focus();
              }}
              className="p-2 rounded-xl text-[#6C757D] hover:text-[#1A1A1A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {showFiltersToggle && onFilterToggle && (
            <button
              type="button"
              onClick={onFilterToggle}
              className="px-2.5 py-1.5 rounded-xl bg-brand-surface dark:bg-[#222] border border-[#E2E8F0] dark:border-[#333] hover:border-brand-interactive text-xs font-bold text-[#6C757D] hover:text-brand-interactive transition-all cursor-pointer"
            >
              Filters
            </button>
          )}
        </div>
      </div>

      {/* Intelligent Command Dropdown / Autocomplete Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full mt-2.5 bg-white dark:bg-[#161616] rounded-3xl border border-brand-interactive/25 shadow-[0_16px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden z-50 max-h-[75vh] overflow-y-auto"
          >
            {/* Natural Language Intent Badges (if detected) */}
            {hasIntentInsights && (
              <div className="p-3.5 bg-brand-interactive/5 dark:bg-brand-interactive/10 border-b border-brand-interactive/15 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-interactive flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-brand-interactive" />
                  <span>Smart Intent Detected:</span>
                </span>
                {intent.detectedLocation && (
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#202020] text-xs font-bold text-brand-interactive border border-brand-interactive/30 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-brand-interactive" />
                    <span>Location: {intent.detectedLocation.toUpperCase()}</span>
                  </span>
                )}
                {intent.detectedMaxPrice && (
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#202020] text-xs font-bold text-brand-interactive border border-brand-interactive/30">
                    Max ₦{intent.detectedMaxPrice.toLocaleString()}
                  </span>
                )}
                {intent.isLuxuryIntent && (
                  <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#202020] text-xs font-bold text-brand-interactive border border-brand-interactive/30">
                    VIP / Luxury Tier
                  </span>
                )}
              </div>
            )}

            {/* When search has text: Live Autocomplete & Matches Preview */}
            {value.trim().length > 0 && unifiedResults && (
              <div className="p-4 space-y-4">
                {/* Live Suggestions Chips */}
                {unifiedResults.suggestions.length > 0 && (
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#6C757D] dark:text-[#888] block mb-2">
                      Suggested Searches
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {unifiedResults.suggestions.map((sug) => (
                        <button
                          key={sug}
                          onClick={() => handleSelectQuery(sug)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E2E8F0] dark:border-[#2C2C2C] hover:border-brand-interactive hover:text-brand-interactive transition-all cursor-pointer flex items-center space-x-1.5"
                        >
                          <Tag className="w-3 h-3 text-brand-interactive" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}


                {/* Top Specialist Matches Preview */}
                {unifiedResults.agents.length > 0 && (
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#6C757D] dark:text-[#888] block mb-2">
                      Matching Specialists
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {unifiedResults.agents.map((agent) => (
                        <div
                          key={agent.id}
                          onClick={() => {
                            saveRecentSearch(value);
                            setIsOpen(false);
                            navigate(`/agent/${agent.id}`);
                          }}
                          className="flex items-center p-2.5 rounded-2xl bg-brand-surface dark:bg-[#1E1E1E] hover:bg-brand-interactive/10 border border-transparent hover:border-brand-interactive/30 transition-all cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-brand-interactive/10 text-brand-interactive flex items-center justify-center font-bold text-xs overflow-hidden shrink-0 mr-3">
                            {(agent.image || agent.avatar) ? (
                              <img
                                src={agent.image || agent.avatar}
                                alt={agent.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                          </div>
                          <div className="truncate flex-1">
                            <div className="text-xs font-bold text-[#1A1A1A] dark:text-white group-hover:text-brand-interactive transition-colors truncate">
                              {agent.name}
                            </div>
                            <div className="text-[11px] text-[#6C757D] truncate">
                              {agent.specialty}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-xs font-black text-[#1A1A1A] dark:text-white shrink-0 ml-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span>{(agent.rating ?? 5.0).toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Press Enter helper */}
                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#262626] flex items-center justify-between text-xs text-[#6C757D]">
                  <span>
                    Press <kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono font-bold">Enter</kbd> to see all filtered results
                  </span>
                  <button
                    onClick={() => {
                      saveRecentSearch(value);
                      setIsOpen(false);
                    }}
                    className="font-bold text-brand-interactive hover:underline cursor-pointer"
                  >
                    View all
                  </button>
                </div>
              </div>
            )}

            {/* When search is empty: Recent & Trending */}
            {value.trim().length === 0 && (
              <div className="p-4 space-y-5">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-[#6C757D] dark:text-[#888] flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-interactive" />
                        <span>Recent Searches</span>
                      </span>
                      <button
                        onClick={handleClearHistory}
                        className="text-xs text-[#6C757D] hover:text-brand-interactive hover:underline cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleSelectQuery(term)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E2E8F0] dark:border-[#2C2C2C] hover:border-brand-interactive hover:text-brand-interactive transition-all cursor-pointer flex items-center space-x-1.5"
                        >
                          <Clock className="w-3 h-3 text-[#6C757D]" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Beauty Searches */}
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#6C757D] dark:text-[#888] flex items-center space-x-1.5 mb-2.5">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-interactive" />
                    <span>Popular & Trending</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSelectQuery(tag)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-brand-surface dark:bg-[#202020] text-[#1A1A1A] dark:text-white border border-[#E2E8F0] dark:border-[#2C2C2C] hover:border-brand-interactive hover:text-brand-interactive transition-all cursor-pointer flex items-center space-x-1.5"
                      >
                        <Tag className="w-3 h-3 text-brand-interactive" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IntelligentSearchBar;
