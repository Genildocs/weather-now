// ==========================================
// Component: busca de cidades + geolocalização
// ==========================================

import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';
import { searchCity, reverseGeocode } from '../../services/geocoding';
import { isCanceled } from '../../services/http';
import { useLocationsStore } from '../../stores/useLocationsStore';
import Button from './Button';

const SEARCH_DELAY = 300;
const MIN_QUERY_LENGTH = 2;
const GEO_OPTIONS = { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 };

function locationMeta(location) {
  return [location.admin1, location.country].filter(Boolean).join(', ');
}

function geolocationError(error) {
  switch (error?.code) {
    case 1:
      return 'A permissão de localização foi negada. Você ainda pode buscar uma cidade.';
    case 2:
      return 'Sua localização não está disponível neste momento.';
    case 3:
      return 'A localização demorou demais. Tente novamente.';
    default:
      return 'Não foi possível acessar sua localização.';
  }
}

function getShortcutLabel() {
  if (typeof navigator === 'undefined') return '⌘K';
  const isMac = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform || navigator.userAgent || '');
  return isMac ? '⌘K' : 'Ctrl K';
}

export function LocationSearch({ initialValue = '', inputRef, onSelectLocation }) {
  const [value, setValue] = useState(initialValue);
  const shortcutLabel = getShortcutLabel();
  const [isDirty, setIsDirty] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [result, setResult] = useState({ key: null, status: 'idle', items: [] });
  const [geoStatus, setGeoStatus] = useState('idle');
  const [geoMessage, setGeoMessage] = useState('');

  const recentLocations = useLocationsStore((state) => state.recentLocations);
  const addRecentLocation = useLocationsStore((state) => state.addRecentLocation);
  const clearRecentLocations = useLocationsStore((state) => state.clearRecentLocations);

  const rootRef = useRef(null);
  const requestRef = useRef(null);
  const geoRequestRef = useRef(0);
  const geoAbortRef = useRef(null);
  const listId = `${useId()}-locations`;
  const query = value.trim();
  const isRecentMode = !isDirty;
  const isSearchMode = isDirty && query.length >= MIN_QUERY_LENGTH;
  const isPending = isSearchMode && result.key !== query;
  const suggestions = result.key === query ? result.items : [];
  const items = isSearchMode ? suggestions : isRecentMode ? recentLocations : [];
  const safeActiveIndex = items.length > 0 ? Math.min(activeIndex, items.length - 1) : -1;
  const showPanel =
    isOpen && (isDirty || recentLocations.length > 0 || Boolean(geoMessage));

  useEffect(() => {
    if (!isSearchMode) return undefined;

    const controller = new AbortController();
    requestRef.current?.abort();
    requestRef.current = controller;

    const timer = window.setTimeout(() => {
      searchCity(query, { signal: controller.signal })
        .then((matches) => setResult({ key: query, status: 'success', items: matches }))
        .catch((error) => {
          if (!isCanceled(error)) setResult({ key: query, status: 'error', items: [] });
        });
    }, SEARCH_DELAY);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [isSearchMode, query]);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  useEffect(
    () => () => {
      geoRequestRef.current += 1;
      geoAbortRef.current?.abort();
      requestRef.current?.abort();
    },
    [],
  );

  function chooseLocation(location) {
    geoRequestRef.current += 1;
    requestRef.current?.abort();
    setValue(location.name);
    setIsDirty(false);
    setIsOpen(false);
    setGeoMessage('');
    addRecentLocation(location);
    onSelectLocation?.(location);
  }

  async function submitQuery() {
    if (!isSearchMode && items.length > 0) {
      chooseLocation(items[safeActiveIndex >= 0 ? safeActiveIndex : 0]);
      return;
    }

    if (query.length < MIN_QUERY_LENGTH) return;

    if (!isPending && suggestions.length > 0) {
      chooseLocation(suggestions[safeActiveIndex >= 0 ? safeActiveIndex : 0]);
      return;
    }

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setResult({ key: query, status: 'loading', items: [] });

    try {
      const matches = await searchCity(query, { signal: controller.signal });
      setResult({ key: query, status: 'success', items: matches });
      if (matches[0]) chooseLocation(matches[0]);
      else setIsOpen(true);
    } catch (error) {
      if (!isCanceled(error)) {
        setResult({ key: query, status: 'error', items: [] });
        setIsOpen(true);
      }
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      if (items.length > 0) {
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        setActiveIndex((current) => (current + direction + items.length) % items.length);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      void submitQuery();
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.focus();
      return;
    }

    if (event.key === 'Home' && items.length > 0) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }

    if (event.key === 'End' && items.length > 0) {
      event.preventDefault();
      setActiveIndex(items.length - 1);
      return;
    }

    if (event.key === 'Tab') {
      setIsOpen(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoMessage('Este navegador não oferece acesso à localização.');
      setIsOpen(true);
      return;
    }

    setGeoStatus('loading');
    setGeoMessage('Obtendo sua localização…');
    setIsOpen(true);
    const requestId = geoRequestRef.current + 1;
    geoRequestRef.current = requestId;
    geoAbortRef.current?.abort();
    const controller = new AbortController();
    geoAbortRef.current = controller;

    function handleSuccess(coords) {
      if (geoRequestRef.current !== requestId) return;
      setGeoMessage('Identificando sua cidade…');

      reverseGeocode(
        { latitude: coords.latitude, longitude: coords.longitude },
        { signal: controller.signal },
      )
        .then((resolved) => {
          if (geoRequestRef.current !== requestId) return;

          const location = {
            id: resolved?.id ?? null,
            name: resolved?.name || '',
            admin1: resolved?.admin1 ?? '',
            country: resolved?.country ?? '',
            countryCode: resolved?.countryCode ?? '',
            latitude: coords.latitude,
            longitude: coords.longitude,
            timezone: resolved?.timezone || 'auto',
            source: 'geolocation',
          };

          setGeoStatus('success');
          setGeoMessage('');
          setIsOpen(false);
          setValue(location.name);
          setIsDirty(false);
          if (location.name) {
            addRecentLocation(location);
          }
          onSelectLocation?.(location);
        })
        .catch((err) => {
          if (geoRequestRef.current !== requestId) return;
          if (isCanceled(err)) return;

          // Se o reverse geocode falhar, usa as coordenadas para buscar o clima
          const location = {
            id: null,
            name: '',
            admin1: '',
            country: '',
            countryCode: '',
            latitude: coords.latitude,
            longitude: coords.longitude,
            timezone: 'auto',
            source: 'geolocation',
          };

          setGeoStatus('success');
          setGeoMessage('');
          setIsOpen(false);
          setValue('');
          setIsDirty(false);
          onSelectLocation?.(location);
        });
    }

    function handleError(error) {
      if (geoRequestRef.current !== requestId) return;
      setGeoStatus('error');
      setGeoMessage(geolocationError(error));
      setIsOpen(true);
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => handleSuccess(coords),
      (error) => {
        // Se falhou por indisponibilidade ou timeout na baixa precisão, tenta uma vez com alta precisão
        if (error.code === 2 || error.code === 3) {
          navigator.geolocation.getCurrentPosition(
            ({ coords }) => handleSuccess(coords),
            handleError,
            { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 },
          );
          return;
        }
        handleError(error);
      },
      GEO_OPTIONS,
    );
  }

  return (
    <div ref={rootRef} className={clsx('location-search', showPanel && 'location-search--open')}>
      <div className="location-search__field">
        <span className="material-symbols-outlined search-icon" aria-hidden="true">
          search
        </span>
        <input
          ref={inputRef}
          id="citySearchInput"
          type="text"
          role="combobox"
          aria-label="Buscar cidade"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-activedescendant={
            showPanel && safeActiveIndex >= 0 ? `${listId}-option-${safeActiveIndex}` : undefined
          }
          placeholder="Buscar cidade..."
          autoComplete="off"
          value={value}
          onFocus={(event) => {
            setIsOpen(true);
            event.target.select();
          }}
          onChange={(event) => {
            setValue(event.target.value);
            setIsDirty(true);
            setActiveIndex(0);
            setGeoMessage('');
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <kbd className="search-badge" aria-hidden="true">
          {shortcutLabel}
        </kbd>
      </div>

      <Button
        variant="icon-only"
        className="location-search__geo"
        iconLeft={geoStatus === 'loading' ? 'progress_activity' : 'my_location'}
        aria-label="Usar minha localização"
        title="Usar minha localização"
        disabled={geoStatus === 'loading'}
        onClick={useCurrentLocation}
      />

      <div className="location-search__panel" hidden={!showPanel}>
        {isRecentMode ? (
          <div className="location-search__panel-heading">
            <span className="location-search__eyebrow">Cidades recentes</span>
            {recentLocations.length > 0 && (
              <button type="button" className="location-search__clear" onClick={clearRecentLocations}>
                Limpar
              </button>
            )}
          </div>
        ) : (
          <span className="location-search__eyebrow">Resultados</span>
        )}

        <div
          id={listId}
          role="listbox"
          aria-label={isRecentMode ? 'Cidades recentes' : 'Resultados da busca'}
        >
          {items.map((location, index) => (
            <button
              key={location.id ?? `${location.latitude},${location.longitude}`}
              id={`${listId}-option-${index}`}
              type="button"
              role="option"
              tabIndex={-1}
              aria-selected={index === safeActiveIndex}
              className={clsx(
                'location-search__option',
                index === safeActiveIndex && 'location-search__option--active',
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => chooseLocation(location)}
            >
              <span className="material-symbols-outlined location-search__pin" aria-hidden="true">
                location_on
              </span>
              <span className="location-search__option-copy">
                <span className="location-search__option-name">{location.name}</span>
                {locationMeta(location) && (
                  <span className="location-search__option-meta">{locationMeta(location)}</span>
                )}
              </span>
              {location.countryCode && (
                <span className="location-search__country">{location.countryCode}</span>
              )}
            </button>
          ))}
        </div>

        {isDirty && !isSearchMode && (
          <p className="location-search__message" role="status">
            Digite pelo menos 2 caracteres.
          </p>
        )}
        {isSearchMode && (isPending || result.status === 'loading') && (
          <p className="location-search__message" role="status">
            Buscando cidades…
          </p>
        )}
        {isSearchMode && !isPending && result.status === 'success' && items.length === 0 && (
          <p className="location-search__message" role="status">
            Nenhuma cidade encontrada.
          </p>
        )}
        {isSearchMode && !isPending && result.status === 'error' && (
          <p className="location-search__message location-search__message--error" role="alert">
            Não foi possível buscar cidades. Tente novamente.
          </p>
        )}
        {geoMessage && (
          <p
            className={clsx(
              'location-search__message',
              geoStatus === 'error' && 'location-search__message--error',
            )}
            role={geoStatus === 'error' ? 'alert' : 'status'}
          >
            {geoMessage}
          </p>
        )}
      </div>
    </div>
  );
}

export default LocationSearch;
