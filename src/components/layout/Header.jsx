import { useRef, useEffect } from 'react';
import UnitsDropdown from '../ui/UnitsDropdown';
import LocationSearch from '../ui/LocationSearch';

export default function Header({ locationKey = '', locationName = '', onSelectLocation }) {
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

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Marca / Logo */}
        <div className="header-brand">
          <div className="brand-icon">
            <span className="material-symbols-outlined" aria-hidden="true">
              air
            </span>
          </div>
          <span className="brand-title">Weather Now</span>
        </div>

        {/* Campo de Busca (recriado quando a cidade muda) */}
        <div className="header-search">
          <LocationSearch
            key={locationKey}
            initialValue={locationName}
            inputRef={searchInputRef}
            onSelectLocation={onSelectLocation}
          />
        </div>

        {/* Ações (menu de unidades: lê e escreve direto na store) */}
        <div className="header-actions">
          <UnitsDropdown />
        </div>
      </div>
    </header>
  );
}
