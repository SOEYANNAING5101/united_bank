import { X } from "lucide-react";
const UserBaseModal = ({ isOpen, onClose, title,children }) => {
    if (!isOpen) return null;
    return (
    <div className="md:p-0 p-4 z-60 bg-black/40 fixed inset-0 flex items-center justify-center overflow-y-scroll">
      <div className="bg-white w-full max-w-[500px] rounded-xl shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-0">
            <span className="text-gray-800 md:text-xl font-bold">{title}</span>
          </div>
          <button
            className="mt-2 p-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export default UserBaseModal;
