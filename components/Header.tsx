"use client";
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  
  let currentPage = "Dashboard";
  if (pathname.includes("/flatmates")) {
    currentPage = "Flatmates";
  } else if (pathname.includes("/calculate")) {
    currentPage = "Create Bill";
  } else if (pathname.includes("/profile")) {
    currentPage = "Profile";
  }
  
  return <h1 className="text-3xl font-bold">{currentPage}</h1>;
}