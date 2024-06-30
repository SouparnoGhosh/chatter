import { size } from "@/utils/utils";
import React, { useState, useEffect, useRef } from "react";
import { MdMoreVert } from "react-icons/md";
// import { useNavigate } from "react-router-dom";

const SidePaneHeaderMenuTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  // const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    console.log("Logging out...");
    setIsVisible(false);
    window.location.reload();
  };

  // const handleDeleteProfile = () => {
  //   console.log("Navigating to delete profile page...");
  //   // Add your delete profile logic here
  //   setIsVisible(false);
  //   navigate("/delete-profile");
  // };

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
            title="Menu"
            className="hover:text-blue-500"
          />
        </button>
      </div>

      {isVisible && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
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
              Log out
            </a>
            {/* <a
              href="#"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={handleDeleteProfile}
            >
              Delete Profile
            </a> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidePaneHeaderMenuTooltip;
