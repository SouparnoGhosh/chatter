import React from "react";
import { Link } from "react-router-dom";

interface ChatRoomLinkProps {
  chatroomname: string;
  channelId: string;
}

const ChatRoomLink: React.FC<ChatRoomLinkProps> = ({
  chatroomname,
  channelId,
}) => {
  return (
    <Link
      to={`/channel/${channelId}`}
      className="pl-6 py-2 bg-gray-100 border border-gray-200 rounded-sm shadow-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-between"
    >
      <span>{chatroomname}</span>
    </Link>
  );
};

export default ChatRoomLink;