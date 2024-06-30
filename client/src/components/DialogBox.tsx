import React, { useEffect } from "react";

interface DialogBoxProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
  isError: boolean;
}

const DialogBox: React.FC<DialogBoxProps> = ({
  message,
  isOpen,
  onClose,
  isError,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`dialog-box p-4 rounded ${
        isError ? "bg-red-500 text-white" : "bg-white text-black"
      }`}
    >
      {message}
    </div>
  );
};

export default DialogBox;
