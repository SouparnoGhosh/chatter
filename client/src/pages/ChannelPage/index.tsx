import React, { useContext, useEffect } from "react";
// import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import SidePane from "@/components/SidePane/SidePane";
import ChatRoomWindow from "@/components/ChatRoomWindow/ChatRoomWindow";
import { decodeToken } from "@/utils/utils";
import SocketContext from "@/context/SocketContext/SocketContext";

const ChannelPage: React.FC = () => {
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId: string }>();
  const socket = useContext(SocketContext);

  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken) {
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        localStorage.removeItem("token");
        navigate(0);
      }
    }
    // const socket = io("http://localhost:3200");

    // socket.on("connect_error", (error) => {
    //   console.log("Connection Error", error);
    // });

    // return () => {
    //   socket.disconnect();
    // };

    if (socket && channelId) {
      console.log("Joining room", channelId);
      socket.emit("join-room", { channelId });

      return () => {
        console.log("Leaving room", channelId);
        socket.emit("leave-room", { channelId });
      };
    }
  }, [channelId, navigate, socket]);

  return (
    <div className="flex">
      <div className="w-96">
        <SidePane />
      </div>
      <div className="flex-grow bg-blue-200">
        <ChatRoomWindow />
      </div>
    </div>
  );
};

export default ChannelPage;
