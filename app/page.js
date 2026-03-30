'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// TradingView iframe widget
function TVWidget({ widgetHtml, height = 420 }) {
    const ref = useRef(null);
    useEffect(() => {
          if (!ref.current) return;
          ref.current.innerHTML = widgetHtml;
          const scripts = ref.current.querySelectorAll('script');
          scripts.forEach(old => {
                  const s = document.createElement('script');
                  s.type = 'text/javascript';
                  s.src = old.src || '';
                  s.async = true;
                  if (old.innerHTML) s.innerHTML = old.innerHTML;
                  old.parentNode.replaceChild(s, old);
          });
    }, [widgetHtml]);
    return <div ref={ref} style={{ height }} />;
}
