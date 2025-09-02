import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef, ReactNode } from "react";

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, isOpen, onClose, title, children, ...props }, ref) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div
          className={cn(
            "relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6",
            className
          )}
          ref={ref}
          {...props}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#303038]">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="mb-4">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";

export { Modal };
