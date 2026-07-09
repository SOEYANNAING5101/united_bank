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
        className={`w-full flex text-xs text-gray-600 p-1 md:p-2 rounded-xl border border-gray-200 hover:bg-gray-100 hover:border-gay-400  cursor-pointer items-center justify-between 
            ${
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-200 focus:ring-blue-500"
            } 
            ${value ? "bg-blue-50 " : "bg-transparent"}`}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 z-60 bg-white p-1 text-xs text-gray-600 rounded-lg  transition-colors duration-500 border border-gray-200 overflow-hidden animate-fade-in-up`}
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
