import { useCallback, useEffect, useState } from 'react';
import type { WidgetProps } from '../../core/types';

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

// Copenhagen — the dashboard's default location.
const LAT = 55.6761;
const LNG = 12.5683;
const CITY = 'Copenhagen';

const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mainly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' },
  48: { label: 'Depositing rime fog', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Dense drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌧️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Freezing rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '🌨️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Light showers', icon: '🌦️' },
  81: { label: 'Showers', icon: '🌧️' },
  82: { label: 'Violent showers', icon: '⛈️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Snow showers', icon: '❄️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Thunderstorm with hail', icon: '⛈️' },
};

function weatherFor(code: number) {
  return WEATHER_CODES[code] ?? { label: 'Unknown', icon: '🌡️' };
}

export default function Weather(_props: WidgetProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
        '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setData({
        temperature: json.current.temperature_2m,
        apparentTemperature: json.current.apparent_temperature,
        humidity: json.current.relative_humidity_2m,
        windSpeed: json.current.wind_speed_10m,
        weatherCode: json.current.weather_code,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load weather');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchWeather();
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className="weather__state">
        <div className="spinner" />
        <span>Loading weather…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="weather__state">
        <span style={{ fontSize: 30 }}>⚠️</span>
        <span>{error ?? 'No data'}</span>
        <button className="btn" onClick={() => void fetchWeather()}>
          Try again
        </button>
      </div>
    );
  }

  const condition = weatherFor(data.weatherCode);

  return (
    <div className="weather">
      <div className="weather__main">
        <div className="weather__icon">{condition.icon}</div>
        <div>
          <div className="weather__temp">{Math.round(data.temperature)}°C</div>
          <div className="weather__condition">{condition.label}</div>
        </div>
      </div>
      <div className="weather__stats">
        <span>Feels like {Math.round(data.apparentTemperature)}°C</span>
        <span>💧 {data.humidity}%</span>
        <span>💨 {Math.round(data.windSpeed)} km/h</span>
      </div>
      <div className="weather__meta">
        <span>📍 {CITY}</span>
        <button className="weather__refresh" onClick={() => void fetchWeather()}>
          Refresh
        </button>
      </div>
    </div>
  );
}
