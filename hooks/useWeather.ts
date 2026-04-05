"use client";

import { useCallback, useState } from "react";

type WeatherState =
  | { status: "idle" | "loading" | "error" | "denied" }
  | { status: "ready"; temperature: number | null; code: number | null; suggestion: string };

export function useWeather(lang: "vi" | "en") {
  const [state, setState] = useState<WeatherState>({ status: "idle" });

  const loadWeather = useCallback(async () => {
    if (!navigator.geolocation) {
      setState({ status: "denied" });
      return;
    }

    setState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m`,
          );
          const body = await response.json();
          const current = body?.current;

          setState({
            status: "ready",
            temperature: current?.temperature_2m ?? null,
            code: current?.weather_code ?? null,
            suggestion:
              lang === "vi"
                ? "Trời đẹp, đi dạo nhé?"
                : "Clear skies. Perfect for a walk.",
          });
        } catch {
          setState({ status: "error" });
        }
      },
      (error) => {
        setState(error?.code === 1 ? { status: "denied" } : { status: "error" });
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 1800000 },
    );
  }, [lang]);

  return { state, loadWeather };
}
