"use client";

import { Slash } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";

export function BreadcrumbPagination() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter((segment) => segment !== "");

  const breadcrumbItems = segments
    .filter((segment) => !(segment.length === 36 && segment.includes("-"))) // Filter out IDs
    .map((segment, index, array) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const isLastItem = index === array.length - 1;

      const label = segment.charAt(0).toUpperCase() + segment.slice(1);

      return (
        <BreadcrumbItem key={href}>
          {isLastItem ? (
            <BreadcrumbPage>{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={href} as={Link}>
              {label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      );
    });

  const separators = breadcrumbItems.slice(0, -1).map((_, index) => (
    <BreadcrumbSeparator key={`separator-${index}`}>
      <Slash className="h-4 w-4" />
    </BreadcrumbSeparator>
  ));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" as={Link}>
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash className="h-4 w-4" />
        </BreadcrumbSeparator>
        {breadcrumbItems
          .flatMap((item, index) => [item, separators[index]])
          .slice(0, -1)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
