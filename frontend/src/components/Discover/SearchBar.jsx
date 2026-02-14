// components/Discover/SearchBar.jsx - Backend Integration Ready
import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ 
  placeholder = "Where do you want to go?", 
  value, 
  onChange,
  onSearch,
  onClear,
  autoFocus = false,
  loading = false,
  className = ""
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef(null);
  const isControlled = value !== undefined && onChange !== undefined;

  // Sync local state with controlled value
  useEffect(() => {
    if (isControlled && value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value, isControlled]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    if (!isControlled) {
      setLocalValue(newValue);
    }
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(isControlled ? value : localValue);
    }
  };

  const handleClear = () => {
    if (!isControlled) {
      setLocalValue('');
    }
    
    if (onChange) {
      onChange('');
    }
    
    if (onClear) {
      onClear();
    }
    
    // Focus the input after clearing
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    // Submit on Enter
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
    
    // Clear on Escape
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  // Auto focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const displayValue = isControlled ? value : localValue;

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FiSearch className="w-5 h-5 text-gray-400" />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className={`
          w-full pl-12 pr-12 py-4 rounded-xl 
          bg-white border border-gray-200 
          focus:outline-none focus:ring-2 focus:ring-[#064473] focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
          transition-all duration-200
          ${displayValue ? 'pr-24' : 'pr-4'}
        `}
      />
      
      {/* Clear button - only shown when there's text */}
      {displayValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-12 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
      
      {/* Search button - always visible */}
      <button
        type="submit"
        disabled={loading || !displayValue?.trim()}
        className={`
          absolute inset-y-0 right-0 px-4 
          flex items-center justify-center
          rounded-r-xl font-medium text-sm
          transition-all duration-200
          ${displayValue?.trim() 
            ? 'text-[#064473] hover:text-[#043254]' 
            : 'text-gray-400 cursor-not-allowed'
          }
        `}
        aria-label="Search"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-[#064473] border-t-transparent rounded-full animate-spin" />
        ) : (
          'Search'
        )}
      </button>
    </form>
  );
};

export default SearchBar;