import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InputTextArea from "./InputTextArea";
import MessageList from "./Messages/MessageList";
import ChatRoomHeader from "./ChatRoomHeader";
import ChannelInfo from "../ChannelInfo/ChannelInfo";
import SocketContext from "@/context/SocketContext/SocketContext";

const ChatRoomWindow: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [showChannelInfo, setShowChannelInfo] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    setShowChannelInfo(false);

    if (socket) {
      console.log("Joining room", channelId);
      socket.emit("join-room", { channelId });

      return () => {
        socket.emit("leave-room", { channelId });
      };
    }
  }, [channelId, socket]);

  if (!channelId) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-blue-gray-200 to-blue-300"></div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatRoomHeader
        onChannelNameClick={() => setShowChannelInfo(true)}
        isChannelInfoVisible={showChannelInfo}
      />
      {showChannelInfo ? (
        <ChannelInfo
          channelId={channelId}
          onClose={() => setShowChannelInfo(false)}
        />
      ) : (
        <>
          <MessageList />
          <InputTextArea />
        </>
      )}
    </div>
  );
};

export default ChatRoomWindow;
