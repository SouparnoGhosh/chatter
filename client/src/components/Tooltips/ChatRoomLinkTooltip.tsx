import { size } from "@/utils/utils";
import React, { useState, useEffect, useRef } from "react";
import { MdMoreVert } from "react-icons/md";

const ChatRoomHeaderMenuTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    console.log("Logging out...");
    setIsVisible(false);
  };

  const handleToggleTheme = () => {
    console.log("Toggling theme...");
    setIsVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={tooltipRef}>
      <div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(!isVisible);
          }}
        >
          <MdMoreVert
            size={size}
            title="More"
            className="hover:text-blue-500"
          />
        </button>
      </div>

      {isVisible && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white z-10">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={handleLogout}
            >
              Leave Group
            </a>
            <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={handleToggleTheme}
            >
              Delete Chat
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomHeaderMenuTooltip;
