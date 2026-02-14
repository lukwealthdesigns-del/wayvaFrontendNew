// components/Shared/FloatingActionButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FiZap } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import FloatingActionModal from './FloatingActionModal';

const FloatingActionButton = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(() => {
    const screenWidth = window.innerWidth;
    return { x: screenWidth - 80, y: window.innerHeight - 160 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  // Snap to edge function
  const snapToEdge = (x, y) => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const buttonSize = 56; // w-14 = 56px
    
    // Snap to left or right edge
    const screenCenter = screenWidth / 2;
    const isLeftHalf = x < screenCenter;
    
    const snappedX = isLeftHalf ? 10 : screenWidth - buttonSize - 10;
    
    // Keep Y within bounds but maintain vertical position
    const snappedY = Math.max(10, Math.min(y, screenHeight - buttonSize - 80));
    
    return { x: snappedX, y: snappedY };
  };

  // Handle drag start
  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setShowPulse(false);
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  };

  // Handle dragging
  const handleDrag = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    let newX = clientX - dragStartPos.current.x;
    let newY = clientY - dragStartPos.current.y;
    
    // Boundary constraints during drag
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const buttonSize = 56;
    
    newX = Math.max(10, Math.min(newX, screenWidth - buttonSize - 10));
    newY = Math.max(10, Math.min(newY, screenHeight - buttonSize - 80));
    
    setPosition({ x: newX, y: newY });
  };

  // Handle drag end with snap to edge
  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Snap to nearest edge
    const snappedPosition = snapToEdge(position.x, position.y);
    setPosition(snappedPosition);
    
    setTimeout(() => {
      if (!isModalOpen) setShowPulse(true);
    }, 1000);
  };

  // Handle click
  const handleClick = (e) => {
    e.stopPropagation();
    if (!isDragging) {
      setIsModalOpen(true);
      setShowPulse(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setShowPulse(true), 500);
  };

  // Event listeners
  useEffect(() => {
    const handleMouseMove = (e) => handleDrag(e);
    const handleTouchMove = (e) => handleDrag(e);
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  // Initial snap on mount
  useEffect(() => {
    const handleResize = () => {
      const snappedPosition = snapToEdge(position.x, position.y);
      setPosition(snappedPosition);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Floating Action Button */}
      <div
        ref={buttonRef}
        className="fixed z-50 cursor-grab active:cursor-grabbing select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: isDragging ? 'scale(1.1)' : 'scale(1)',
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleClick}
      >
        {/* Subtle pulsing glow effect */}
        {showPulse && (
          <div 
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#064473] to-[#0a6db1] opacity-20"
            style={{ 
              animation: 'pulse-subtle 2s ease-in-out infinite',
              transform: 'scale(1.1)',
              filter: 'blur(4px)'
            }}
          ></div>
        )}
        
        {/* Main Button Container */}
        <div className="relative flex flex-col items-center">
          {/* Main Button */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#064473] to-[#0a6db1] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <FiZap className="w-7 h-7 text-white" />
          </div>
          
          {/* Label - Transparent background, primary color, closer spacing */}
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-[#064473] text-xs font-medium tracking-wide">
              AI Assistant
            </span>
          </div>
        </div>
        
        {/* Drag hint tooltip (only shows on hover) */}
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Drag me anywhere • Snaps to edge
        </div>
      </div>

      {/* Modal - Using imported component */}
      {isModalOpen && <FloatingActionModal onClose={closeModal} />}
    </>
  );
};

export default FloatingActionButton;