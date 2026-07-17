import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const CustomDropdown2 = ({ options, value, onChange, placeholder, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Click outside to close the menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const selectedOption = options.find((opt) => opt.value === value);
  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center cursor-pointer justify-between w-full p-2 text-xs text-gray-600 rounded-lg focus:outline-none focus:ring-1 transition-colors duration-500 border border-gray-200 focus:ring-blue-500 
            ${
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            } 
            ${value ? "bg-blue-50 " : "bg-transparent"}`}
      >
        <span className="truncate text-left pr-2">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          size={18}
          className={`transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 z-60 bg-white text-xs text-gray-600 rounded-lg transition-colors  border border-gray-200 max-h-48 overflow-y-auto overflow-x-hidden animate-fade-in-up duration-300 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent`}
        >
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
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
export default CustomDropdown2;
