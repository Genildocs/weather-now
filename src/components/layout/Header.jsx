import { useState, useRef, useEffect } from 'react';
import UnitsDropdown from '../ui/UnitsDropdown';

// Campo de busca. Começa com a cidade atual; o Header o monta com
// key={city}, então quando a cidade muda (inclusive pelo botão "voltar")
// o React recria o campo e o texto acompanha — sem effect de sincronização.
function HeaderSearch({ initialValue = '', inputRef, onSearch }) {
  const [searchValue, setSearchValue] = useState(initialValue);

  function handleSearchKeyDown(e) {
    if (e.key === 'Enter' && searchValue.trim()) {
      if (onSearch) onSearch(searchValue.trim());
    }
  }

  return (
    <div className="header-search">
      <span className="material-symbols-outlined search-icon" aria-hidden="true">
        search
      </span>
      <input
        ref={inputRef}
        id="citySearchInput"
        type="text"
        placeholder="Buscar cidade, coordenadas..."
        aria-label="Buscar cidade"
        autoComplete="off"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleSearchKeyDown}
      />
      <kbd className="search-badge" aria-hidden="true">
        ⌘K
      </kbd>
    </div>
  );
}

export default function Header({ city = '', onSearch }) {
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
        <HeaderSearch key={city} initialValue={city} inputRef={searchInputRef} onSearch={onSearch} />

        {/* Ações (menu de unidades: lê e escreve direto na store) */}
        <div className="header-actions">
          <UnitsDropdown />
        </div>
      </div>
    </header>
  );
}
