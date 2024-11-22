"use client"
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { BreadcrumbPagination } from "~/components/beadcrumb.pagination";

type Props = {
  children: React.ReactNode;
};

const PlaygroundLayout = ({ children }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating breadcrumb icon */}
      <div className="fixed right-4 top-4 z-50">
        <button
          onClick={toggleDropdown}
          className="rounded-full bg-black p-2 shadow-lg hover:bg-gray-800 transition-colors"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-gray-600" />
          ) : (
            <Menu className="h-6 w-6 text-gray-600" />
          )}
        </button>

        {/* Dropdown containing original BreadcrumbPagination */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-black rounded-lg shadow-xl">
            <div className="p-4">
              <BreadcrumbPagination />
            </div>
          </div>
        )}
      </div>

      {children}
    </>
  );
};

export default PlaygroundLayout;