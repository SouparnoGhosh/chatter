import React, { useState, ReactNode } from "react";
import ChatRoomContext from "./ChatRoomContext";

interface ChatRoomContextProviderProps {
  children: ReactNode;
}

// Create the context provider
const ChatRoomContextProvider: React.FC<ChatRoomContextProviderProps> = ({
  children,
}) => {
  const [chatRoomName, setChatRoomName] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);

  return (
    <ChatRoomContext.Provider
      value={{ chatRoomName, setChatRoomName, channelId, setChannelId }}
    >
      {children}
    </ChatRoomContext.Provider>
  );
};

export default ChatRoomContextProvider;
