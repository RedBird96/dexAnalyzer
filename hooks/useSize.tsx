import { useEffect, useState } from "react";

export default function useSize() {
  
  const hasWindow = typeof window !== 'undefined';
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0
  });
    
  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
    };
  }

  useEffect(() => {
    if (hasWindow) {
      setWindowDimensions(getWindowDimensions());
      
      const handleResize = () => {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  return windowDimensions;
}