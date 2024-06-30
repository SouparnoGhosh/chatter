import axios, { AxiosError } from "axios";
import React, { useState, useEffect, useRef, useContext } from "react";
import { MdMoreVert } from "react-icons/md";
import DialogBox from "../DialogBox";
import { useParams } from "react-router-dom";
import SocketContext from "@/context/SocketContext/SocketContext";

interface UserComponentTooltipProps {
  isMemberAdmin: boolean;
  memberId: string;
  isLoggedInUserAdmin: boolean;
}

interface ErrorResponse {
  error: string;
}

const UserComponentTooltip: React.FC<UserComponentTooltipProps> = ({
  isMemberAdmin,
  memberId,
  isLoggedInUserAdmin,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const { channelId } = useParams<{ channelId: string }>();
  const socket = useContext(SocketContext);

  const removeMember = async (channelId: string, memberId: string) => {
    const token = localStorage.getItem("token");
    const serverURL = import.meta.env.VITE_SERVER_URL;
    try {
      const response = await axios.post(
        `${serverURL}/channels/${channelId}/removeMember/${memberId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDialogMessage(response.data.message);
      if (socket) {
        console.log("Emitting new-message event for removeMember");
        socket.emit("new-message", response.data.data);
      }
      setIsError(false);
      setDialogOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        /* The request was made and the server responded with a status code */
        const errorData = axiosError.response.data as ErrorResponse;
        setDialogMessage(errorData.error);
      } else if (axiosError.request) {
        /* The request was made but no response was received */
        setDialogMessage("No response received");
      } else {
        /* Something happened in setting up the request that triggered an Error */
        setDialogMessage("Error: " + axiosError.message);
      }
      setIsError(true);
      setDialogOpen(true);
    }
  };

  const handleRemoveMember = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!channelId) {
      setDialogMessage("Channel ID is not defined");
      setIsError(true);
      setDialogOpen(true);
      return;
    }
    removeMember(channelId, memberId);
    setIsVisible(false);
  };

  const makeAdmin = async (channelId: string, memberId: string) => {
    const token = localStorage.getItem("token");
    const serverURL = import.meta.env.VITE_SERVER_URL;
    try {
      const response = await axios.post(
        `${serverURL}/channels/${channelId}/makeAdmin/${memberId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDialogMessage(response.data.message);
      if (socket) {
        console.log("Emitting new-message event for makeAdmin");
        socket.emit("new-message", response.data.data);
        socket.emit("make-admin", response.data.data);
        console.log(response.data.data)
      }
      setIsError(false);
      setDialogOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as ErrorResponse;
        setDialogMessage(errorData.error);
      } else if (axiosError.request) {
        setDialogMessage("No response received");
      } else {
        setDialogMessage("Error: " + axiosError.message);
      }
      setIsError(true);
      setDialogOpen(true);
    }
  };

  const handleMakeAdmin = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!channelId) {
      setDialogMessage("Channel ID is not defined");
      setIsError(true);
      setDialogOpen(true);
      return;
    }
    makeAdmin(channelId, memberId);
    setIsVisible(false);
  };

  const removeAdmin = async (channelId: string, memberId: string) => {
    const token = localStorage.getItem("token");
    const serverURL = import.meta.env.VITE_SERVER_URL;
    try {
      const response = await axios.post(
        `${serverURL}/channels/${channelId}/removeAdmin/${memberId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDialogMessage(response.data.message);
      if (socket) {
        console.log("Emitting new-message event for removeAdmin");
        socket.emit("new-message", response.data.data);
        socket.emit("remove-admin", response.data.data);
        console.log(response.data.data)
      }
      setIsError(false);
      setDialogOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as ErrorResponse;
        setDialogMessage(errorData.error);
      } else if (axiosError.request) {
        setDialogMessage("No response received");
      } else {
        setDialogMessage("Error: " + axiosError.message);
      }
      setIsError(true);
      setDialogOpen(true);
    }
  };

  const handleRemoveAdmin = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!channelId) {
      setDialogMessage("Channel ID is not defined");
      setIsError(true);
      setDialogOpen(true);
      return;
    }
    removeAdmin(channelId, memberId);
    setIsVisible(false);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
    setIsError(false);
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

  if (!isLoggedInUserAdmin) {
    return null;
  }

  return (
    <div className="relative inline-block text-left" ref={tooltipRef}>
      <div>
        <button
          type="button"
          title="Options"
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(!isVisible);
          }}
        >
          <MdMoreVert />
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
              onClick={handleRemoveMember}
            >
              Remove Member
            </a>
            {isMemberAdmin ? (
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={handleRemoveAdmin}
              >
                Remove Admin
              </a>
            ) : (
              <a
                href="#"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={handleMakeAdmin}
              >
                Make Admin
              </a>
            )}
          </div>
        </div>
      )}
      <div className="fixed bottom-0 right-0 m-6">
        <DialogBox
          message={dialogMessage}
          isOpen={dialogOpen}
          onClose={closeDialog}
          isError={isError}
        />
      </div>
    </div>
  );
};

export default UserComponentTooltip;
