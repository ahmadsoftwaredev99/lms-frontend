import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange, total = 0, limit = 10 }) => {
  if (totalPages <= 1 && total <= limit) return null;

  const startEntry = (currentPage - 1) * limit + 1;
  const endEntry = Math.min(currentPage * limit, total);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        marginTop: '1.25rem',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        Showing <strong style={{ color: 'var(--text-main)' }}>{total > 0 ? startEntry : 0}</strong> to{' '}
        <strong style={{ color: 'var(--text-main)' }}>{endEntry}</strong> of{' '}
        <strong style={{ color: 'var(--text-main)' }}>{total}</strong> entries
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          className="btn-secondary"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '0.35rem 0.65rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            opacity: currentPage <= 1 ? 0.4 : 1,
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={16} /> Prev
        </button>

        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 0.5rem' }}>
          Page <strong style={{ color: 'var(--accent-primary)' }}>{currentPage}</strong> of <strong style={{ color: 'var(--text-main)' }}>{totalPages || 1}</strong>
        </span>

        <button
          className="btn-secondary"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '0.35rem 0.65rem',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            opacity: currentPage >= totalPages ? 0.4 : 1,
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
          }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
