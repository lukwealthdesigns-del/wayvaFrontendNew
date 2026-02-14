// components/Auth/VerificationCode.jsx
import React, { useState, useRef, useEffect } from 'react';

const VerificationCode = ({ 
  length = 4, 
  onComplete, 
  disabled = false,
  error = false,
  autoFocus = true 
}) => {
  const [code, setCode] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  useEffect(() => {
    // Trigger onComplete when all digits are filled
    if (code.every(digit => digit !== '') && onComplete) {
      onComplete(code.join(''));
    }
  }, [code, onComplete]);

  const handleChange = (index, value) => {
    // Allow only digits
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
    
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    
    // Handle Enter key
    if (e.key === 'Enter' && code.every(digit => digit !== '')) {
      onComplete?.(code.join(''));
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    const pastedData = e.clipboardData.getData('text/plain').replace(/\s/g, '').slice(0, length);
    
    // Check if pasted content contains only digits
    if (/^\d+$/.test(pastedData)) {
      const newCode = [...code];
      pastedData.split('').forEach((digit, i) => {
        if (i < length) newCode[i] = digit;
      });
      setCode(newCode);
      
      // Focus the next empty input or last input
      const nextEmptyIndex = newCode.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[length - 1]?.focus();
      }
    }
  };

  const handleClear = () => {
    if (disabled) return;
    setCode(Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  // Get input classes based on state
  const getInputClasses = (index) => {
    const baseClasses = 'w-14 h-14 md:w-16 md:h-16 text-center text-2xl md:text-3xl font-bold rounded-xl border-2 transition-all duration-200';
    
    if (disabled) {
      return `${baseClasses} bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed`;
    }
    
    if (error) {
      return `${baseClasses} border-red-500 bg-red-50 text-red-900 focus:border-red-600 focus:ring-2 focus:ring-red-200`;
    }
    
    if (code[index]) {
      return `${baseClasses} border-[#064473] bg-blue-50 text-[#064473]`;
    }
    
    return `${baseClasses} border-gray-300 bg-white text-gray-900 focus:border-[#064473] focus:ring-2 focus:ring-blue-200`;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600 text-sm md:text-base">
          {length}-Digit Verification Code
        </p>
        {code.some(digit => digit !== '') && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm text-[#064473] hover:text-[#043254] font-medium transition"
          >
            Clear
          </button>
        )}
      </div>
      
      <div 
        className="flex justify-center gap-2 md:gap-3" 
        onPaste={handlePaste}
      >
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={getInputClasses(index)}
            disabled={disabled}
            aria-label={`Verification code digit ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Error message slot - can be passed from parent */}
      {error && typeof error === 'string' && (
        <p className="mt-2 text-sm text-red-600 text-center">
          {error}
        </p>
      )}
      
      {/* Helper text */}
      {!disabled && !error && (
        <p className="mt-3 text-xs text-gray-500 text-center">
          Enter the {length}-digit code sent to your email
        </p>
      )}
    </div>
  );
};

export default VerificationCode;