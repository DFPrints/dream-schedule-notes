
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Check for mobile device using multiple methods for better detection
    const checkMobile = () => {
      // Use media query
      const isMobileByWidth = window.innerWidth < MOBILE_BREAKPOINT;
      
      // Check for touch capability
      const isTouchDevice = (('ontouchstart' in window) || 
                             (navigator.maxTouchPoints > 0) || 
                             ((navigator as any).msMaxTouchPoints > 0));
      
      // Check for common mobile user agents (optional)
      const isMobileByUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Combined check - prioritize screen width
      setIsMobile(isMobileByWidth || (isTouchDevice && isMobileByUA));
    }

    // Run initial check
    checkMobile();
    
    // Add multiple event listeners for better coverage
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onResize = () => checkMobile();
    const onOrientationChange = () => checkMobile();
    
    mql.addEventListener("change", checkMobile);
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onOrientationChange);
    
    return () => {
      mql.removeEventListener("change", checkMobile);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
    }
  }, [])

  // Default to desktop if detection hasn't completed
  return !!isMobile
}
