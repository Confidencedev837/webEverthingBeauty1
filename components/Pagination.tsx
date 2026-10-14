import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <nav 
      aria-label="Pagination" 
      className={`flex items-center justify-center gap-1.5 sm:gap-2 my-8 select-none ${className}`}
    >
      {/* Previous Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-white shadow-sm hover:border-brand-interactive hover:text-brand-interactive disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronLeft className="w-5 h-5" />
      </motion.button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {getPageNumbers().map((page, idx) => {
          if (page === '...') {
            return (
              <span 
                key={`ellipsis-${idx}`} 
                className="w-8 text-center text-xs font-black text-[#6C757D] dark:text-[#888]"
              >
                •••
              </span>
            );
          }

          const pageNum = Number(page);
          const isActive = pageNum === currentPage;

          return (
            <motion.button
              key={pageNum}
              whileHover={{ scale: isActive ? 1 : 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onPageChange(pageNum)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center justify-center min-w-[38px] h-10 sm:min-w-[42px] sm:h-11 px-2 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-brand-interactive text-white shadow-lg shadow-brand-interactive/25 font-black'
                  : 'bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-[#E0E0E0] hover:border-brand-interactive/50 hover:text-brand-interactive'
              }`}
            >
              {pageNum}
              {isActive && (
                <motion.div
                  layoutId="activePageIndicator"
                  className="absolute inset-0 rounded-2xl border-2 border-brand-interactive pointer-events-none"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Next Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] text-[#1A1A1A] dark:text-white shadow-sm hover:border-brand-interactive hover:text-brand-interactive disabled:opacity-30 disabled:pointer-events-none transition-all"
      >
        <ChevronRight className="w-5 h-5" />
      </motion.button>
    </nav>
  );
};

export default Pagination;
