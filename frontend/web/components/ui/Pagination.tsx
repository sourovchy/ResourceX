import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    pageIndex: number; // 0-indexed
    totalPages: number;
    onPageChange: (newPageIndex: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pageIndex, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    // Display pages strategy: show max 5 pages around the current page
    const getVisiblePages = () => {
        let start = Math.max(0, pageIndex - 2);
        let end = Math.min(totalPages - 1, pageIndex + 2);

        if (end - start < 4) {
            if (start === 0) end = Math.min(totalPages - 1, 4);
            else if (end === totalPages - 1) start = Math.max(0, totalPages - 5);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const pages = getVisiblePages();

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-border sm:px-6">
            <div className="flex w-full items-center justify-between gap-3 sm:hidden">
                <button
                    onClick={() => onPageChange(pageIndex - 1)}
                    disabled={pageIndex === 0}
                    className="relative inline-flex flex-1 items-center justify-center px-4 py-2.5 text-sm font-medium text-textPrimary bg-white border border-border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(pageIndex + 1)}
                    disabled={pageIndex >= totalPages - 1}
                    className="relative inline-flex flex-1 items-center justify-center px-4 py-2.5 text-sm font-medium text-textPrimary bg-white border border-border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:flex-col lg:flex-row sm:items-start lg:items-center sm:gap-3 lg:gap-0 sm:justify-between">
                <div>
                    <p className="text-sm text-textSecondary leading-relaxed break-words">
                        Showing page <span className="font-medium">{pageIndex + 1}</span> of <span className="font-medium">{totalPages}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex flex-wrap rounded-md shadow-sm -space-x-px max-w-full overflow-x-auto" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(pageIndex - 1)}
                            disabled={pageIndex === 0}
                            className="relative inline-flex items-center px-3 py-2 rounded-l-md border border-border bg-white text-sm font-medium text-textSecondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {pages[0] > 0 && (
                            <>
                                <button
                                    onClick={() => onPageChange(0)}
                                    className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-border bg-white text-sm font-medium text-textSecondary hover:bg-gray-50"
                                >
                                    1
                                </button>
                                {pages[0] > 1 && (
                                    <span className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-border bg-gray-50 text-sm font-medium text-textSecondary">
                                        ...
                                    </span>
                                )}
                            </>
                        )}

                        {pages.map((page) => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                aria-current={page === pageIndex ? "page" : undefined}
                                className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-sm font-medium whitespace-nowrap
                                    ${page === pageIndex 
                                        ? "z-10 bg-primaryLight border-primary text-primary" 
                                        : "bg-white border-border text-textSecondary hover:bg-gray-50"
                                    }
                                `}
                            >
                                {page + 1}
                            </button>
                        ))}

                        {pages[pages.length - 1] < totalPages - 1 && (
                            <>
                                {pages[pages.length - 1] < totalPages - 2 && (
                                    <span className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-border bg-gray-50 text-sm font-medium text-textSecondary">
                                        ...
                                    </span>
                                )}
                                <button
                                    onClick={() => onPageChange(totalPages - 1)}
                                    className="relative inline-flex items-center px-3 sm:px-4 py-2 border border-border bg-white text-sm font-medium text-textSecondary hover:bg-gray-50"
                                >
                                    {totalPages}
                                </button>
                            </>
                        )}

                        <button
                            onClick={() => onPageChange(pageIndex + 1)}
                            disabled={pageIndex >= totalPages - 1}
                            className="relative inline-flex items-center px-3 py-2 rounded-r-md border border-border bg-white text-sm font-medium text-textSecondary hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};
