import React, { useState, useEffect, useCallback, useContext } from "react";
// import axios from "axios";
// import debounce from "lodash.debounce";
import { FiCheck } from "react-icons/fi";
import { IoIosArrowDropdown, IoIosArrowDropup } from "react-icons/io";
import axios from "axios";
import DialogBox from "../DialogBox";
// import { io, Socket } from "socket.io-client";
import SocketContext from "@/context/SocketContext/SocketContext";

interface SearchBarProps {
  channelId: string | null;
}

interface User {
  _id: string;
  username: string;
}

const SearchBarUserAdd: React.FC<SearchBarProps> = ({ channelId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSelected, setShowSelected] = useState(false);
  const size = 20;

  const [dialogMessage, setDialogMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // const [socket, setSocket] = useState<Socket | null>(null);

  // useEffect(() => {
  //   const newSocket = io('http://localhost:3200'); // replace with your server URL
  //   setSocket(newSocket);

  //   return () => {
  //     newSocket.disconnect();
  //   };
  // }, []);

  const socket = useContext(SocketContext);

  const token = localStorage.getItem("token"); // replace with your token retrieval logic
  // console.log(token);

  const searchUsers = useCallback(
    async (term: string) => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_SERVER_URL
          }/search-users?q=${term}&channelId=${channelId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (Array.isArray(response.data)) {
          const filteredResults = response.data.filter(
            (user: User) => !selectedUsers.find((u) => u._id === user._id)
          );
          setResults(filteredResults);
        } else {
          console.error("Error: response data is not an array");
          setDialogMessage("Error searching users. Please try again.");
          setIsError(true);
          setDialogOpen(true);
        }
        console.log(response);
      } catch (error) {
        console.error("Error searching users:", error);
        setDialogMessage("Error searching users. Please try again.");
        setIsError(true);
        setDialogOpen(true);
      }
    },
    [channelId, token, selectedUsers]
  );

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchUsers(searchTerm);
    } else {
      setResults([]);
    }
  }, [searchTerm, searchUsers]);

  const addUsersToChannel = async () => {
    setLoading(true);
    setSearchTerm("");
    console.log("Adding users to channel:", selectedUsers);
    for (const user of selectedUsers) {
      try {
        console.log("Adding user:", user);
        const response = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/channels/${channelId}/addMember/${
            user._id
          }`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Successfully added user:", user);

        // Emit a socket event for each user addition
        if (socket) {
          console.log("Emitting new-message event for addUser");
          socket.emit("new-message", response.data.data);
          socket.emit("add-member", response.data.data);
          console.log(response.data.data);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Error adding user to channel:", error);

        console.error("Server response:", error.response);
        setDialogMessage("Error adding user to channel. Please try again.");
        setIsError(true);
        setDialogOpen(true);
      }
    }
    setSelectedUsers([]);
    setLoading(false);

    setDialogMessage(`Users added to channel successfully`);
    setIsError(false);
    setDialogOpen(true);
  };

  const addUser = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
    setResults(results.filter((u) => u._id !== user._id)); // Remove user from results
  };

  const removeUser = (user: User) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id)); // Remove user from selectedUsers
    setResults([...results, user]); // Add user back to results
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  return (
    <div className="flex flex-col w-full px-6 pt-4">
      <div className="flex justify-between mb-2">
        <input
          type="text"
          placeholder="Search users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 flex-grow mr-2 border border-gray-300 rounded"
        />
        <button
          onClick={addUsersToChannel}
          className={`py-1 px-4 text-white rounded ${
            loading ? "bg-gray-500" : "bg-blue-500"
          }`}
          disabled={loading}
        >
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
      <div className="relative">
        <div className="overflow-auto max-h-64 origin-top scale-y-100 shadow-lg">
          {/* Toggle icon */}
          <button
            onClick={() => setShowSelected(!showSelected)}
            className="flex items-center px-2"
          >
            {showSelected ? (
              <IoIosArrowDropup size={size} />
            ) : (
              <IoIosArrowDropdown size={size} />
            )}
            {showSelected ? "Hide" : "Show"} selected users
          </button>
          {/* Render selected users */}
          {showSelected &&
            selectedUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => removeUser(user)}
                className="p-2 cursor-pointer border border-gray-300 mb-0 flex justify-between items-center bg-blue-100"
              >
                <span>{user.username}</span>
                <FiCheck />
              </div>
            ))}
          <div className="my-2"></div>{" "}
          {/* Space between selected and suggested users */}
          {/* Render suggested users */}
          {searchTerm.length >= 3 &&
            results.map((user) => (
              <div
                key={user._id}
                onClick={() => addUser(user)}
                className="p-2 cursor-pointer border border-gray-300 mb-0"
              >
                {user.username}
              </div>
            ))}
        </div>
      </div>
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

export default SearchBarUserAdd;
