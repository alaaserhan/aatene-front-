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
  const navRef = React.useRef<HTMLElement | null>(null);
  const savedTopRef = React.useRef<number | null>(null);
  const scrollParentRef = React.useRef<HTMLElement | Window | null>(null);
  const restoreFrameRef = React.useRef<number | null>(null);
  const keepRestoringUntilRef = React.useRef(0);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const getScrollParent = React.useCallback((element: HTMLElement): HTMLElement | Window => {
    let parent = element.parentElement;

    while (parent) {
      const style = window.getComputedStyle(parent);
      const canScrollY = /(auto|scroll|overlay)/.test(style.overflowY);

      if (canScrollY && parent.scrollHeight > parent.clientHeight) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return window;
  }, []);

  const scrollByParent = React.useCallback((parent: HTMLElement | Window, delta: number) => {
    if (parent === window) {
      window.scrollBy({ top: delta, left: 0 });
      return;
    }

    (parent as HTMLElement).scrollTop += delta;
  }, []);

  const restorePaginationPosition = React.useCallback(() => {
    if (savedTopRef.current === null || !navRef.current || !scrollParentRef.current) return;

    const currentTop = navRef.current.getBoundingClientRect().top;
    const delta = currentTop - savedTopRef.current;

    if (Math.abs(delta) > 1) {
      scrollByParent(scrollParentRef.current, delta);
    }
  }, [scrollByParent]);

  React.useLayoutEffect(() => {
    if (savedTopRef.current === null) return;

    if (restoreFrameRef.current !== null) {
      cancelAnimationFrame(restoreFrameRef.current);
    }

    keepRestoringUntilRef.current = performance.now() + 600;

    const keepPaginationPinned = () => {
      restorePaginationPosition();

      if (performance.now() < keepRestoringUntilRef.current) {
        restoreFrameRef.current = requestAnimationFrame(keepPaginationPinned);
        return;
      }

      savedTopRef.current = null;
      scrollParentRef.current = null;
      restoreFrameRef.current = null;
    };

    keepPaginationPinned();

    return () => {
      if (restoreFrameRef.current !== null) {
        cancelAnimationFrame(restoreFrameRef.current);
        restoreFrameRef.current = null;
      }
    };
  }, [currentPage, restorePaginationPosition]);

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

  const handlePageChange = (page: number) => {
    if (page === currentPage || !navRef.current) return;

    savedTopRef.current = navRef.current.getBoundingClientRect().top;
    scrollParentRef.current = getScrollParent(navRef.current);
    onPageChange(page);
  };

  const handlePrevious = () => handlePageChange(currentPage - 1);

  const handleNext = () => handlePageChange(currentPage + 1);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="pagination"
      className={cn("flex items-center justify-center gap-2", className)}
      {...props}
    >
      <Button
        type="button"
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
            type="button"
            variant={currentPage === page ? "link" : "outline"}
            size="icon"
            onClick={() => handlePageChange(page)}
            className={` cursor-pointer pt-1`}
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
        type="button"
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
