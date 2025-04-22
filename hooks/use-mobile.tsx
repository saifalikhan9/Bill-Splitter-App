"use client"

import { useState, useEffect } from "react"

// Default breakpoint for mobile devices (can be adjusted as needed)
const MOBILE_BREAKPOINT = 768

export function useIsMobile(): boolean {
  // Default to false for server-side rendering
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === "undefined") return

    // Function to update state based on window width
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Initial check
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return isMobile
}
