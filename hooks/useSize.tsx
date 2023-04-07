import { useEffect, useState } from "react";
import { useWindow } from "./useWindow";

export default function useSize() {
  
  const {width, height, setWidth, setHeight} = useWindow();
  const hasWindow = typeof window !== 'undefined';
  const [windowDimensions, setWindowDimensions] = useState({
    width: width,
    height: height
  });
    
  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    setWidth(width);
    setHeight(height);
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
  }, [hasWindow]);
  
  return windowDimensions;
}