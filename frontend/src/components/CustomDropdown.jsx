import { useState, useRef, useEffect } from 'react';
import './CustomDropdown.css';

function CustomDropdown({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select...',
  className = '' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDropdown = dropdownRef.current?.contains(event.target);
      const isClickInsideMenu = menuRef.current?.contains(event.target);
      
      if (!isClickInsideDropdown && !isClickInsideMenu) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const selectedOption = options.find(opt => opt.value === value) || { label: placeholder };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <div className={`custom-dropdown ${className} ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
        <button
          type="button"
          ref={triggerRef}
          className="custom-dropdown-trigger"
          onClick={handleToggle}
          aria-expanded={isOpen}
        >
          <span className="dropdown-value">{selectedOption.label || placeholder}</span>
          <svg 
            className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>
      
      {isOpen && (
        <div 
          ref={menuRef}
          className="custom-dropdown-menu"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {value === option.value && (
                <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export default CustomDropdown;

