import { useEffect, useState } from "react";
import ChatRoomHeaderMenuTooltip from "../Tooltips/ChatRoomHeaderMenuTooltip";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface ChatRoomHeaderProps {
  isChannelInfoVisible: boolean;
}

const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({
  isChannelInfoVisible,
}) => {
  const [channelName, setChannelName] = useState("");

  const { channelId } = useParams<{ channelId: string }>();

  useEffect(() => {
    const fetchChannelName = async () => {
      const token = localStorage.getItem("token");
      const serverURL = import.meta.env.VITE_SERVER_URL;
      try {
        const response = await axios.get(
          `${serverURL}/channels/${channelId}/name`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setChannelName(response.data.name);
      } catch (error) {
        console.error("Error fetching channel name", error);
      }
    };

    fetchChannelName();
  }, [channelId]);

  const navigate = useNavigate();

  const handleChannelNameClick = () => {
    if (!isChannelInfoVisible) {
      navigate(`/channel/${channelId}/info`);
    }
  };
  return (
    <div className="flex justify-between items-center p-2 pb-4 border-b border-gray-200 bg-blue-gray-300">
      <div
        className={`text-lg font-bold ${
          !isChannelInfoVisible ? "cursor-pointer hover:text-blue-600" : ""
        }`}
        onClick={handleChannelNameClick}
      >
        <h2 className="text-3xl font-bold pl-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:text-4xl transition-all duration-200 ease-in-out">
          {channelName}
        </h2>
      </div>
      <div className="flex space-x-2">
        <ChatRoomHeaderMenuTooltip />
      </div>
    </div>
  );
};

export default ChatRoomHeader;
