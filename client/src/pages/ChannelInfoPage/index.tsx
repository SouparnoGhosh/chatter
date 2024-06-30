// client/src/pages/ChannelInfoPage.tsx

import React from "react";
import ChannelInfo from "@/components/ChannelInfo/ChannelInfo.tsx";
import ChatRoomHeader from "@/components/ChatRoomWindow/ChatRoomHeader";
import SidePane from "@/components/SidePane/SidePane";
// import { useParams } from "react-router-dom";

const ChannelInfoPage: React.FC = () => {
  //   const { channelId = "" } = useParams<{ channelId: string }>();

  return (
    <div className="flex">
      <SidePane />
      <div className="flex flex-col flex-grow">
        <ChatRoomHeader isChannelInfoVisible={true} />
        <ChannelInfo />
      </div>
    </div>
  );
};

export default ChannelInfoPage;
