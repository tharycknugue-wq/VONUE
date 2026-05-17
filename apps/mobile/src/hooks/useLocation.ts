import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';

export interface Coords {
  lat: number;
  lng: number;
}

interface UseLocation {
  coords: Coords | null;
  simulated: boolean;
  error: string | null;
}

/**
 * Localização do dispositivo via expo-location. Se a permissão for negada
 * ou o GPS indisponível (comum em emulador), simula um leve passeio em
 * torno de `fallback` para que o mapa continue demonstrável.
 */
export function useLocation(fallback: Coords): UseLocation {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [simulated, setSimulated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fallbackRef = useRef(fallback);

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    let sim: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    const startSim = () => {
      setSimulated(true);
      let cur = { ...fallbackRef.current };
      setCoords(cur);
      sim = setInterval(() => {
        cur = {
          lat: cur.lat + (Math.random() - 0.5) * 0.0004,
          lng: cur.lng + (Math.random() - 0.5) * 0.0004,
        };
        setCoords({ ...cur });
      }, 3000);
    };

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== 'granted') {
          setError('Sem permissão de localização — usando posição simulada.');
          startSim();
          return;
        }
        sub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5 },
          (pos) =>
            setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        );
      } catch {
        if (!cancelled) {
          setError('GPS indisponível — usando posição simulada.');
          startSim();
        }
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
      if (sim) clearInterval(sim);
    };
  }, []);

  return { coords, simulated, error };
}
