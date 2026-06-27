import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const CustomDropdown = ({  options, onSelect, selectedValue, displayValue }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex text-xs text-gray-600  p-1 md:p-2 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gay-400 md:w-[180px] cursor-pointer items-center justify-between"
      >
        <span>{displayValue}</span>
        <ChevronDown size={18} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-xl z-50 overflow-hidden animate-fade-in-up">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onSelect(opt.value); setIsOpen(false); }}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 text-gray-700 text-xs transition-colors cursor-pointer "
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default CustomDropdown;