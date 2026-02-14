// components/Shared/ToggleSwitch.jsx
import React from 'react';

const ToggleSwitch = ({ checked, onChange, disabled = false }) => {
  const primaryColor = '#064473';
  const primaryHover = '#0a5c9c';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      style={{
        backgroundColor: checked ? primaryColor : '#d1d5db',
        outline: 'none',
        boxShadow: 'none'
      }}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onMouseEnter={(e) => {
        if (!disabled && checked) {
          e.target.style.backgroundColor = primaryHover;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && checked) {
          e.target.style.backgroundColor = primaryColor;
        }
      }}
      onFocus={(e) => {
        e.target.style.boxShadow = `0 0 0 3px rgba(6, 68, 115, 0.2)`;
      }}
      onBlur={(e) => {
        e.target.style.boxShadow = 'none';
      }}
    >
      <span
        style={{
          backgroundColor: '#ffffff'
        }}
        className={`inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

export default ToggleSwitch;