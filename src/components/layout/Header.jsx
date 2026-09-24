import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';

export default function Header({ isMetric = true, onToggleUnit, onSearch }) {
  const [searchValue, setSearchValue] = useState('');
  const searchInputRef = useRef(null);

  // Atalho ⌘K ou Ctrl+K para focar no input de busca
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && searchValue.trim()) {
      if (onSearch) onSearch(searchValue.trim());
    }
  }

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Marca / Logo */}
        <div className="header-brand">
          <div className="brand-icon">
            <span className="material-symbols-outlined">air</span>
          </div>
          <span className="brand-title">Weather Now</span>
        </div>

        {/* Campo de Busca */}
        <div className="header-search">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            ref={searchInputRef}
            id="citySearchInput"
            type="text"
            placeholder="Buscar cidade, coordenadas..."
            autoComplete="off"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <kbd className="search-badge">⌘K</kbd>
        </div>

        {/* Ações (Botão de Unidade) */}
        <div className="header-actions">
          <Button
            id="unitToggleBtn"
            variant="unit"
            iconLeft="thermostat"
            label={isMetric ? 'Métrico (°C)' : 'Imperial (°F)'}
            iconRight="swap_vert"
            title="Alternar entre Métrico (°C) e Imperial (°F)"
            onClick={onToggleUnit}
          />
        </div>
      </div>
    </header>
  );
}
