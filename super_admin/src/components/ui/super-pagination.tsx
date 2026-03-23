import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SuperPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  totalItems: number;
  className?: string;
}

export function SuperPagination({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems,
  className,
}: SuperPaginationProps) {
  const [jumpPage, setJumpPage] = useState("");

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPage("");
    }
  };

  const currentCount = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endCount = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const pages: (number | "ellipsis")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Basic rules: 1 ... 4 5 6 ... 10
    pages.push(1);
    
    if (currentPage > 4) pages.push("ellipsis");
    
    // First 5
    if (currentPage <= 4) {
      for (let i = 2; i <= 5; i++) pages.push(i);
      pages.push("ellipsis");
    } 
    // Last 4 scenario
    else if (currentPage >= totalPages - 3) {
      for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
    } 
    // Middle scenario
    else {
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push("ellipsis");
    }

    if (totalPages > 1 && pages[pages.length - 1] !== totalPages) {
      pages.push(totalPages);
    }
  }

  // Fallback for zero items
  if (totalPages === 0) {
    pages.push(1);
  }

  const safeTotalPages = Math.max(1, totalPages);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-sm", className)}>
      {/* Left Data */}
      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start gap-4 text-gray-500">
        <div>
          Showing <span className="font-medium text-gray-900">{currentCount}–{endCount}</span> of{" "}
          <span className="font-medium text-gray-900">{totalItems}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Rows per page</span>
          <Select value={pageSize.toString()} onValueChange={(val) => {
            onPageSizeChange(Number(val));
            onPageChange(1); // Reset to page 1 on resize
          }}>
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 50, 100].map(size => (
                <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Center & Right Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center w-full sm:w-auto">
        
        {/* Page Jumping */}
        {safeTotalPages > 5 && (
          <form onSubmit={handleJump} className="hidden lg:flex items-center gap-2 text-gray-500 mr-2">
            <span>Go to</span>
            <Input 
              type="number" 
              min={1} 
              max={safeTotalPages} 
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="h-8 w-14 text-center px-1"
              placeholder={currentPage.toString()}
            />
          </form>
        )}

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 hidden lg:flex" 
            disabled={currentPage === 1} 
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 lg:hidden" 
            disabled={currentPage === 1} 
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1 mx-1 overflow-x-auto custom-scrollbar pb-1 sm:pb-0 max-w-[200px] sm:max-w-none">
            {pages.map((p, idx) => {
              if (p === "ellipsis") {
                return (
                  <div key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-gray-400 shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                );
              }

              const isActive = p === currentPage;
              return (
                <Button
                  key={p}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "w-8 h-8 p-0 text-xs font-medium transition-colors shrink-0",
                    isActive 
                      ? "bg-[#F4511E] text-white hover:bg-[#E64A19] border-transparent" 
                      : "text-gray-600 hover:text-gray-900"
                  )}
                  onClick={() => onPageChange(p as number)}
                >
                  {p}
                </Button>
              );
            })}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2 hidden lg:flex" 
            disabled={currentPage >= safeTotalPages} 
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 lg:hidden" 
            disabled={currentPage >= safeTotalPages} 
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
