import { useState, useEffect } from 'react';
import { getViewportHeight, getViewportWidth, isStandalone, getOrientation } from '@/utils/responsive';

export const useResponsive = () => {
  const [viewportHeight, setViewportHeight] = useState(getViewportHeight());
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth());
  const [orientation, setOrientation] = useState(getOrientation());
  const [isStandaloneApp, setIsStandaloneApp] = useState(isStandalone());

  useEffect(() => {
    const handleResize = () => {
      // Pequeno delay para garantir que as dimensões foram atualizadas
      setTimeout(() => {
        setViewportHeight(getViewportHeight());
        setViewportWidth(getViewportWidth());
        setOrientation(getOrientation());
      }, 100);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleResize();
      }
    };

    // Listener para mudanças de tamanho
    window.addEventListener('resize', handleResize);
    
    // Listener para quando o app volta do background
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listener específico para iOS
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Breakpoints comuns
  const isDesktop = viewportWidth >= 1024;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1024;
  const isMobile = viewportWidth < 768;

  return {
    viewportHeight,
    viewportWidth,
    orientation,
    isStandaloneApp,
    isDesktop,
    isTablet,
    isMobile
  };
};
