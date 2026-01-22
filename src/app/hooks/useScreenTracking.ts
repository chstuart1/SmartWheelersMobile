import { useEffect, useRef } from 'react';
import { trackScreen } from '../../services/analytics/analytics';

export const useScreenTracking = (screenName: string, screenClass?: string) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!screenName || hasTracked.current) {
      return;
    }
    hasTracked.current = true;
    trackScreen(screenName, screenClass);
  }, [screenName, screenClass]);
};
