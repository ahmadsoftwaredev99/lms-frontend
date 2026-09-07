import { useState, useEffect, useMemo } from 'react';

/**
 * Reusable client-side pagination hook for collections that can grow.
 * Standardizes page size = 6 across LMS lists/rosters.
 *
 * @param {Array} items - Array of items to paginate
 * @param {number} itemsPerPage - Number of items per page (default 6)
 * @returns {object} { currentPage, setCurrentPage, totalPages, currentItems, total, limit, resetPage }
 */
export const usePagination = (items = [], itemsPerPage = 6) => {
  const [currentPage, setCurrentPage] = useState(1);

  const total = items ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  // Reset or clamp currentPage if items array shrinks or changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const currentItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [items, currentPage, itemsPerPage]);

  const resetPage = () => setCurrentPage(1);

  return {
    currentPage,
    setCurrentPage,
    goToPage: setCurrentPage,
    totalPages,
    currentItems,
    total,
    totalItems: total,
    limit: itemsPerPage,
    resetPage,
  };
};

export default usePagination;
