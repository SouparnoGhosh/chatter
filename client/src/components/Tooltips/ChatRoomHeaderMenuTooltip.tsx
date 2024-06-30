import { size } from "@/utils/utils";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { MdMoreVert } from "react-icons/md";
import { useNavigate, useParams } from "react-router-dom";
import DialogBox from "../DialogBox";

const ChatRoomHeaderMenuTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLeaveSuccessful, setIsLeaveSuccessful] = useState(false);

  const { channelId } = useParams<{ channelId: string }>();

  /* Close the tooltip when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLeaveChannel = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    const serverURL = import.meta.env.VITE_SERVER_URL;
    try {
      await axios.post(
        `${serverURL}/channels/${channelId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDialogMessage("Successfully left channel");
      setIsError(false);
      setDialogOpen(true);
      setIsLeaveSuccessful(true); // set isLeaveSuccessful to true when leave is successful
    } catch (error) {
      // console.error("Error leaving channel", error);
      setDialogMessage("An error occurred while leaving the channel.");
      setIsError(true);
      setDialogOpen(true);
      setIsLeaveSuccessful(false); // set isLeaveSuccessful to false when there's an error
    }
    setIsVisible(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isLeaveSuccessful && !dialogOpen) {
      navigate("/");
    }
  }, [isLeaveSuccessful, dialogOpen, navigate]);

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
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <a
              href="#"
              className={`block px-4 py-2 text-sm ${
                isLoading ? "text-gray-400" : "text-gray-700 hover:bg-gray-100"
              }`}
              role="menuitem"
              onClick={handleLeaveChannel}
              aria-disabled={isLoading}
            >
              Leave Channel
            </a>
          </div>
          <div className="fixed bottom-0 right-0 m-6">
            <DialogBox
              message={dialogMessage}
              isOpen={dialogOpen}
              onClose={() => setDialogOpen(false)}
              isError={isError}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoomHeaderMenuTooltip;
