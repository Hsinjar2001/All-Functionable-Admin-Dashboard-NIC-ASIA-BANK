import React from 'react';
import './Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  pageSizeOptions = [],
  onPageSizeChange
}) => {

  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const handleFirst = () => {
    onPageChange(1);
  };

  const handleLast = () => {
    onPageChange(totalPages);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1, '...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...', totalPages);
      }
    }
    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalItems === 0) return null;

  return (
    <div className="pagination-wrapper">

      {/* Info */}
      <div className="pagination-info">
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of{' '}
        <strong>{totalItems}</strong> users
      </div>

      {/* Controls */}
      <div className="pagination-container">

        {/* First */}
        <button
          className="pagination-btn pagination-first"
          onClick={handleFirst}
          disabled={currentPage === 1}
        >
          «
        </button>

        {/* Previous */}
        <button
          className="pagination-btn pagination-prev"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Prev
        </button>

        {/* Page Numbers */}
        <div className="pagination-numbers">
          {getPageNumbers().map((page, index) =>
            page === '...' ? (
              <span key={index} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* ✅ ROWS PER PAGE (MIDDLE) */}
        {pageSizeOptions.length > 0 && (
          <div className="pagination-page-size">
            <span>Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {/* Next */}
        <button
          className="pagination-btn pagination-next"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Next
        </button>

        {/* Last */}
        <button
          className="pagination-btn pagination-last"
          onClick={handleLast}
          disabled={currentPage === totalPages}
        >
          »
        </button>
      </div>

      {/* Page Info */}
      <div className="pagination-page-info">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </div>
    </div>
  );
};

export default Pagination;
