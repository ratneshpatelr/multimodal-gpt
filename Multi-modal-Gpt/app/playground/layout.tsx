import React from "react";
import { BreadcrumbPagination } from "~/components/beadcrumb.pagination";

type Props = {
  children: React.ReactNode;
};

const PlaygroundLayout = ({ children }: Props) => {
  return (
    <>
    <div className="mx-6 my-5">
    <BreadcrumbPagination />
    </div>
      {children}
    </>
  );
};

export default PlaygroundLayout;
