import { useCallback, useEffect, useState } from 'react';
import type { WidgetProps } from '../../core/types';

interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
}

/** A chosen location: display name + coordinates. */
interface Location {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

/** A candidate result from the geocoding search. */
interface LocationResult {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
}

const LOCATION_KEY = 'dashboardly-weather-location-v1';

// Odense C — the dashboard's default location.
const DEFAULT_LOCATION: Location = {
  name: 'Odense C',
  country: 'Denmark',
  latitude: 55.40841,
  longitude: 10.39538,
};

function loadLocation(): Location {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      const p = parsed as Partial<Location>;
      if (
        typeof p?.name === 'string' &&
        Number.isFinite(p?.latitude) &&
        Number.isFinite(p?.longitude)
      ) {
        return {
          name: p.name,
          country: typeof p.country === 'string' ? p.country : undefined,
          latitude: p.latitude as number,
          longitude: p.longitude as number,
        };
      }
    }
  } catch {
    // Corrupt storage — fall back to the default location.
  }
  return DEFAULT_LOCATION;
}

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
  const [location, setLocation] = useState<Location>(loadLocation);

  // Location search state.
  const [cityInput, setCityInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [results, setResults] = useState<LocationResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const fetchWeather = useCallback(async (loc: Location) => {
    setLoading(true);
    setError(null);
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}` +
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

  // Load weather whenever the location changes.
  useEffect(() => {
    setData(null);
    void fetchWeather(location);
  }, [location, fetchWeather]);

  // Debounced geocoding search while the user types.
  useEffect(() => {
    const city = cityInput.trim();
    const country = countryInput.trim();
    if (city.length < 2 && !country) {
      setResults(null);
      setSearchError(null);
      return;
    }
    const query = country ? `${city}, ${country}` : city;
    const controller = new AbortController();
    setSearching(true);
    setSearchError(null);
    const timer = setTimeout(async () => {
      try {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query
        )}&count=8&language=en&format=json`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const json = await res.json();
        setResults(
          (json.results as Array<Record<string, unknown>>)
            .filter((r) => Number.isFinite(r.latitude) && Number.isFinite(r.longitude))
            .map((r) => ({
              name: String(r.name),
              country: typeof r.country === 'string' ? r.country : undefined,
              latitude: r.latitude as number,
              longitude: r.longitude as number,
            }))
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setResults(null);
        setSearchError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cityInput, countryInput]);

  const applyLocation = useCallback((loc: Location) => {
    setLocation(loc);
    setCityInput('');
    setCountryInput('');
    setResults(null);
    setShowPicker(false);
    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
    } catch {
      // Storage unavailable — the location still applies for this session.
    }
  }, []);

  const openPicker = () => {
    setShowPicker(true);
    setResults(null);
  };

  const closePicker = () => {
    setShowPicker(false);
    setCityInput('');
    setCountryInput('');
    setResults(null);
    setSearchError(null);
  };

  const condition = weatherFor(data?.weatherCode ?? 0);
  const locationLabel = location.country
    ? `${location.name}, ${location.country}`
    : location.name;

  return (
    <div className="weather">
      <div className="weather__body">
        {loading ? (
          <div className="weather__state weather__state--inline">
            <div className="spinner" />
            <span>Loading weather…</span>
          </div>
        ) : error || !data ? (
          <div className="weather__state weather__state--inline">
            <span style={{ fontSize: 30 }}>⚠️</span>
            <span>{error ?? 'No data'}</span>
            <button className="btn" onClick={() => void fetchWeather(location)}>
              Try again
            </button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

      {showPicker ? (
        <div className="weather__picker">
          <div className="weather__picker-fields">
            <input
              className="weather__input"
              type="text"
              placeholder="City"
              aria-label="City"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              autoFocus
            />
            <input
              className="weather__input"
              type="text"
              placeholder="Country (optional)"
              aria-label="Country"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results && results.length === 1) {
                  applyLocation(results[0]);
                }
              }}
            />
          </div>
          {cityInput.trim().length >= 2 && (
            <div className="weather__results">
              {searching && <div className="weather__results-note">Searching…</div>}
              {searchError && <div className="weather__results-note">⚠️ {searchError}</div>}
              {!searching && !searchError && results?.length === 0 && (
                <div className="weather__results-note">No matches found</div>
              )}
              {!searching &&
                !searchError &&
                results?.map((r) => {
                  const label = r.country ? `${r.name}, ${r.country}` : r.name;
                  return (
                    <button
                      key={`${r.latitude},${r.longitude}`}
                      className="weather__result"
                      onClick={() => applyLocation(r)}
                    >
                      {label}
                    </button>
                  );
                })}
            </div>
          )}
          <div className="weather__picker-actions">
            <button className="weather__refresh" onClick={closePicker}>
              Cancel
            </button>
            <button
              className="btn weather__picker-set"
              disabled={!(results && results.length > 0)}
              onClick={() => results && results.length > 0 && applyLocation(results[0])}
            >
              Set location
            </button>
          </div>
        </div>
      ) : (
        <div className="weather__meta">
          <span className="weather__location">📍 {locationLabel}</span>
          <div className="weather__actions">
            <button className="weather__refresh" onClick={openPicker}>
              Change
            </button>
            <button className="weather__refresh" onClick={() => void fetchWeather(location)}>
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
