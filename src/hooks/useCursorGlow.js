import { useEffect } from 'react';

export default function useCursorGlow(cursorGlowRef) {
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (cursorGlowRef.current && window.innerWidth > 768) {
        requestAnimationFrame(() => {
          if (cursorGlowRef.current) {
            cursorGlowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
          }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorGlowRef]);
}
