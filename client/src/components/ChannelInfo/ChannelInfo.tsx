/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useContext, useEffect, useState } from "react";
import { IoIosArrowDropdown, IoIosArrowDropup } from "react-icons/io";
import UserComponent from "./UserComponent";
import axios from "axios";
import DialogBox from "@/components/DialogBox";
import SearchBarUserAdd from "./SearchBarUserAdd";
import { decodeToken } from "@/utils/utils";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import SocketContext from "@/context/SocketContext/SocketContext";

interface Channel {
  _id: string;
  name: string;
  users: string[];
  creator: string;
  administrators: string[];
}

interface User {
  userId: string;
  username: string;
}

const ChannelInfo: React.FC = () => {
  const [isUserListVisible, setUserListVisible] = useState(true);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoggedInUserAdmin, setILoggedInUserAdmin] = useState(false);
  const { channelId = "" } = useParams<{ channelId: string }>();

  const creator = users.find((user) => user.userId === channel?.creator);
  const creatorName = creator ? creator.username : "Unknown";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const toggleUserList = () => {
    setUserListVisible(!isUserListVisible);
  };

  const fetchChannel = useCallback(async () => {
    const token = localStorage.getItem("token");
    const serverURL = import.meta.env.VITE_SERVER_URL;
    try {
      const response = await axios.get(`${serverURL}/channels/${channelId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChannel(response.data);
      const decodedToken = decodeToken();
      if (decodedToken) {
        setILoggedInUserAdmin(
          response.data.administrators.includes(decodedToken.userId)
        );
      }
    } catch (error) {
      console.error("Error fetching channel", error);
    }
  }, [channelId]);

  console.log("Channel Info component rendered");

  useEffect(() => {
    if (channelId && !channel) {
      fetchChannel();
    }
  }, [channelId, channel, fetchChannel]);

  useEffect(() => {
    const fetchUserNames = async () => {
      const token = localStorage.getItem("token");
      const serverURL = import.meta.env.VITE_SERVER_URL;
      try {
        const response = await axios.post(
          `${serverURL}/users/names`,
          { userIds: channel?.users },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching user names", error);
        setDialogMessage("An error occurred while fetching user names.");
        setIsError(true);
        setDialogOpen(true);
      }
    };

    if (channel && users.length === 0) {
      fetchUserNames();
    }
  }, [channel, users]);

  console.log("Is logged in user admin:", isLoggedInUserAdmin);

  const socket = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on("new-message", (data) => {
        console.log("New message event received:", data);
      });
    }
  }, [socket]);

  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   let userId = null;

  //   if (token) {
  //     const decodedToken = decodeToken();
  //     // @ts-ignore
  //     userId = decodedToken.userId;
  //   }
  //   if (socket) {
  //     socket.on("make-admin", (data) => {
  //       console.log("User ID:", userId);
  //       console.log("New Admin:", data.newAdmin);
  //       if (userId === data.newAdmin) {
  //         console.log("Make admin event received:", data);
  //         setILoggedInUserAdmin(true);
  //       }
  //     });

  //     socket.on("remove-admin", (data) => {
  //       console.log("User ID:", userId);
  //       console.log("Removed Admin:", data.removedAdmin);
  //       if (userId === data.removedAdmin) {
  //         console.log("Remove admin event received:", data);
  //         setILoggedInUserAdmin(false);
  //       }
  //     });
  //   }

  //   return () => {
  //     if (socket) {
  //       socket.off("make-admin");
  //       socket.off("remove-admin");
  //     }
  //   };
  // }, [socket]);

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
    setIsError(false);
  };

  const navigate = useNavigate();

  return (
    <div className="p-4 bg-white h-full relative">
      <button
        className="absolute top-0 right-0 m-5"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft size={24} />
      </button>
      {channel && <h1 className="text-2xl font-bold mb-4">{channel.name}</h1>}
      <p className="mb-2 text-gray-500">Created by: {creatorName}</p>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold mb-2">Users:</h2>
        <button onClick={toggleUserList}>
          {isUserListVisible ? <IoIosArrowDropup /> : <IoIosArrowDropdown />}
        </button>
      </div>
      {isUserListVisible && channel && (
        <ul className="divide-y divide-gray-200">
          {users.map((user, index) => (
            <UserComponent
              key={index}
              username={user.username}
              userId={user.userId}
              isAdmin={channel.administrators.includes(user.userId)}
              isLoggedInUserAdmin={isLoggedInUserAdmin}
            />
          ))}
        </ul>
      )}
      {isLoggedInUserAdmin && <SearchBarUserAdd channelId={channelId} />}
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

export default ChannelInfo;
