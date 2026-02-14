// components/Discover/FilterButton.jsx
import React from 'react';
import { FiFilter } from 'react-icons/fi';

const FilterButton = ({ onClick }) => {
  const PRIMARY_COLOR = '#064473';
  const PRIMARY_LIGHT = '#E6F0F7';
  
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 rounded-xl flex items-center justify-center border border-gray-300 hover:border-gray-400 transition-colors"
      style={{ backgroundColor: PRIMARY_LIGHT }}
    >
      <FiFilter className="w-5 h-5" style={{ color: PRIMARY_COLOR }} />
    </button>
  );
};

export default FilterButton;