
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Function to detect if we're on a mobile device
    const checkMobile = () => {
      // Check for Capacitor
      const isCapacitorApp = window.Capacitor !== undefined;
      
      // Use both screen size and user agent to more reliably detect mobile devices
      const isMobileBySize = window.innerWidth < MOBILE_BREAKPOINT;
      
      // Check for common mobile user agents
      const isMobileByAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // On iOS/iPadOS, even if screen width is large, we'll treat it as mobile
      // for better PWA and Capacitor compatibility
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // If we're in Capacitor, we're definitely mobile
      if (isCapacitorApp) {
        return true;
      }
      
      return isMobileBySize || isMobileByAgent || isIOSDevice;
    };

    // Initial check
    setIsMobile(checkMobile());
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(checkMobile());
    }
    
    // Listen for screen size changes
    mql.addEventListener("change", onChange)
    window.addEventListener("resize", onChange)
    
    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("resize", onChange)
    }
  }, [])

  return !!isMobile
}
