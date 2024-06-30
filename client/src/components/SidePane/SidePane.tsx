import React, { useContext, useEffect } from "react";
import ChatRoomLink from "./ChatRoomLink";
import HeaderSearchBarWrapper from "./HeaderWrapper/HeaderSearchBarWrapper";
import ChatRoomLinkSkeleton from "../Loaders/ChatRoomLinkSkeleton";
import axios from "axios";
import DialogBox from "../DialogBox";
import SocketContext from "@/context/SocketContext/SocketContext";

const SidePane: React.FC = () => {
  // console.log("SidePane rendered");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [channels, setChannels] = React.useState<
    { name: string; _id: string }[]
  >([]);
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMessage, setDialogMessage] = React.useState("");

  const socket = useContext(SocketContext);

  useEffect(() => {
    const handleAddMember = (data: {message: string}) => {
      console.log(data)
    }
    socket?.on("add-member", handleAddMember);

    return () => {
      socket?.off("add-member", handleAddMember);
    }
  }, [socket])

  useEffect(() => {
    let isMounted = true;
    const fetchChannels = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const serverURL = import.meta.env.VITE_SERVER_URL;
      try {
        const response = await axios.get(`${serverURL}/channels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (isMounted && Array.isArray(response.data)) {
          // Only update the channels state if the fetched channels are different
          if (isMounted && Array.isArray(response.data)) {
            setChannels(response.data);
          }
        }
        setLoading(false);
      } catch (error) {
        setDialogMessage("Error fetching channels");
        setDialogOpen(true);
        setLoading(false);
      }
    };

    fetchChannels();

    return () => {
      isMounted = false;
    };
  }, []);

  const closeDialog = () => {
    setDialogOpen(false);
    setDialogMessage("");
  };

  return (
    <div className="h-screen w-96 bg-white text-black overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
      <HeaderSearchBarWrapper />
      <div className="bg-white text-black overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent hover:scrollbar-thumb-gray-600">
        {loading ? (
          <ChatRoomLinkSkeleton />
        ) : (
          channels.map((channel, index) => (
            <ChatRoomLink
              key={index}
              chatroomname={channel.name}
              channelId={channel._id}
            />
          ))
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
    </div>
  );
};

export default SidePane;
