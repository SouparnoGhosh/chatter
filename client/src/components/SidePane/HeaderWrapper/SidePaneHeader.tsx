import React, { useEffect, useState } from "react";
import { MdChat } from "react-icons/md";
import { size } from "@/utils/utils";
import SidePaneHeaderMenuTooltip from "../../Tooltips/SidePaneHeaderMenuTooltip";
import { useNavigate } from "react-router-dom";
import { decodeToken } from "@/utils/utils";

const SidePaneHeader: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken) {
      setUsername(decodedToken.username);
    }
  }, []);

  const handleNewChannelClick = () => {
    navigate("/create-channel");
  };

  return (
    <div className="flex items-center justify-between pt-3 pb-1 bg-blue-gray-300 text-black">
      <div className="flex items-center pl-2">
        <div>
          <p className="text-sm text-gray-500">Logged in as:</p>
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 hover:text-xl transition-all duration-200 ease-in-out">
            {username}
          </h2>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <MdChat
          size={size}
          title="New Channel"
          className="hover:text-blue-500 cursor-pointer"
          onClick={handleNewChannelClick}
        />
        <SidePaneHeaderMenuTooltip />
      </div>
    </div>
  );
};

export default SidePaneHeader;
