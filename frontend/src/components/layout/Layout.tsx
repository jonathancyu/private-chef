import React, { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="w-full">
        <Header />
        <main className="container mx-auto px-4 py-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
