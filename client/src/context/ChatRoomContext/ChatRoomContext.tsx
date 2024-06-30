import { createContext } from "react";

// Define the shape of the context
interface ChatRoomContextProps {
  chatRoomName: string | null;
  channelId: string | null;
  setChatRoomName: (name: string) => void;
  setChannelId: (id: string) => void;
}

// Create the context
const ChatRoomContext = createContext<ChatRoomContextProps>({
  chatRoomName: null,
  channelId: null,
  setChatRoomName: () => {},
  setChannelId: () => {},
});

export default ChatRoomContext;
