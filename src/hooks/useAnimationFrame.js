// src/hooks/useAnimationFrame.js
import { useEffect, useRef, useCallback } from "react";

/**
 * Hook pour lancer une boucle animationFrame et exécuter une callback avec dt
 * callback(dt : nombre de secondes) sera appelée chaque frame.
 */
export function useAnimationFrame(callback) {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = useCallback((time) => {
    if (previousTimeRef.current != null) {
      const dt = (time - previousTimeRef.current) / 1000;  // en secondes
      callback(dt);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);
}
