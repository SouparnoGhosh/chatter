import React from "react";

const ChatRoomLinkSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-gray-100 border border-gray-200 rounded-sm shadow-lg flex items-center animate-pulse">
      <div className="flex items-center">
        <div className="bg-gray-300 rounded-full p-1 mr-4">
          <div className="h-10 w-10 rounded-full bg-blue-gray-200" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-4 bg-blue-gray-300 rounded w-1/2"></div>
    </div>
  );
};

export default ChatRoomLinkSkeleton;
