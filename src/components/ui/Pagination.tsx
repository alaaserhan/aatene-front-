// src/components/ui/Pagination.tsx
"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  className,
  ...props
}: PaginationProps) {
    console.log(totalPages,currentPage);
    
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const pageNumbers = React.useMemo(() => {
    const pages: (number | string)[] = [];
    const total = totalPages;
    const current = currentPage;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current < 5) {
        pages.push(1, 2, 3, 4, 5, "...", total);
      } else if (current > total - 4) {
        pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, "...", current - 1, current, current + 1, "...", total);
      }
    }
    return pages;
  }, [totalPages, currentPage]);

  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center justify-center gap-2", className)}
      {...props}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={isFirstPage}
        className="cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {pageNumbers.map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            variant={currentPage === page ? "link" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            className={` cursor-pointer`}
          >
            {page}
          </Button>
        ) : (
          <span
            key={index}
            className="flex h-9 w-9 items-center justify-center"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={isLastPage}
        className="cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </nav>
  );
}