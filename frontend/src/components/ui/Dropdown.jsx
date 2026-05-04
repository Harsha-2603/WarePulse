import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export const Dropdown = ({ trigger, children, align = 'left', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2'
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-10 mt-2 w-56 rounded-xl bg-white shadow-lg border border-slate-200 ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200 ${alignmentClasses[align]} ${className}`}
          onClick={() => setIsOpen(false)} // Close on item click by default
        >
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, active, icon, className = '', danger = false }) => {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center w-full px-4 py-2 text-sm transition-colors
        ${active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'} 
        ${danger ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-slate-50 hover:text-slate-900'} 
        ${className}
      `}
    >
      {icon && (
        <span className={`mr-2 h-4 w-4 ${danger ? 'text-red-500' : 'text-slate-400 group-hover:text-slate-500'}`}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export const DropdownDivider = () => {
  return <div className="h-px bg-slate-200 my-1" />;
};

export default Dropdown;
