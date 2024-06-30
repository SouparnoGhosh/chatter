import SocketContext from "@/context/SocketContext/SocketContext";
import axios, { AxiosError } from "axios";
import React, { useState, useEffect, useRef, useContext } from "react";
import { MdMoreVert } from "react-icons/md";
import DialogBox from "../DialogBox";
import { useParams } from "react-router-dom";

interface MessageTooltipProps {
  isOwnMessage: boolean;
  isLoggedInUserAdmin: boolean;
  messageId: string;
}

interface ErrorResponse {
  error: string;
}

const MessageTooltip: React.FC<MessageTooltipProps> = ({
  isOwnMessage,
  isLoggedInUserAdmin,
  messageId,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const tooltipRef = useRef<HTMLDivElement>(null);

  const serverURL = import.meta.env.VITE_SERVER_URL as string;
  const socket = useContext(SocketContext);
  const { channelId } = useParams<{ channelId: string }>();

  const handleDeletion = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.delete(
        `${serverURL}/channels/${channelId}/messages/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data.message);
      setIsVisible(false);

      /* Emit a socket event here */
      if (socket) {
        console.log(`Deleting message: ${messageId} from channel ${channelId}`);

        socket.emit("delete-message", { channelId, messageId });
      }
    } catch (error) {
      const axiosError = error as AxiosError;

      /* Check if the error was caused by a timeout */
      if (axiosError.code === "ECONNABORTED") {
        setDialogMessage("Request timed out. Please try again.");
      } else if (axiosError.response) {
        const errorData = axiosError.response.data as ErrorResponse;
        if (errorData && errorData.error) {
          setDialogMessage(errorData.error);
        } else {
          setDialogMessage("Unexpected server response. Please try again.");
        }
      }
      setDialogOpen(true);
    } finally {
      setIsVisible(false);
    }
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

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  return (
    (isOwnMessage || isLoggedInUserAdmin) && (
      <div className="relative inline-block text-left" ref={tooltipRef}>
        <div className="pt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsVisible(!isVisible);
            }}
          >
            <MdMoreVert />
          </button>
        </div>

        {isVisible && (
          <div
            className={`origin-top-${
              isOwnMessage ? "right" : "left"
            } absolute ${
              isOwnMessage ? "right-0" : "left-0"
            } mt-2 w-56 rounded-md shadow-lg bg-white z-10`}
          >
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
                onClick={handleDeletion}
              >
                Delete Message
              </a>
            </div>
          </div>
        )}
        <div className="fixed bottom-0 right-0 m-6">
          <DialogBox
            message={dialogMessage}
            isOpen={dialogOpen}
            onClose={closeDialog}
            isError={true}
          />
        </div>
      </div>
    )
  );
};

export default MessageTooltip;
